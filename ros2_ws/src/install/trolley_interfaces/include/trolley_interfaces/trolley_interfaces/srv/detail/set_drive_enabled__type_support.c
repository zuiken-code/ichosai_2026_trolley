// generated from rosidl_typesupport_introspection_c/resource/idl__type_support.c.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

#include <stddef.h>
#include "trolley_interfaces/srv/detail/set_drive_enabled__rosidl_typesupport_introspection_c.h"
#include "trolley_interfaces/msg/rosidl_typesupport_introspection_c__visibility_control.h"
#include "rosidl_typesupport_introspection_c/field_types.h"
#include "rosidl_typesupport_introspection_c/identifier.h"
#include "rosidl_typesupport_introspection_c/message_introspection.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"


#ifdef __cplusplus
extern "C"
{
#endif

void trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_init_function(
  void * message_memory, enum rosidl_runtime_c__message_initialization _init)
{
  // TODO(karsten1987): initializers are not yet implemented for typesupport c
  // see https://github.com/ros2/ros2/issues/397
  (void) _init;
  trolley_interfaces__srv__SetDriveEnabled_Request__init(message_memory);
}

void trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_fini_function(void * message_memory)
{
  trolley_interfaces__srv__SetDriveEnabled_Request__fini(message_memory);
}

static rosidl_typesupport_introspection_c__MessageMember trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_member_array[1] = {
  {
    "enabled",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_BOOLEAN,  // type
    0,  // upper bound of string
    NULL,  // members of sub message
    false,  // is key
    false,  // is array
    0,  // array size
    false,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Request, enabled),  // bytes offset in struct
    NULL,  // default value
    NULL,  // size() function pointer
    NULL,  // get_const(index) function pointer
    NULL,  // get(index) function pointer
    NULL,  // fetch(index, &value) function pointer
    NULL,  // assign(index, value) function pointer
    NULL  // resize(index) function pointer
  }
};

static const rosidl_typesupport_introspection_c__MessageMembers trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_members = {
  "trolley_interfaces__srv",  // message namespace
  "SetDriveEnabled_Request",  // message name
  1,  // number of fields
  sizeof(trolley_interfaces__srv__SetDriveEnabled_Request),
  false,  // has_any_key_member_
  trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_member_array,  // message members
  trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_init_function,  // function to initialize message memory (memory has to be allocated)
  trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_fini_function  // function to terminate message instance (will not free memory)
};

// this is not const since it must be initialized on first access
// since C does not allow non-integral compile-time constants
static rosidl_message_type_support_t trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle = {
  0,
  &trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_members,
  get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description_sources,
};

ROSIDL_TYPESUPPORT_INTROSPECTION_C_EXPORT_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Request)() {
  if (!trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle.typesupport_identifier) {
    trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle.typesupport_identifier =
      rosidl_typesupport_introspection_c__identifier;
  }
  return &trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle;
}
#ifdef __cplusplus
}
#endif

// already included above
// #include <stddef.h>
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__rosidl_typesupport_introspection_c.h"
// already included above
// #include "trolley_interfaces/msg/rosidl_typesupport_introspection_c__visibility_control.h"
// already included above
// #include "rosidl_typesupport_introspection_c/field_types.h"
// already included above
// #include "rosidl_typesupport_introspection_c/identifier.h"
// already included above
// #include "rosidl_typesupport_introspection_c/message_introspection.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"


// Include directives for member types
// Member `message`
#include "rosidl_runtime_c/string_functions.h"

#ifdef __cplusplus
extern "C"
{
#endif

void trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_init_function(
  void * message_memory, enum rosidl_runtime_c__message_initialization _init)
{
  // TODO(karsten1987): initializers are not yet implemented for typesupport c
  // see https://github.com/ros2/ros2/issues/397
  (void) _init;
  trolley_interfaces__srv__SetDriveEnabled_Response__init(message_memory);
}

void trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_fini_function(void * message_memory)
{
  trolley_interfaces__srv__SetDriveEnabled_Response__fini(message_memory);
}

static rosidl_typesupport_introspection_c__MessageMember trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_member_array[2] = {
  {
    "success",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_BOOLEAN,  // type
    0,  // upper bound of string
    NULL,  // members of sub message
    false,  // is key
    false,  // is array
    0,  // array size
    false,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Response, success),  // bytes offset in struct
    NULL,  // default value
    NULL,  // size() function pointer
    NULL,  // get_const(index) function pointer
    NULL,  // get(index) function pointer
    NULL,  // fetch(index, &value) function pointer
    NULL,  // assign(index, value) function pointer
    NULL  // resize(index) function pointer
  },
  {
    "message",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_STRING,  // type
    0,  // upper bound of string
    NULL,  // members of sub message
    false,  // is key
    false,  // is array
    0,  // array size
    false,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Response, message),  // bytes offset in struct
    NULL,  // default value
    NULL,  // size() function pointer
    NULL,  // get_const(index) function pointer
    NULL,  // get(index) function pointer
    NULL,  // fetch(index, &value) function pointer
    NULL,  // assign(index, value) function pointer
    NULL  // resize(index) function pointer
  }
};

