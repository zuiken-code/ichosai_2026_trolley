from setuptools import find_packages, setup

package_name = 'trolley_cmd_mux'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='zuiken',
    maintainer_email='zuiken2022robo@gmail.com',
    description='Joy(Switch) とスマートフォンの /cmd_vel を調停するノード',
    license='TODO: License declaration',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            'cmd_vel_mux = trolley_cmd_mux.cmd_vel_mux_node:main',
        ],
    },
)
