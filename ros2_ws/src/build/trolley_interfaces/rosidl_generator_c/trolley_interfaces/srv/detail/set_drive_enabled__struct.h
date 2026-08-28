// generated from rosidl_generator_c/resource/idl__struct.h.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_enabled.h"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__STRUCT_H_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__STRUCT_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>


// Constants defined in the message

/// Struct defined in srv/SetDriveEnabled in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Request
{
  bool enabled;
} trolley_interfaces__srv__SetDriveEnabled_Request;

// Struct for a sequence of trolley_interfaces__srv__SetDriveEnabled_Request.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Request__Sequence
{
  trolley_interfaces__srv__SetDriveEnabled_Request * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveEnabled_Request__Sequence;

// Constants defined in the message

// Include directives for member types
// Member 'message'
#include "rosidl_runtime_c/string.h"

/// Struct defined in srv/SetDriveEnabled in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Response
{
  bool success;
  rosidl_runtime_c__String message;
} trolley_interfaces__srv__SetDriveEnabled_Response;

// Struct for a sequence of trolley_interfaces__srv__SetDriveEnabled_Response.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Response__Sequence
{
  trolley_interfaces__srv__SetDriveEnabled_Response * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveEnabled_Response__Sequence;

// Constants defined in the message

// Include directives for member types
// Member 'info'
#include "service_msgs/msg/detail/service_event_info__struct.h"

// constants for array fields with an upper bound
// request
enum
{
  trolley_interfaces__srv__SetDriveEnabled_Event__request__MAX_SIZE = 1
};
// response
enum
{
  trolley_interfaces__srv__SetDriveEnabled_Event__response__MAX_SIZE = 1
};

/// Struct defined in srv/SetDriveEnabled in the package trolley_interfaces.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Event
{
  service_msgs__msg__ServiceEventInfo info;
  trolley_interfaces__srv__SetDriveEnabled_Request__Sequence request;
  trolley_interfaces__srv__SetDriveEnabled_Response__Sequence response;
} trolley_interfaces__srv__SetDriveEnabled_Event;

// Struct for a sequence of trolley_interfaces__srv__SetDriveEnabled_Event.
typedef struct trolley_interfaces__srv__SetDriveEnabled_Event__Sequence
{
  trolley_interfaces__srv__SetDriveEnabled_Event * data;
  /// The number of valid items in data
  size_t size;
  /// The number of allocated items in data
  size_t capacity;
} trolley_interfaces__srv__SetDriveEnabled_Event__Sequence;

#ifdef __cplusplus
}
#endif

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__STRUCT_H_