static const rosidl_typesupport_introspection_c__MessageMembers trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_members = {
  "trolley_interfaces__srv",  // message namespace
  "SetDriveEnabled_Response",  // message name
  2,  // number of fields
  sizeof(trolley_interfaces__srv__SetDriveEnabled_Response),
  false,  // has_any_key_member_
  trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_member_array,  // message members
  trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_init_function,  // function to initialize message memory (memory has to be allocated)
  trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_fini_function  // function to terminate message instance (will not free memory)
};

// this is not const since it must be initialized on first access
// since C does not allow non-integral compile-time constants
static rosidl_message_type_support_t trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle = {
  0,
  &trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_members,
  get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description_sources,
};

ROSIDL_TYPESUPPORT_INTROSPECTION_C_EXPORT_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Response)() {
  if (!trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle.typesupport_identifier) {
    trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle.typesupport_identifier =
      rosidl_typesupport_introspection_c__identifier;
  }
  return &trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle;
}
#ifdef __cplusplus
}
#endif

// already included above
// #include <stddef.h>
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__rosidl_typesupport_introspection_c.h"
// already included above
// #include "trolley_interfaces/msg/rosidl_typesupport_introspection_c__visibility_control.h"
// already included above
// #include "rosidl_typesupport_introspection_c/field_types.h"
// already included above
// #include "rosidl_typesupport_introspection_c/identifier.h"
// already included above
// #include "rosidl_typesupport_introspection_c/message_introspection.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"


// Include directives for member types
// Member `info`
#include "service_msgs/msg/service_event_info.h"
// Member `info`
#include "service_msgs/msg/detail/service_event_info__rosidl_typesupport_introspection_c.h"
// Member `request`
// Member `response`
#include "trolley_interfaces/srv/set_drive_enabled.h"
// Member `request`
// Member `response`
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__rosidl_typesupport_introspection_c.h"

