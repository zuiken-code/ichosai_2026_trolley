from setuptools import find_packages
from setuptools import setup

setup(
    name='trolley_interfaces',
    version='0.0.0',
    packages=find_packages(
        include=('trolley_interfaces', 'trolley_interfaces.*')),
)
