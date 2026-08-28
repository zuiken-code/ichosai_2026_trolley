// generated from rosidl_generator_cpp/resource/idl__builder.hpp.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_enabled.hpp"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__BUILDER_HPP_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__BUILDER_HPP_

#include <algorithm>
#include <utility>

#include "trolley_interfaces/srv/detail/set_drive_enabled__struct.hpp"
#include "rosidl_runtime_cpp/message_initialization.hpp"


namespace trolley_interfaces
{

namespace srv
{

namespace builder
{

class Init_SetDriveEnabled_Request_enabled
{
public:
  Init_SetDriveEnabled_Request_enabled()
  : msg_(::rosidl_runtime_cpp::MessageInitialization::SKIP)
  {}
  ::trolley_interfaces::srv::SetDriveEnabled_Request enabled(::trolley_interfaces::srv::SetDriveEnabled_Request::_enabled_type arg)
  {
    msg_.enabled = std::move(arg);
    return std::move(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Request msg_;
};

}  // namespace builder

}  // namespace srv

template<typename MessageType>
auto build();

template<>
inline
auto build<::trolley_interfaces::srv::SetDriveEnabled_Request>()
{
  return trolley_interfaces::srv::builder::Init_SetDriveEnabled_Request_enabled();
}

}  // namespace trolley_interfaces


namespace trolley_interfaces
{

namespace srv
{

namespace builder
{

class Init_SetDriveEnabled_Response_message
{
public:
  explicit Init_SetDriveEnabled_Response_message(::trolley_interfaces::srv::SetDriveEnabled_Response & msg)
  : msg_(msg)
  {}
  ::trolley_interfaces::srv::SetDriveEnabled_Response message(::trolley_interfaces::srv::SetDriveEnabled_Response::_message_type arg)
  {
    msg_.message = std::move(arg);
    return std::move(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Response msg_;
};

class Init_SetDriveEnabled_Response_success
{
public:
  Init_SetDriveEnabled_Response_success()
  : msg_(::rosidl_runtime_cpp::MessageInitialization::SKIP)
  {}
  Init_SetDriveEnabled_Response_message success(::trolley_interfaces::srv::SetDriveEnabled_Response::_success_type arg)
  {
    msg_.success = std::move(arg);
    return Init_SetDriveEnabled_Response_message(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Response msg_;
};

}  // namespace builder

}  // namespace srv

template<typename MessageType>
auto build();

template<>
inline
auto build<::trolley_interfaces::srv::SetDriveEnabled_Response>()
{
  return trolley_interfaces::srv::builder::Init_SetDriveEnabled_Response_success();
}

}  // namespace trolley_interfaces


namespace trolley_interfaces
{

namespace srv
{

namespace builder
{

class Init_SetDriveEnabled_Event_response
{
public:
  explicit Init_SetDriveEnabled_Event_response(::trolley_interfaces::srv::SetDriveEnabled_Event & msg)
  : msg_(msg)
  {}
  ::trolley_interfaces::srv::SetDriveEnabled_Event response(::trolley_interfaces::srv::SetDriveEnabled_Event::_response_type arg)
  {
    msg_.response = std::move(arg);
    return std::move(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Event msg_;
};

class Init_SetDriveEnabled_Event_request
{
public:
  explicit Init_SetDriveEnabled_Event_request(::trolley_interfaces::srv::SetDriveEnabled_Event & msg)
  : msg_(msg)
  {}
  Init_SetDriveEnabled_Event_response request(::trolley_interfaces::srv::SetDriveEnabled_Event::_request_type arg)
  {
    msg_.request = std::move(arg);
    return Init_SetDriveEnabled_Event_response(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Event msg_;
};

class Init_SetDriveEnabled_Event_info
{
public:
  Init_SetDriveEnabled_Event_info()
  : msg_(::rosidl_runtime_cpp::MessageInitialization::SKIP)
  {}
  Init_SetDriveEnabled_Event_request info(::trolley_interfaces::srv::SetDriveEnabled_Event::_info_type arg)
  {
    msg_.info = std::move(arg);
    return Init_SetDriveEnabled_Event_request(msg_);
  }

private:
  ::trolley_interfaces::srv::SetDriveEnabled_Event msg_;
};

}  // namespace builder

}  // namespace srv

template<typename MessageType>
auto build();

template<>
inline
auto build<::trolley_interfaces::srv::SetDriveEnabled_Event>()
{
  return trolley_interfaces::srv::builder::Init_SetDriveEnabled_Event_info();
}

}  // namespace trolley_interfaces

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__BUILDER_HPP_