#ifdef __cplusplus
extern "C"
{
#endif

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_init_function(
  void * message_memory, enum rosidl_runtime_c__message_initialization _init)
{
  // TODO(karsten1987): initializers are not yet implemented for typesupport c
  // see https://github.com/ros2/ros2/issues/397
  (void) _init;
  trolley_interfaces__srv__SetDriveEnabled_Event__init(message_memory);
}

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_fini_function(void * message_memory)
{
  trolley_interfaces__srv__SetDriveEnabled_Event__fini(message_memory);
}

size_t trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__size_function__SetDriveEnabled_Event__request(
  const void * untyped_member)
{
  const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * member =
    (const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence *)(untyped_member);
  return member->size;
}

const void * trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__request(
  const void * untyped_member, size_t index)
{
  const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * member =
    (const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence *)(untyped_member);
  return &member->data[index];
}

void * trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__request(
  void * untyped_member, size_t index)
{
  trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * member =
    (trolley_interfaces__srv__SetDriveEnabled_Request__Sequence *)(untyped_member);
  return &member->data[index];
}

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__fetch_function__SetDriveEnabled_Event__request(
  const void * untyped_member, size_t index, void * untyped_value)
{
  const trolley_interfaces__srv__SetDriveEnabled_Request * item =
    ((const trolley_interfaces__srv__SetDriveEnabled_Request *)
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__request(untyped_member, index));
  trolley_interfaces__srv__SetDriveEnabled_Request * value =
    (trolley_interfaces__srv__SetDriveEnabled_Request *)(untyped_value);
  *value = *item;
}

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__assign_function__SetDriveEnabled_Event__request(
  void * untyped_member, size_t index, const void * untyped_value)
{
  trolley_interfaces__srv__SetDriveEnabled_Request * item =
    ((trolley_interfaces__srv__SetDriveEnabled_Request *)
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__request(untyped_member, index));
  const trolley_interfaces__srv__SetDriveEnabled_Request * value =
    (const trolley_interfaces__srv__SetDriveEnabled_Request *)(untyped_value);
  *item = *value;
}

bool trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__resize_function__SetDriveEnabled_Event__request(
  void * untyped_member, size_t size)
{
  trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * member =
    (trolley_interfaces__srv__SetDriveEnabled_Request__Sequence *)(untyped_member);
  trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__fini(member);
  return trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__init(member, size);
}

size_t trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__size_function__SetDriveEnabled_Event__response(
  const void * untyped_member)
{
  const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * member =
    (const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence *)(untyped_member);
  return member->size;
}

const void * trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__response(
  const void * untyped_member, size_t index)
{
  const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * member =
    (const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence *)(untyped_member);
  return &member->data[index];
}

void * trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__response(
  void * untyped_member, size_t index)
{
  trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * member =
    (trolley_interfaces__srv__SetDriveEnabled_Response__Sequence *)(untyped_member);
  return &member->data[index];
}

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__fetch_function__SetDriveEnabled_Event__response(
  const void * untyped_member, size_t index, void * untyped_value)
{
  const trolley_interfaces__srv__SetDriveEnabled_Response * item =
    ((const trolley_interfaces__srv__SetDriveEnabled_Response *)
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__response(untyped_member, index));
  trolley_interfaces__srv__SetDriveEnabled_Response * value =
    (trolley_interfaces__srv__SetDriveEnabled_Response *)(untyped_value);
  *value = *item;
}

void trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__assign_function__SetDriveEnabled_Event__response(
  void * untyped_member, size_t index, const void * untyped_value)
{
  trolley_interfaces__srv__SetDriveEnabled_Response * item =
    ((trolley_interfaces__srv__SetDriveEnabled_Response *)
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__response(untyped_member, index));
  const trolley_interfaces__srv__SetDriveEnabled_Response * value =
    (const trolley_interfaces__srv__SetDriveEnabled_Response *)(untyped_value);
  *item = *value;
}

bool trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__resize_function__SetDriveEnabled_Event__response(
  void * untyped_member, size_t size)
{
  trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * member =
    (trolley_interfaces__srv__SetDriveEnabled_Response__Sequence *)(untyped_member);
  trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__fini(member);
  return trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__init(member, size);
}

static rosidl_typesupport_introspection_c__MessageMember trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_member_array[3] = {
  {
    "info",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_MESSAGE,  // type
    0,  // upper bound of string
    NULL,  // members of sub message (initialized later)
    false,  // is key
    false,  // is array
    0,  // array size
    false,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Event, info),  // bytes offset in struct
    NULL,  // default value
    NULL,  // size() function pointer
    NULL,  // get_const(index) function pointer
    NULL,  // get(index) function pointer
    NULL,  // fetch(index, &value) function pointer
    NULL,  // assign(index, value) function pointer
    NULL  // resize(index) function pointer
  },
  {
    "request",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_MESSAGE,  // type
    0,  // upper bound of string
    NULL,  // members of sub message (initialized later)
    false,  // is key
    true,  // is array
    1,  // array size
    true,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Event, request),  // bytes offset in struct
    NULL,  // default value
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__size_function__SetDriveEnabled_Event__request,  // size() function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__request,  // get_const(index) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__request,  // get(index) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__fetch_function__SetDriveEnabled_Event__request,  // fetch(index, &value) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__assign_function__SetDriveEnabled_Event__request,  // assign(index, value) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__resize_function__SetDriveEnabled_Event__request  // resize(index) function pointer
  },
  {
    "response",  // name
    rosidl_typesupport_introspection_c__ROS_TYPE_MESSAGE,  // type
    0,  // upper bound of string
    NULL,  // members of sub message (initialized later)
    false,  // is key
    true,  // is array
    1,  // array size
    true,  // is upper bound
    offsetof(trolley_interfaces__srv__SetDriveEnabled_Event, response),  // bytes offset in struct
    NULL,  // default value
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__size_function__SetDriveEnabled_Event__response,  // size() function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_const_function__SetDriveEnabled_Event__response,  // get_const(index) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__get_function__SetDriveEnabled_Event__response,  // get(index) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__fetch_function__SetDriveEnabled_Event__response,  // fetch(index, &value) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__assign_function__SetDriveEnabled_Event__response,  // assign(index, value) function pointer
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__resize_function__SetDriveEnabled_Event__response  // resize(index) function pointer
  }
};

