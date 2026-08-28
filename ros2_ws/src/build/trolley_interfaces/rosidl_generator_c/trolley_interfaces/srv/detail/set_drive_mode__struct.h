// generated from rosidl_generator_c/resource/idl__struct.h.em
// with input from trolley_interfaces:srv/SetDriveMode.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_mode.h"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__STRUCT_H_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__STRUCT_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>


// Constants defined in the message

/// Struct defined in srv/SetDriveMode in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveMode_Request
{
  int32_t mode;
} trolley_interfaces__srv__SetDriveMode_Request;

// Struct for a sequence of trolley_interfaces__srv__SetDriveMode_Request.
typedef struct trolley_interfaces__srv__SetDriveMode_Request__Sequence
{
  trolley_interfaces__srv__SetDriveMode_Request * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveMode_Request__Sequence;

// Constants defined in the message

// Include directives for member types
// Member 'message'
#include "rosidl_runtime_c/string.h"

/// Struct defined in srv/SetDriveMode in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveMode_Response
{
  bool success;
  rosidl_runtime_c__String message;
} trolley_interfaces__srv__SetDriveMode_Response;

// Struct for a sequence of trolley_interfaces__srv__SetDriveMode_Response.
typedef struct trolley_interfaces__srv__SetDriveMode_Response__Sequence
{
  trolley_interfaces__srv__SetDriveMode_Response * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveMode_Response__Sequence;

// Constants defined in the message

// Include directives for member types
// Member 'info'
#include "service_msgs/msg/detail/service_event_info__struct.h"

// constants for array fields with an upper bound
// request
enum
{
  trolley_interfaces__srv__SetDriveMode_Event__request__MAX_SIZE = 1
};
// response
enum
{
  trolley_interfaces__srv__SetDriveMode_Event__response__MAX_SIZE = 1
};

/// Struct defined in srv/SetDriveMode in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveMode_Event
{
  service_msgs__msg__ServiceEventInfo info;
  trolley_interfaces__srv__SetDriveMode_Request__Sequence request;
  trolley_interfaces__srv__SetDriveMode_Response__Sequence response;
} trolley_interfaces__srv__SetDriveMode_Event;

// Struct for a sequence of trolley_interfaces__srv__SetDriveMode_Event.
typedef struct trolley_interfaces__srv__SetDriveMode_Event__Sequence
{
  trolley_interfaces__srv__SetDriveMode_Event * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveMode_Event__Sequence;

#ifdef __cplusplus
}
#endif

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__STRUCT_H_
