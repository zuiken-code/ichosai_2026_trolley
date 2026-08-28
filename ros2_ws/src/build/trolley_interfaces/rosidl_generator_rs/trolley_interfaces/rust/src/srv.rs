#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};




// Corresponds to trolley_interfaces__srv__SetDriveEnabled_Request

// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveEnabled_Request {

    // This member is not documented.
    #[allow(missing_docs)]
    pub enabled: bool,

}



impl Default for SetDriveEnabled_Request {
  fn default() -> Self {
    <Self as rosidl_runtime_rs::Message>::from_rmw_message(super::srv::rmw::SetDriveEnabled_Request::default())
  }
}

impl rosidl_runtime_rs::Message for SetDriveEnabled_Request {
  type RmwMsg = super::srv::rmw::SetDriveEnabled_Request;

  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> {
    match msg_cow {
      std::borrow::Cow::Owned(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
        enabled: msg.enabled,
      }),
      std::borrow::Cow::Borrowed(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
      enabled: msg.enabled,
      })
    }
  }

  fn from_rmw_message(msg: Self::RmwMsg) -> Self {
    Self {
      enabled: msg.enabled,
    }
  }
}


// Corresponds to trolley_interfaces__srv__SetDriveEnabled_Response

// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveEnabled_Response {

    // This member is not documented.
    #[allow(missing_docs)]
    pub success: bool,


    // This member is not documented.
    #[allow(missing_docs)]
    pub message: std::string::String,

}



impl Default for SetDriveEnabled_Response {
  fn default() -> Self {
    <Self as rosidl_runtime_rs::Message>::from_rmw_message(super::srv::rmw::SetDriveEnabled_Response::default())
  }
}

impl rosidl_runtime_rs::Message for SetDriveEnabled_Response {
  type RmwMsg = super::srv::rmw::SetDriveEnabled_Response;

  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> {
    match msg_cow {
      std::borrow::Cow::Owned(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
        success: msg.success,
        message: msg.message.as_str().into(),
      }),
      std::borrow::Cow::Borrowed(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
      success: msg.success,
        message: msg.message.as_str().into(),
      })
    }
  }

  fn from_rmw_message(msg: Self::RmwMsg) -> Self {
    Self {
      success: msg.success,
      message: msg.message.to_string(),
    }
  }
}


// Corresponds to trolley_interfaces__srv__SetDriveMode_Request

// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveMode_Request {

    // This member is not documented.
    #[allow(missing_docs)]
    pub mode: i32,

}



impl Default for SetDriveMode_Request {
  fn default() -> Self {
    <Self as rosidl_runtime_rs::Message>::from_rmw_message(super::srv::rmw::SetDriveMode_Request::default())
  }
}

impl rosidl_runtime_rs::Message for SetDriveMode_Request {
  type RmwMsg = super::srv::rmw::SetDriveMode_Request;

  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> {
    match msg_cow {
      std::borrow::Cow::Owned(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
        mode: msg.mode,
      }),
      std::borrow::Cow::Borrowed(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
      mode: msg.mode,
      })
    }
  }

  fn from_rmw_message(msg: Self::RmwMsg) -> Self {
    Self {
      mode: msg.mode,
    }
  }
}


// Corresponds to trolley_interfaces__srv__SetDriveMode_Response

// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveMode_Response {

    // This member is not documented.
    #[allow(missing_docs)]
    pub success: bool,


    // This member is not documented.
    #[allow(missing_docs)]
    pub message: std::string::String,

}



impl Default for SetDriveMode_Response {
  fn default() -> Self {
    <Self as rosidl_runtime_rs::Message>::from_rmw_message(super::srv::rmw::SetDriveMode_Response::default())
  }
}

impl rosidl_runtime_rs::Message for SetDriveMode_Response {
  type RmwMsg = super::srv::rmw::SetDriveMode_Response;

  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> {
    match msg_cow {
      std::borrow::Cow::Owned(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
        success: msg.success,
        message: msg.message.as_str().into(),
      }),
      std::borrow::Cow::Borrowed(msg) => std::borrow::Cow::Owned(Self::RmwMsg {
      success: msg.success,
        message: msg.message.as_str().into(),
      })
    }
  }

  fn from_rmw_message(msg: Self::RmwMsg) -> Self {
    Self {
      success: msg.success,
      message: msg.message.to_string(),
    }
  }
}






#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_service_type_support_handle__trolley_interfaces__srv__SetDriveEnabled() -> *const std::ffi::c_void;
}

// Corresponds to trolley_interfaces__srv__SetDriveEnabled
#[allow(missing_docs, non_camel_case_types)]
pub struct SetDriveEnabled;

impl rosidl_runtime_rs::Service for SetDriveEnabled {
    type Request = SetDriveEnabled_Request;
    type Response = SetDriveEnabled_Response;

    fn get_type_support() -> *const std::ffi::c_void {
        // SAFETY: No preconditions for this function.
        unsafe { rosidl_typesupport_c__get_service_type_support_handle__trolley_interfaces__srv__SetDriveEnabled() }
    }
}




#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_service_type_support_handle__trolley_interfaces__srv__SetDriveMode() -> *const std::ffi::c_void;
}

// Corresponds to trolley_interfaces__srv__SetDriveMode
#[allow(missing_docs, non_camel_case_types)]
pub struct SetDriveMode;

impl rosidl_runtime_rs::Service for SetDriveMode {
    type Request = SetDriveMode_Request;
    type Response = SetDriveMode_Response;

    fn get_type_support() -> *const std::ffi::c_void {
        // SAFETY: No preconditions for this function.
        unsafe { rosidl_typesupport_c__get_service_type_support_handle__trolley_interfaces__srv__SetDriveMode() }
    }
}


