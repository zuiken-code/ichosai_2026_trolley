// generated from rosidl_generator_cpp/resource/idl__traits.hpp.em
// with input from trolley_interfaces:srv/SetDriveMode.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_mode.hpp"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TRAITS_HPP_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TRAITS_HPP_

#include <stdint.h>

#include <sstream>
#include <string>
#include <type_traits>

#include "trolley_interfaces/srv/detail/set_drive_mode__struct.hpp"
#include "rosidl_runtime_cpp/traits.hpp"

namespace trolley_interfaces
{

namespace srv
{

inline void to_flow_style_yaml(
  const SetDriveMode_Request & msg,
  std::ostream & out)
{
  out << "{";
  // member: mode
  {
    out << "mode: ";
    rosidl_generator_traits::value_to_yaml(msg.mode, out);
  }
  out << "}";
}  // NOLINT(readability/fn_size)

inline void to_block_style_yaml(
  const SetDriveMode_Request & msg,
  std::ostream & out, size_t indentation = 0)
{
  // member: mode
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    out << "mode: ";
    rosidl_generator_traits::value_to_yaml(msg.mode, out);
    out << "\n";
  }
}  // NOLINT(readability/fn_size)

inline std::string to_yaml(const SetDriveMode_Request & msg, bool use_flow_style = false)
{
  std::ostringstream out;
  if (use_flow_style) {
    to_flow_style_yaml(msg, out);
  } else {
    to_block_style_yaml(msg, out);
  }
  return out.str();
}

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_generator_traits
{

[[deprecated("use trolley_interfaces::srv::to_block_style_yaml() instead")]]
inline void to_yaml(
  const trolley_interfaces::srv::SetDriveMode_Request & msg,
  std::ostream & out, size_t indentation = 0)
{
  trolley_interfaces::srv::to_block_style_yaml(msg, out, indentation);
}

[[deprecated("use trolley_interfaces::srv::to_yaml() instead")]]
inline std::string to_yaml(const trolley_interfaces::srv::SetDriveMode_Request & msg)
{
  return trolley_interfaces::srv::to_yaml(msg);
}

template<>
inline const char * data_type<trolley_interfaces::srv::SetDriveMode_Request>()
{
  return "trolley_interfaces::srv::SetDriveMode_Request";
}

template<>
inline const char * name<trolley_interfaces::srv::SetDriveMode_Request>()
{
  return "trolley_interfaces/srv/SetDriveMode_Request";
}

template<>
struct has_fixed_size<trolley_interfaces::srv::SetDriveMode_Request>
  : std::integral_constant<bool, true> {};

template<>
struct has_bounded_size<trolley_interfaces::srv::SetDriveMode_Request>
  : std::integral_constant<bool, true> {};

template<>
struct is_message<trolley_interfaces::srv::SetDriveMode_Request>
  : std::true_type {};

}  // namespace rosidl_generator_traits

namespace trolley_interfaces
{

namespace srv
{

inline void to_flow_style_yaml(
  const SetDriveMode_Response & msg,
  std::ostream & out)
{
  out << "{";
  // member: success
  {
    out << "success: ";
    rosidl_generator_traits::value_to_yaml(msg.success, out);
    out << ", ";
  }

  // member: message
  {
    out << "message: ";
    rosidl_generator_traits::value_to_yaml(msg.message, out);
  }
  out << "}";
}  // NOLINT(readability/fn_size)

inline void to_block_style_yaml(
  const SetDriveMode_Response & msg,
  std::ostream & out, size_t indentation = 0)
{
  // member: success
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    out << "success: ";
    rosidl_generator_traits::value_to_yaml(msg.success, out);
    out << "\n";
  }

  // member: message
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    out << "message: ";
    rosidl_generator_traits::value_to_yaml(msg.message, out);
    out << "\n";
  }
}  // NOLINT(readability/fn_size)

inline std::string to_yaml(const SetDriveMode_Response & msg, bool use_flow_style = false)
{
  std::ostringstream out;
  if (use_flow_style) {
    to_flow_style_yaml(msg, out);
  } else {
    to_block_style_yaml(msg, out);
  }
  return out.str();
}

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_generator_traits
{

[[deprecated("use trolley_interfaces::srv::to_block_style_yaml() instead")]]
inline void to_yaml(
  const trolley_interfaces::srv::SetDriveMode_Response & msg,
  std::ostream & out, size_t indentation = 0)
{
  trolley_interfaces::srv::to_block_style_yaml(msg, out, indentation);
}

[[deprecated("use trolley_interfaces::srv::to_yaml() instead")]]
inline std::string to_yaml(const trolley_interfaces::srv::SetDriveMode_Response & msg)
{
  return trolley_interfaces::srv::to_yaml(msg);
}

template<>
inline const char * data_type<trolley_interfaces::srv::SetDriveMode_Response>()
{
  return "trolley_interfaces::srv::SetDriveMode_Response";
}

template<>
inline const char * name<trolley_interfaces::srv::SetDriveMode_Response>()
{
  return "trolley_interfaces/srv/SetDriveMode_Response";
}

template<>
struct has_fixed_size<trolley_interfaces::srv::SetDriveMode_Response>
  : std::integral_constant<bool, false> {};

template<>
struct has_bounded_size<trolley_interfaces::srv::SetDriveMode_Response>
  : std::integral_constant<bool, false> {};

template<>
struct is_message<trolley_interfaces::srv::SetDriveMode_Response>
  : std::true_type {};

}  // namespace rosidl_generator_traits

// Include directives for member types
// Member 'info'
#include "service_msgs/msg/detail/service_event_info__traits.hpp"

namespace trolley_interfaces
{

namespace srv
{

inline void to_flow_style_yaml(
  const SetDriveMode_Event & msg,
  std::ostream & out)
{
  out << "{";
  // member: info
  {
    out << "info: ";
    to_flow_style_yaml(msg.info, out);
    out << ", ";
  }

  // member: request
  {
    if (msg.request.size() == 0) {
      out << "request: []";
    } else {
      out << "request: [";
      size_t pending_items = msg.request.size();
      for (auto item : msg.request) {
        to_flow_style_yaml(item, out);
        if (--pending_items > 0) {
          out << ", ";
        }
      }
      out << "]";
    }
    out << ", ";
  }

  // member: response
  {
    if (msg.response.size() == 0) {
      out << "response: []";
    } else {
      out << "response: [";
      size_t pending_items = msg.response.size();
      for (auto item : msg.response) {
        to_flow_style_yaml(item, out);
        if (--pending_items > 0) {
          out << ", ";
        }
      }
      out << "]";
    }
  }
  out << "}";
}  // NOLINT(readability/fn_size)

inline void to_block_style_yaml(
  const SetDriveMode_Event & msg,
  std::ostream & out, size_t indentation = 0)
{
  // member: info
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    out << "info:\n";
    to_block_style_yaml(msg.info, out, indentation + 2);
  }

