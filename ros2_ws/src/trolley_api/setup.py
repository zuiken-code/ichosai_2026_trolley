import os
from glob import glob

from setuptools import find_packages, setup

package_name = 'trolley_api'


def files_in(pattern):
    """glob のうちファイルだけを返す。

    data_files はディレクトリを受け取れないので、
    サブディレクトリを持つ配信物では明示的に落とす必要がある。
    """
    return [path for path in glob(pattern) if os.path.isfile(path)]


setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),

        # スマートフォン向けの操作画面
        ('share/' + package_name + '/web', glob('web/*')),

        # 床タグ検出ページ（HTTPSで配る。detector_server.py 参照）
        ('share/' + package_name + '/web_detector',
            files_in('web_detector/*')),
        ('share/' + package_name + '/web_detector/vendor/js-aruco2',
            files_in('web_detector/vendor/js-aruco2/*')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='zuiken',
    maintainer_email='zuiken2022robo@gmail.com',
    description='TODO: Package description',
    license='TODO: License declaration',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            # launch から --host / --port を受け取れるのは run_server の方。
            # api_server:main は待ち受け先が決め打ちで、渡した引数を
            # 読まないため、launch の api_host / api_port が効かなかった。
            'api_server = trolley_api.run_server:main',

            # 設置作業用。検出ページだけを単体で立てる。
            'detector_server = trolley_api.detector_server:main',
        ],
    },
)
