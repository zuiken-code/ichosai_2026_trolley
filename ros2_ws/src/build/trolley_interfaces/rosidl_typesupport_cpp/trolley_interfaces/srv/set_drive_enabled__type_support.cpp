// generated from rosidl_typesupport_cpp/resource/idl__type_support.cpp.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

#include "cstddef"
#include "rosidl_runtime_c/message_type_support_struct.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
#include "trolley_interfaces/srv/detail/set_drive_enabled__struct.hpp"
#include "rosidl_typesupport_cpp/identifier.hpp"
#include "rosidl_typesupport_cpp/message_type_support.hpp"
#include "rosidl_typesupport_c/type_support_map.h"
#include "rosidl_typesupport_cpp/message_type_support_dispatch.hpp"
#include "rosidl_typesupport_cpp/visibility_control.h"
#include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_cpp
{

typedef struct _SetDriveEnabled_Request_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Request_type_support_ids_t;

static const _SetDriveEnabled_Request_type_support_ids_t _SetDriveEnabled_Request_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_cpp",  // ::rosidl_typesupport_fastrtps_cpp::typesupport_identifier,
    "rosidl_typesupport_introspection_cpp",  // ::rosidl_typesupport_introspection_cpp::typesupport_identifier,
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
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_cpp, trolley_interfaces, srv, SetDriveEnabled_Request)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_cpp, trolley_interfaces, srv, SetDriveEnabled_Request)),
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
  ::rosidl_typesupport_cpp::typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Request_message_typesupport_map),
  ::rosidl_typesupport_cpp::get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description_sources,
};

}  // namespace rosidl_typesupport_cpp

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_typesupport_cpp
{

template<>
ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Request>()
{
  return &::trolley_interfaces::srv::rosidl_typesupport_cpp::SetDriveEnabled_Request_message_type_support_handle;
}

#ifdef __cplusplus
extern "C"
{
#endif

ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_cpp, trolley_interfaces, srv, SetDriveEnabled_Request)() {
  return get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Request>();
}

#ifdef __cplusplus
}
#endif
}  // namespace rosidl_typesupport_cpp

// already included above
// #include "cstddef"
// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.hpp"
// already included above
// #include "rosidl_typesupport_cpp/identifier.hpp"
// already included above
// #include "rosidl_typesupport_cpp/message_type_support.hpp"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
// already included above
// #include "rosidl_typesupport_cpp/message_type_support_dispatch.hpp"
// already included above
// #include "rosidl_typesupport_cpp/visibility_control.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_cpp
{

typedef struct _SetDriveEnabled_Response_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Response_type_support_ids_t;

static const _SetDriveEnabled_Response_type_support_ids_t _SetDriveEnabled_Response_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_cpp",  // ::rosidl_typesupport_fastrtps_cpp::typesupport_identifier,
    "rosidl_typesupport_introspection_cpp",  // ::rosidl_typesupport_introspection_cpp::typesupport_identifier,
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
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_cpp, trolley_interfaces, srv, SetDriveEnabled_Response)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_cpp, trolley_interfaces, srv, SetDriveEnabled_Response)),
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
  ::rosidl_typesupport_cpp::typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Response_message_typesupport_map),
  ::rosidl_typesupport_cpp::get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description_sources,
};

}  // namespace rosidl_typesupport_cpp

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_typesupport_cpp
{

template<>
ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Response>()
{
  return &::trolley_interfaces::srv::rosidl_typesupport_cpp::SetDriveEnabled_Response_message_type_support_handle;
}

#ifdef __cplusplus
extern "C"
{
#endif

ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_cpp, trolley_interfaces, srv, SetDriveEnabled_Response)() {
  return get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Response>();
}

#ifdef __cplusplus
}
#endif
}  // namespace rosidl_typesupport_cpp

