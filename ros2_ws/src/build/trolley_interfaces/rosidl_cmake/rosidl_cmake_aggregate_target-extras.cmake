# generated from rosidl_cmake/cmake/rosidl_cmake_aggregate_target-extras.cmake.in

# Create a convenience aggregate target trolley_interfaces::trolley_interfaces
# that links all generated interface targets, so downstream packages can use
# a single modern CMake target name instead of ${trolley_interfaces_TARGETS}.
if(trolley_interfaces_TARGETS AND NOT TARGET trolley_interfaces::trolley_interfaces)
  add_library(trolley_interfaces::trolley_interfaces INTERFACE IMPORTED)
  set_target_properties(trolley_interfaces::trolley_interfaces PROPERTIES
    INTERFACE_LINK_LIBRARIES "${trolley_interfaces_TARGETS}")
endif()
