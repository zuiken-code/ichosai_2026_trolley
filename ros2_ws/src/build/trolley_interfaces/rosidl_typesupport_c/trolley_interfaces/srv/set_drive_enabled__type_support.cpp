// generated from rosidl_typesupport_c/resource/idl__type_support.cpp.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

#include "cstddef"
#include "rosidl_runtime_c/message_type_support_struct.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__type_support.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
#include "rosidl_typesupport_c/identifier.h"
#include "rosidl_typesupport_c/message_type_support_dispatch.h"
#include "rosidl_typesupport_c/type_support_map.h"
#include "rosidl_typesupport_c/visibility_control.h"
#include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_c
{

typedef struct _SetDriveEnabled_Request_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Request_type_support_ids_t;

static const _SetDriveEnabled_Request_type_support_ids_t _SetDriveEnabled_Request_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_c",  // ::rosidl_typesupport_fastrtps_c::typesupport_identifier,
    "rosidl_typesupport_introspection_c",  // ::rosidl_typesupport_introspection_c::typesupport_identifier,
  }
};

typedef struct _SetDriveEnabled_Request_type_support_symbol_names_t
{
  const char * symbol_name[2];
} _SetDriveEnabled_Request_type_support_symbol_names_t;

#define STRINGIFY_(s) #s
#define STRINGIFY(s) STRINGIFY_(s)

static const _SetDriveEnabled_Request_type_support_symbol_names_t _SetDriveEnabled_Request_message_typesupport_symbol_names = {
  {
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_c, trolley_interfaces, srv, SetDriveEnabled_Request)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Request)),
  }
};

typedef struct _SetDriveEnabled_Request_type_support_data_t
{
  void * data[2];
} _SetDriveEnabled_Request_type_support_data_t;

static _SetDriveEnabled_Request_type_support_data_t _SetDriveEnabled_Request_message_typesupport_data = {
  {
    0,  // will store the shared library later
    0,  // will store the shared library later
  }
};

static const type_support_map_t _SetDriveEnabled_Request_message_typesupport_map = {
  2,
  "trolley_interfaces",
  &_SetDriveEnabled_Request_message_typesupport_ids.typesupport_identifier[0],
  &_SetDriveEnabled_Request_message_typesupport_symbol_names.symbol_name[0],
  &_SetDriveEnabled_Request_message_typesupport_data.data[0],
};

static const rosidl_message_type_support_t SetDriveEnabled_Request_message_type_support_handle = {
  rosidl_typesupport_c__typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Request_message_typesupport_map),
  rosidl_typesupport_c__get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description_sources,
};

}  // namespace rosidl_typesupport_c

}  // namespace srv

}  // namespace trolley_interfaces

#ifdef __cplusplus
extern "C"
{
#endif

const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_c, trolley_interfaces, srv, SetDriveEnabled_Request)() {
  return &::trolley_interfaces::srv::rosidl_typesupport_c::SetDriveEnabled_Request_message_type_support_handle;
}

#ifdef __cplusplus
}
#endif

// already included above
// #include "cstddef"
// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__type_support.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "rosidl_typesupport_c/identifier.h"
// already included above
// #include "rosidl_typesupport_c/message_type_support_dispatch.h"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
// already included above
// #include "rosidl_typesupport_c/visibility_control.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_c
{

typedef struct _SetDriveEnabled_Response_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Response_type_support_ids_t;

static const _SetDriveEnabled_Response_type_support_ids_t _SetDriveEnabled_Response_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_c",  // ::rosidl_typesupport_fastrtps_c::typesupport_identifier,
    "rosidl_typesupport_introspection_c",  // ::rosidl_typesupport_introspection_c::typesupport_identifier,
  }
};

typedef struct _SetDriveEnabled_Response_type_support_symbol_names_t
{
  const char * symbol_name[2];
} _SetDriveEnabled_Response_type_support_symbol_names_t;

#define STRINGIFY_(s) #s
#define STRINGIFY(s) STRINGIFY_(s)

static const _SetDriveEnabled_Response_type_support_symbol_names_t _SetDriveEnabled_Response_message_typesupport_symbol_names = {
  {
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_c, trolley_interfaces, srv, SetDriveEnabled_Response)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Response)),
  }
};

typedef struct _SetDriveEnabled_Response_type_support_data_t
{
  void * data[2];
} _SetDriveEnabled_Response_type_support_data_t;

static _SetDriveEnabled_Response_type_support_data_t _SetDriveEnabled_Response_message_typesupport_data = {
  {
    0,  // will store the shared library later
    0,  // will store the shared library later
  }
};

static const type_support_map_t _SetDriveEnabled_Response_message_typesupport_map = {
  2,
  "trolley_interfaces",
  &_SetDriveEnabled_Response_message_typesupport_ids.typesupport_identifier[0],
  &_SetDriveEnabled_Response_message_typesupport_symbol_names.symbol_name[0],
  &_SetDriveEnabled_Response_message_typesupport_data.data[0],
};

static const rosidl_message_type_support_t SetDriveEnabled_Response_message_type_support_handle = {
  rosidl_typesupport_c__typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Response_message_typesupport_map),
  rosidl_typesupport_c__get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description_sources,
};

}  // namespace rosidl_typesupport_c

}  // namespace srv

}  // namespace trolley_interfaces

#ifdef __cplusplus
extern "C"
{
#endif

const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_c, trolley_interfaces, srv, SetDriveEnabled_Response)() {
  return &::trolley_interfaces::srv::rosidl_typesupport_c::SetDriveEnabled_Response_message_type_support_handle;
}