// already included above
// #include "cstddef"
// already included above
// #include "rosidl_runtime_c/message_type_support_struct.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.hpp"
// already included above
// #include "rosidl_typesupport_cpp/identifier.hpp"
// already included above
// #include "rosidl_typesupport_cpp/message_type_support.hpp"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
// already included above
// #include "rosidl_typesupport_cpp/message_type_support_dispatch.hpp"
// already included above
// #include "rosidl_typesupport_cpp/visibility_control.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_cpp
{

typedef struct _SetDriveEnabled_Event_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_Event_type_support_ids_t;

static const _SetDriveEnabled_Event_type_support_ids_t _SetDriveEnabled_Event_message_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_cpp",  // ::rosidl_typesupport_fastrtps_cpp::typesupport_identifier,
    "rosidl_typesupport_introspection_cpp",  // ::rosidl_typesupport_introspection_cpp::typesupport_identifier,
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
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_fastrtps_cpp, trolley_interfaces, srv, SetDriveEnabled_Event)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_introspection_cpp, trolley_interfaces, srv, SetDriveEnabled_Event)),
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
  ::rosidl_typesupport_cpp::typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_Event_message_typesupport_map),
  ::rosidl_typesupport_cpp::get_message_typesupport_handle_function,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description_sources,
};

}  // namespace rosidl_typesupport_cpp

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_typesupport_cpp
{

template<>
ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Event>()
{
  return &::trolley_interfaces::srv::rosidl_typesupport_cpp::SetDriveEnabled_Event_message_type_support_handle;
}

#ifdef __cplusplus
extern "C"
{
#endif

ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_message_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__MESSAGE_SYMBOL_NAME(rosidl_typesupport_cpp, trolley_interfaces, srv, SetDriveEnabled_Event)() {
  return get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Event>();
}

#ifdef __cplusplus
}
#endif
}  // namespace rosidl_typesupport_cpp

// already included above
// #include "cstddef"
#include "rosidl_runtime_c/service_type_support_struct.h"
#include "rosidl_typesupport_cpp/service_type_support.hpp"
// already included above
// #include "trolley_interfaces/srv/detail/set_drive_enabled__struct.hpp"
// already included above
// #include "rosidl_typesupport_cpp/identifier.hpp"
// already included above
// #include "rosidl_typesupport_c/type_support_map.h"
#include "rosidl_typesupport_cpp/service_type_support_dispatch.hpp"
// already included above
// #include "rosidl_typesupport_cpp/visibility_control.h"
// already included above
// #include "rosidl_typesupport_interface/macros.h"

namespace trolley_interfaces
{

namespace srv
{

namespace rosidl_typesupport_cpp
{

typedef struct _SetDriveEnabled_type_support_ids_t
{
  const char * typesupport_identifier[2];
} _SetDriveEnabled_type_support_ids_t;

static const _SetDriveEnabled_type_support_ids_t _SetDriveEnabled_service_typesupport_ids = {
  {
    "rosidl_typesupport_fastrtps_cpp",  // ::rosidl_typesupport_fastrtps_cpp::typesupport_identifier,
    "rosidl_typesupport_introspection_cpp",  // ::rosidl_typesupport_introspection_cpp::typesupport_identifier,
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
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_fastrtps_cpp, trolley_interfaces, srv, SetDriveEnabled)),
    STRINGIFY(ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_introspection_cpp, trolley_interfaces, srv, SetDriveEnabled)),
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
  ::rosidl_typesupport_cpp::typesupport_identifier,
  reinterpret_cast<const type_support_map_t *>(&_SetDriveEnabled_service_typesupport_map),
  ::rosidl_typesupport_cpp::get_service_typesupport_handle_function,
  ::rosidl_typesupport_cpp::get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Request>(),
  ::rosidl_typesupport_cpp::get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Response>(),
  ::rosidl_typesupport_cpp::get_message_type_support_handle<trolley_interfaces::srv::SetDriveEnabled_Event>(),
  &::rosidl_typesupport_cpp::service_create_event_message<trolley_interfaces::srv::SetDriveEnabled>,
  &::rosidl_typesupport_cpp::service_destroy_event_message<trolley_interfaces::srv::SetDriveEnabled>,
  &trolley_interfaces__srv__SetDriveEnabled__get_type_hash,
  &trolley_interfaces__srv__SetDriveEnabled__get_type_description,
  &trolley_interfaces__srv__SetDriveEnabled__get_type_description_sources,
};

}  // namespace rosidl_typesupport_cpp

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_typesupport_cpp
{

template<>
ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_service_type_support_t *
get_service_type_support_handle<trolley_interfaces::srv::SetDriveEnabled>()
{
  return &::trolley_interfaces::srv::rosidl_typesupport_cpp::SetDriveEnabled_service_type_support_handle;
}

}  // namespace rosidl_typesupport_cpp

#ifdef __cplusplus
extern "C"
{
#endif

ROSIDL_TYPESUPPORT_CPP_PUBLIC
const rosidl_service_type_support_t *
ROSIDL_TYPESUPPORT_INTERFACE__SERVICE_SYMBOL_NAME(rosidl_typesupport_cpp, trolley_interfaces, srv, SetDriveEnabled)() {
  return ::rosidl_typesupport_cpp::get_service_type_support_handle<trolley_interfaces::srv::SetDriveEnabled>();
}

#ifdef __cplusplus
}
#endif
