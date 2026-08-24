import sys
if sys.prefix == '/usr':
    sys.real_prefix = sys.prefix
    sys.prefix = sys.exec_prefix = '/home/zuiken/Documents/ichosai_2026_trolley/ros2_ws/install/trolley_bringup'