#ifdef __cplusplus
}
#endif

// already included above
// #include "cstddef"
// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__type_support.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "rosidl_typesupport_c/identifier.h"
// already included above
// #include "rosidl_typesupport_c/message_type_support_dispatch.h"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
// already included above
// #include "rosidl_typesupport_c/visibility_control.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_c
{

typedef struct _SetDriveEnabled_Event_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Event_type_support_ids_t;

static const _SetDriveEnabled_Event_type_support_ids_t _SetDriveEnabled_Event_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_c",  // ::rosidl_typesupport_fastrtps_c::typesupport_identifier,
    "rosidl_typesupport_introspection_c",  // ::rosidl_typesupport_introspection_c::typesupport_identifier,
  }
};

typedef struct _SetDriveEnabled_Event_type_support_symbol_names_t
{
  const char * symbol_name[2];
} _SetDriveEnabled_Event_type_support_symbol_names_t;

#define STRINGIFY_(s) #s
#define STRINGIFY(s) STRINGIFY_(s)

static const _SetDriveEnabled_Event_type_support_symbol_names_t _SetDriveEnabled_Event_message_typesupport_symbol_names = {
  {
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_c, trolley_interfaces, srv, SetDriveEnabled_Event)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled_Event)),
  }
};

typedef struct _SetDriveEnabled_Event_type_support_data_t
{
  void * data[2];
} _SetDriveEnabled_Event_type_support_data_t;

static _SetDriveEnabled_Event_type_support_data_t _SetDriveEnabled_Event_message_typesupport_data = {
  {
    0,  // will store the shared library later
    0,  // will store the shared library later
  }
};

static const type_support_map_t _SetDriveEnabled_Event_message_typesupport_map = {
  2,
  "trolley_interfaces",
  &_SetDriveEnabled_Event_message_typesupport_ids.typesupport_identifier[0],
  &_SetDriveEnabled_Event_message_typesupport_symbol_names.symbol_name[0],
  &_SetDriveEnabled_Event_message_typesupport_data.data[0],
};

static const rosidl_message_type_support_t SetDriveEnabled_Event_message_type_support_handle = {
  rosidl_typesupport_c__typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Event_message_typesupport_map),
  rosidl_typesupport_c__get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description_sources,
};

}  // namespace rosidl_typesupport_c

}  // namespace srv

}  // namespace trolley_interfaces

#ifdef __cplusplus
extern "C"
{
#endif

const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_c, trolley_interfaces, srv, SetDriveEnabled_Event)() {
  return &::trolley_interfaces::srv::rosidl_typesupport_c::SetDriveEnabled_Event_message_type_support_handle;
}

#ifdef __cplusplus
}
#endif

// already included above
// #include "cstddef"
#include "rosidl_runtime_c/service_type_support_struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__type_support.h"
// already included above
// #include "rosidl_typesupport_c/identifier.h"
#include "rosidl_typesupport_c/service_type_support_dispatch.h"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"
#include "service_msgs/msg/service_event_info.h"
#include "builtin_interfaces/msg/time.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_c
{
typedef struct _SetDriveEnabled_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_type_support_ids_t;

static const _SetDriveEnabled_type_support_ids_t _SetDriveEnabled_service_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_c",  // ::rosidl_typesupport_fastrtps_c::typesupport_identifier,
    "rosidl_typesupport_introspection_c",  // ::rosidl_typesupport_introspection_c::typesupport_identifier,
  }
};

typedef struct _SetDriveEnabled_type_support_symbol_names_t
{
  const char * symbol_name[2];
} _SetDriveEnabled_type_support_symbol_names_t;

#define STRINGIFY_(s) #s
#define STRINGIFY(s) STRINGIFY_(s)

static const _SetDriveEnabled_type_support_symbol_names_t _SetDriveEnabled_service_typesupport_symbol_names = {
  {
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_fastrtps_c, trolley_interfaces, srv, SetDriveEnabled)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_introspection_c, trolley_interfaces, srv, SetDriveEnabled)),
  }
};

typedef struct _SetDriveEnabled_type_support_data_t
{
  void * data[2];
} _SetDriveEnabled_type_support_data_t;

static _SetDriveEnabled_type_support_data_t _SetDriveEnabled_service_typesupport_data = {
  {
    0,  // will store the shared library later
    0,  // will store the shared library later
  }
};

static const type_support_map_t _SetDriveEnabled_service_typesupport_map = {
  2,
  "trolley_interfaces",
  &_SetDriveEnabled_service_typesupport_ids.typesupport_identifier[0],
  &_SetDriveEnabled_service_typesupport_symbol_names.symbol_name[0],
  &_SetDriveEnabled_service_typesupport_data.data[0],
};

static const rosidl_service_type_support_t SetDriveEnabled_service_type_support_handle = {
  rosidl_typesupport_c__typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_service_typesupport_map),
  rosidl_typesupport_c__get_service_typesupport_handle_function,
  &SetDriveEnabled_Request_message_type_support_handle,
  &SetDriveEnabled_Response_message_type_support_handle,
  &SetDriveEnabled_Event_message_type_support_handle,
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

}  // namespace rosidl_typesupport_c

}  // namespace srv

}  // namespace trolley_interfaces

#ifdef __cplusplus
extern "C"
{
#endif

const rosidl_service_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_c, trolley_interfaces, srv, SetDriveEnabled)() {
  return &::trolley_interfaces::srv::rosidl_typesupport_c::SetDriveEnabled_service_type_support_handle;
}

#ifdef __cplusplus
}
#endif