  // member: request
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    if (msg.request.size() == 0) {
      out << "request: []\n";
    } else {
      out << "request:\n";
      for (auto item : msg.request) {
        if (indentation > 0) {
          out << std::string(indentation, ' ');
        }
        out << "-\n";
        to_block_style_yaml(item, out, indentation + 2);
      }
    }
  }

  // member: response
  {
    if (indentation > 0) {
      out << std::string(indentation, ' ');
    }
    if (msg.response.size() == 0) {
      out << "response: []\n";
    } else {
      out << "response:\n";
      for (auto item : msg.response) {
        if (indentation > 0) {
          out << std::string(indentation, ' ');
        }
        out << "-\n";
        to_block_style_yaml(item, out, indentation + 2);
      }
    }
  }
}  // NOLINT(readability/fn_size)

inline std::string to_yaml(const SetDriveMode_Event & msg, bool use_flow_style = false)
{
  std::ostringstream out;
  if (use_flow_style) {
    to_flow_style_yaml(msg, out);
  } else {
    to_block_style_yaml(msg, out);
  }
  return out.str();
}

}  // namespace srv

}  // namespace trolley_interfaces

namespace rosidl_generator_traits
{

[[deprecated("use trolley_interfaces::srv::to_block_style_yaml() instead")]]
inline void to_yaml(
  const trolley_interfaces::srv::SetDriveMode_Event & msg,
  std::ostream & out, size_t indentation = 0)
{
  trolley_interfaces::srv::to_block_style_yaml(msg, out, indentation);
}

[[deprecated("use trolley_interfaces::srv::to_yaml() instead")]]
inline std::string to_yaml(const trolley_interfaces::srv::SetDriveMode_Event & msg)
{
  return trolley_interfaces::srv::to_yaml(msg);
}

template<>
inline const char * data_type<trolley_interfaces::srv::SetDriveMode_Event>()
{
  return "trolley_interfaces::srv::SetDriveMode_Event";
}

template<>
inline const char * name<trolley_interfaces::srv::SetDriveMode_Event>()
{
  return "trolley_interfaces/srv/SetDriveMode_Event";
}

template<>
struct has_fixed_size<trolley_interfaces::srv::SetDriveMode_Event>
  : std::integral_constant<bool, false> {};

template<>
struct has_bounded_size<trolley_interfaces::srv::SetDriveMode_Event>
  : std::integral_constant<bool, has_bounded_size<service_msgs::msg::ServiceEventInfo>::value && has_bounded_size<trolley_interfaces::srv::SetDriveMode_Request>::value && has_bounded_size<trolley_interfaces::srv::SetDriveMode_Response>::value> {};

template<>
struct is_message<trolley_interfaces::srv::SetDriveMode_Event>
  : std::true_type {};

}  // namespace rosidl_generator_traits

namespace rosidl_generator_traits
{

template<>
inline const char * data_type<trolley_interfaces::srv::SetDriveMode>()
{
  return "trolley_interfaces::srv::SetDriveMode";
}

template<>
inline const char * name<trolley_interfaces::srv::SetDriveMode>()
{
  return "trolley_interfaces/srv/SetDriveMode";
}

template<>
struct has_fixed_size<trolley_interfaces::srv::SetDriveMode>
  : std::integral_constant<
    bool,
    has_fixed_size<trolley_interfaces::srv::SetDriveMode_Request>::value &&
    has_fixed_size<trolley_interfaces::srv::SetDriveMode_Response>::value
  >
{
};

template<>
struct has_bounded_size<trolley_interfaces::srv::SetDriveMode>
  : std::integral_constant<
    bool,
    has_bounded_size<trolley_interfaces::srv::SetDriveMode_Request>::value &&
    has_bounded_size<trolley_interfaces::srv::SetDriveMode_Response>::value
  >
{
};

template<>
struct is_service<trolley_interfaces::srv::SetDriveMode>
  : std::true_type
{
};

template<>
struct is_service_request<trolley_interfaces::srv::SetDriveMode_Request>
  : std::true_type
{
};

template<>
struct is_service_response<trolley_interfaces::srv::SetDriveMode_Response>
  : std::true_type
{
};

}  // namespace rosidl_generator_traits

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_MODE__TRAITS_HPP_
