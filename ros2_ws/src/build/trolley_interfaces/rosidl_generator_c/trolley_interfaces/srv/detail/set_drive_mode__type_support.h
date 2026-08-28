// generated from rosidl_generator_c/resource/idl__type_support.h.em
// with input from trolley_interfaces:srv/SetDriveMode.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_mode.h"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TYPE_SUPPORT_H_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TYPE_SUPPORT_H_

#include "rosidl_typesupport_interface/macros.h"

#include "trolley_interfaces/msg/rosidl_generator_c__visibility_control.h"

#ifdef __cplusplus
extern "C"
{
#endif

#include "rosidl_runtime_c/message_type_support_struct.h"

// Forward declare the get type support functions for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode_Request
)(void);

// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"

// Forward declare the get type support functions for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode_Response
)(void);

// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"

// Forward declare the get type support functions for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode_Event
)(void);

#include "rosidl_runtime_c/service_type_support_struct.h"

// Forward declare the get type support functions for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_service_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode
)(void);

// Forward declare the function to create a service event message for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void *
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_CREATE_EVENT_MESSAGE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode
)(
  const rosidl_service_introspection_info_t * info,
  rcutils_allocator_t * allocator,
  const void * request_message,
  const void * response_message);

// Forward declare the function to destroy a service event message for this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_DESTROY_EVENT_MESSAGE_SYMBOL_NAME(
  rosidl_typesupport_c,
  trolley_interfaces,
  srv,
  SetDriveMode
)(
  void * event_msg,
  rcutils_allocator_t * allocator);

#ifdef __cplusplus
}
#endif

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TYPE_SUPPORT_H_