static const rosidl_typesupport_introspection_c__MessageMembers trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_members = {
  "trolley_interfaces__srv",  // message namespace
  "SetDriveEnabled_Event",  // message name
  3,  // number of fields
  sizeof(trolley_interfaces__srv__SetDriveEnabled_Event),
  false,  // has_any_key_member_
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_member_array,  // message members
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_init_function,  // function to initialize message memory (memory has to be allocated)
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_fini_function  // function to terminate message instance (will not free memory)
};

// this is not const since it must be initialized on first access
// since C does not allow non-integral compile-time constants
static rosidl_message_type_support_t trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_type_support_handle = {
  0,
  &trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_members,
  get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description_sources,
};

ROSIDL_TYPESUPPORT_INTROSPECTION_C_EXPORT_trolley_interfaces
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Event)() {
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_member_array[0].members_ =
    ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, service_msgs, msg, ServiceEventInfo)();
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_member_array[1].members_ =
    ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Request)();
  trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_member_array[2].members_ =
    ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Response)();
  if (!trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_type_support_handle.typesupport_identifier) {
    trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_type_support_handle.typesupport_identifier =
      rosidl_typesupport_introspection_c__identifier;
  }
  return &trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_type_support_handle;
}
#ifdef __cplusplus
}
#endif

#include "rosidl_runtime_c/service_type_support_struct.h"
// already included above
// #include "trolley_interfaces/msg/rosidl_typesupport_introspection_c__visibility_control.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__rosidl_typesupport_introspection_c.h"
// already included above
// #include "rosidl_typesupport_introspection_c/identifier.h"
#include "rosidl_typesupport_introspection_c/service_introspection.h"

// this is intentionally not const to allow initialization later to prevent an initialization race
static rosidl_typesupport_introspection_c__ServiceMembers trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_members = {
  "trolley_interfaces__srv",  // service namespace
  "SetDriveEnabled",  // service name
  // the following fields are initialized below on first access
  NULL,  // request message
  // trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle,
  NULL,  // response message
  // trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle
  NULL  // event_message
  // trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle
};


static rosidl_service_type_support_t trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_type_support_handle = {
  0,
  &trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_members,
  get_service_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Request__rosidl_typesupport_introspection_c__SetDriveEnabled_Request_message_type_support_handle,
  &trolley_interfaces__srv__SetDriveEnabled_Response__rosidl_typesupport_introspection_c__SetDriveEnabled_Response_message_type_support_handle,
  &trolley_interfaces__srv__SetDriveEnabled_Event__rosidl_typesupport_introspection_c__SetDriveEnabled_Event_message_type_support_handle,
  ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_CREATE_EVENT_MESSAGE_SYMBOL_NAME(
    rosidl_typesupport_c,
    trolley_interfaces,
    srv,
    SetDriveEnabled
  ),
  ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_DESTROY_EVENT_MESSAGE_SYMBOL_NAME(
    rosidl_typesupport_c,
    trolley_interfaces,
    srv,
    SetDriveEnabled
  ),
  &trolley_interfaces__srv__SetDriveEnabled__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled__get_type_description_sources,
};

// Forward declaration of message type support functions for service members
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Request)(void);

const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Response)(void);

const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Event)(void);

ROSIDL_TYPESUPPORT_INTROSPECTION_C_EXPORT_trolley_interfaces
const rosidl_service_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled)(void) {
  if (!trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_type_support_handle.typesupport_identifier) {
    trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_type_support_handle.typesupport_identifier =
      rosidl_typesupport_introspection_c__identifier;
  }
  rosidl_typesupport_introspection_c__ServiceMembers * service_members =
    (rosidl_typesupport_introspection_c__ServiceMembers *)trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_type_support_handle.data;

  if (!service_members->request_members_) {
    service_members->request_members_ =
      (const rosidl_typesupport_introspection_c__MessageMembers *)
      ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Request)()->data;
  }
  if (!service_members->response_members_) {
    service_members->response_members_ =
      (const rosidl_typesupport_introspection_c__MessageMembers *)
      ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Response)()->data;
  }
  if (!service_members->event_members_) {
    service_members->event_members_ =
      (const rosidl_typesupport_introspection_c__MessageMembers *)
      ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Event)()->data;
  }

  return &trolley_interfaces__srv__detail__set_drive_enabled__rosidl_typesupport_introspection_c__SetDriveEnabled_service_type_support_handle;
}
