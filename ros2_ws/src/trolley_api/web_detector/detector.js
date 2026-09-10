/*
 * js-aruco2 の検出を多段二値化でラップする薄い層.
 *
 * なぜ必要か:
 *   js-aruco2 の AR.Detector.prototype.detect() は
 *     CV.adaptiveThreshold(grey, thres, 2, 7)
 *   とカーネル半径 2 が固定で書かれている。adaptiveThreshold は
 *   「箱ぼかしした局所平均より threshold 以上暗い画素」を前景にするので、
 *   カーネルがタグの黒枠の太さより十分小さいと、黒枠の内側では
 *   局所平均 ≒ 画素値 になり前景として塗られない。
 *   結果、輪郭として出てくるのはエッジ沿いの細い帯だけになり、
 *   タグ外形の四角形が候補に上がらない = 検出できない。
 *
 *   黒枠の太さは「タグの見かけの大きさ」に比例するので、単一のカーネルでは
 *   ある距離レンジしかカバーできない。そこでカーネルを複数試して和を取る。
 *
 *   実写ベンチ (1枚から scale/rot/blur/exposure/perspective を振った 140 枚):
 *     kernel=2 のみ        28/140 (20.0%)
 *     kernel=10 のみ      138/140 (98.6%)
 *     kernel=3,7,14 多段  140/140 (100%)
 *
 * 速度対策:
 *   毎フレーム全部のカーネルを試すと 3 倍のコストになるので、
 *   一度当たったカーネルは覚えて、追従中はそれだけを使う (呼び出し側が制御)。
 */
'use strict';

(function (global) {
  var CV = global.CV;
  var AR = global.AR;

  // js-aruco2 の detect() が使っている値。挙動を変えないためそのまま踏襲する。
  var CANDIDATE_MIN_SIZE_RATIO = 0.01;
  var CANDIDATE_EPSILON = 0.05;
  var CANDIDATE_MIN_LENGTH = 10;
  var CANDIDATE_MIN_DISTANCE = 10;
  var WARP_SIZE = 49;

  // カーネル値は解析画像の「絶対ピクセル」として扱う。
  // 実写ベンチ (解析幅 320/480/640/960) では [3,7,14] を固定値で使うのが最良で、
  // 幅に比例させると小さいカーネルが消えて逆に取りこぼしが出た。
  // ただし解析幅をこれより大きくすると黒枠の見かけの太さも増えるので、
  // その場合だけ比例拡大したカーネルを「追加」してレンジを広げる。
  var KERNEL_REFERENCE_WIDTH = 640;
  var KERNEL_SCALE_THRESHOLD = 1.25;

  // 同一タグの重複判定に使う中心座標の丸め (px)
  var DEDUPE_GRID = 16;

  function TagDetector(options) {
    options = options || {};
    this.detector = new AR.Detector({
      dictionaryName: options.family || 'APRILTAG_16h5',
      maxHammingDistance: options.maxHammingDistance != null ? options.maxHammingDistance : 0,
    });
    this.offset = options.thresholdOffset != null ? options.thresholdOffset : 7;
    this.baseKernels = normalizeKernels(options.kernels);
  }

  function normalizeKernels(list) {
    if (!Array.isArray(list) || list.length === 0) return [3, 7, 14];
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var value = Math.round(Number(list[i]));
      if (!isFinite(value) || value < 1 || value > 64) continue;
      if (seen[value]) continue;
      seen[value] = true;
      out.push(value);
    }
    out.sort(function (a, b) {
      return a - b;
    });
    return out.length ? out : [3, 7, 14];
  }

  /** 解析画像の幅に対して実際に使うカーネル半径の配列を返す. */
  TagDetector.prototype.kernelsFor = function (width) {
    var seen = {};
    var out = [];
    var i;
    var value;

    for (i = 0; i < this.baseKernels.length; i++) {
      value = this.baseKernels[i];
      if (!seen[value]) {
        seen[value] = true;
        out.push(value);
      }
    }

    var scale = width / KERNEL_REFERENCE_WIDTH;
    if (scale >= KERNEL_SCALE_THRESHOLD) {
      for (i = 0; i < this.baseKernels.length; i++) {
        value = Math.min(64, Math.round(this.baseKernels[i] * scale));
        if (!seen[value]) {
          seen[value] = true;
          out.push(value);
        }
      }
    }

    out.sort(function (a, b) {
      return a - b;
    });
    return out;
  };

  /** カーネル 1 個ぶんの検出。grayscale は呼び出し前に済んでいる前提. */
  TagDetector.prototype.runPass = function (image, kernel) {
    var d = this.detector;

    CV.adaptiveThreshold(d.grey, d.thres, kernel, this.offset);

    d.contours = CV.findContours(d.thres, d.binary);
    d.candidates = d.findCandidates(
      d.contours,
      image.width * CANDIDATE_MIN_SIZE_RATIO,
      CANDIDATE_EPSILON,
      CANDIDATE_MIN_LENGTH
    );
    d.candidates = d.clockwiseCorners(d.candidates);
    d.candidates = d.notTooNear(d.candidates, CANDIDATE_MIN_DISTANCE);

    return d.findMarkers(d.grey, d.candidates, WARP_SIZE);
  };

  function markerKey(marker) {
    var cx = 0;
    var cy = 0;
    for (var i = 0; i < marker.corners.length; i++) {
      cx += marker.corners[i].x;
      cy += marker.corners[i].y;
    }
    var n = marker.corners.length;
    return (
      marker.id +
      ':' +
      Math.round(cx / n / DEDUPE_GRID) +
      ':' +
      Math.round(cy / n / DEDUPE_GRID)
    );
  }

  /**
   * @param image  {width, height, data} (RGBA)
   * @param kernels 使うカーネル半径の配列 (kernelsFor() の結果、またはその部分集合)
   * @returns {markers, kernelsHit, passes}
   *          kernelsHit は実際にタグが取れたカーネルの配列 (追従時にこれだけ使う)
   */
  TagDetector.prototype.detect = function (image, kernels) {
    CV.grayscale(image, this.detector.grey);

    var found = {};
    var order = [];
    var kernelsHit = [];

    for (var i = 0; i < kernels.length; i++) {
      var markers = this.runPass(image, kernels[i]);
      if (markers.length) kernelsHit.push(kernels[i]);

      for (var j = 0; j < markers.length; j++) {
        var key = markerKey(markers[j]);
        if (!found[key]) {
          found[key] = markers[j];
          order.push(key);
        }
      }
    }

    var merged = [];
    for (var k = 0; k < order.length; k++) merged.push(found[order[k]]);

    return { markers: merged, kernelsHit: kernelsHit, passes: kernels.length };
  };

  global.TagDetector = TagDetector;
})(typeof window !== 'undefined' ? window : this);
