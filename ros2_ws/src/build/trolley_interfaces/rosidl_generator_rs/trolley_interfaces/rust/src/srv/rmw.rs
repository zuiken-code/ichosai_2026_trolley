#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};



#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveEnabled_Request() -> *const std::ffi::c_void;
}

#[link(name = "trolley_interfaces__rosidl_generator_c")]
extern "C" {
    fn trolley_interfaces__srv__SetDriveEnabled_Request__init(msg: *mut SetDriveEnabled_Request) -> bool;
    fn trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__init(seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Request>, size: usize) -> bool;
    fn trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__fini(seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Request>);
    fn trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__copy(in_seq: &rosidl_runtime_rs::Sequence<SetDriveEnabled_Request>, out_seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Request>) -> bool;
}

// Corresponds to trolley_interfaces__srv__SetDriveEnabled_Request
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]


// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveEnabled_Request {

    // This member is not documented.
    #[allow(missing_docs)]
    pub enabled: bool,

}



impl Default for SetDriveEnabled_Request {
  fn default() -> Self {
    unsafe {
      let mut msg = std::mem::zeroed();
      if !trolley_interfaces__srv__SetDriveEnabled_Request__init(&mut msg as *mut _) {
        panic!("Call to trolley_interfaces__srv__SetDriveEnabled_Request__init() failed");
      }
      msg
    }
  }
}

impl rosidl_runtime_rs::SequenceAlloc for SetDriveEnabled_Request {
  fn sequence_init(seq: &mut rosidl_runtime_rs::Sequence<Self>, size: usize) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__init(seq as *mut _, size) }
  }
  fn sequence_fini(seq: &mut rosidl_runtime_rs::Sequence<Self>) {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__fini(seq as *mut _) }
  }
  fn sequence_copy(in_seq: &rosidl_runtime_rs::Sequence<Self>, out_seq: &mut rosidl_runtime_rs::Sequence<Self>) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__copy(in_seq, out_seq as *mut _) }
  }
}

impl rosidl_runtime_rs::Message for SetDriveEnabled_Request {
  type RmwMsg = Self;
  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> { msg_cow }
  fn from_rmw_message(msg: Self::RmwMsg) -> Self { msg }
}

impl rosidl_runtime_rs::RmwMessage for SetDriveEnabled_Request where Self: Sized {
  const TYPE_NAME: &'static str = "trolley_interfaces/srv/SetDriveEnabled_Request";
  fn get_type_support() -> *const std::ffi::c_void {
    // SAFETY: No preconditions for this function.
    unsafe { rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveEnabled_Request() }
  }
}


#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveEnabled_Response() -> *const std::ffi::c_void;
}

#[link(name = "trolley_interfaces__rosidl_generator_c")]
extern "C" {
    fn trolley_interfaces__srv__SetDriveEnabled_Response__init(msg: *mut SetDriveEnabled_Response) -> bool;
    fn trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__init(seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Response>, size: usize) -> bool;
    fn trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__fini(seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Response>);
    fn trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__copy(in_seq: &rosidl_runtime_rs::Sequence<SetDriveEnabled_Response>, out_seq: *mut rosidl_runtime_rs::Sequence<SetDriveEnabled_Response>) -> bool;
}

// Corresponds to trolley_interfaces__srv__SetDriveEnabled_Response
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]


// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveEnabled_Response {

    // This member is not documented.
    #[allow(missing_docs)]
    pub success: bool,


    // This member is not documented.
    #[allow(missing_docs)]
    pub message: rosidl_runtime_rs::String,

}



impl Default for SetDriveEnabled_Response {
  fn default() -> Self {
    unsafe {
      let mut msg = std::mem::zeroed();
      if !trolley_interfaces__srv__SetDriveEnabled_Response__init(&mut msg as *mut _) {
        panic!("Call to trolley_interfaces__srv__SetDriveEnabled_Response__init() failed");
      }
      msg
    }
  }
}

impl rosidl_runtime_rs::SequenceAlloc for SetDriveEnabled_Response {
  fn sequence_init(seq: &mut rosidl_runtime_rs::Sequence<Self>, size: usize) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__init(seq as *mut _, size) }
  }
  fn sequence_fini(seq: &mut rosidl_runtime_rs::Sequence<Self>) {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__fini(seq as *mut _) }
  }
  fn sequence_copy(in_seq: &rosidl_runtime_rs::Sequence<Self>, out_seq: &mut rosidl_runtime_rs::Sequence<Self>) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__copy(in_seq, out_seq as *mut _) }
  }
}

impl rosidl_runtime_rs::Message for SetDriveEnabled_Response {
  type RmwMsg = Self;
  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> { msg_cow }
  fn from_rmw_message(msg: Self::RmwMsg) -> Self { msg }
}

impl rosidl_runtime_rs::RmwMessage for SetDriveEnabled_Response where Self: Sized {
  const TYPE_NAME: &'static str = "trolley_interfaces/srv/SetDriveEnabled_Response";
  fn get_type_support() -> *const std::ffi::c_void {
    // SAFETY: No preconditions for this function.
    unsafe { rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveEnabled_Response() }
  }
}


#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveMode_Request() -> *const std::ffi::c_void;
}

#[link(name = "trolley_interfaces__rosidl_generator_c")]
extern "C" {
    fn trolley_interfaces__srv__SetDriveMode_Request__init(msg: *mut SetDriveMode_Request) -> bool;
    fn trolley_interfaces__srv__SetDriveMode_Request__Sequence__init(seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Request>, size: usize) -> bool;
    fn trolley_interfaces__srv__SetDriveMode_Request__Sequence__fini(seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Request>);
    fn trolley_interfaces__srv__SetDriveMode_Request__Sequence__copy(in_seq: &rosidl_runtime_rs::Sequence<SetDriveMode_Request>, out_seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Request>) -> bool;
}

// Corresponds to trolley_interfaces__srv__SetDriveMode_Request
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]


// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveMode_Request {

    // This member is not documented.
    #[allow(missing_docs)]
    pub mode: i32,

}



impl Default for SetDriveMode_Request {
  fn default() -> Self {
    unsafe {
      let mut msg = std::mem::zeroed();
      if !trolley_interfaces__srv__SetDriveMode_Request__init(&mut msg as *mut _) {
        panic!("Call to trolley_interfaces__srv__SetDriveMode_Request__init() failed");
      }
      msg
    }
  }
}

impl rosidl_runtime_rs::SequenceAlloc for SetDriveMode_Request {
  fn sequence_init(seq: &mut rosidl_runtime_rs::Sequence<Self>, size: usize) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Request__Sequence__init(seq as *mut _, size) }
  }
  fn sequence_fini(seq: &mut rosidl_runtime_rs::Sequence<Self>) {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Request__Sequence__fini(seq as *mut _) }
  }
  fn sequence_copy(in_seq: &rosidl_runtime_rs::Sequence<Self>, out_seq: &mut rosidl_runtime_rs::Sequence<Self>) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Request__Sequence__copy(in_seq, out_seq as *mut _) }
  }
}

impl rosidl_runtime_rs::Message for SetDriveMode_Request {
  type RmwMsg = Self;
  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> { msg_cow }
  fn from_rmw_message(msg: Self::RmwMsg) -> Self { msg }
}

impl rosidl_runtime_rs::RmwMessage for SetDriveMode_Request where Self: Sized {
  const TYPE_NAME: &'static str = "trolley_interfaces/srv/SetDriveMode_Request";
  fn get_type_support() -> *const std::ffi::c_void {
    // SAFETY: No preconditions for this function.
    unsafe { rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveMode_Request() }
  }
}


#[link(name = "trolley_interfaces__rosidl_typesupport_c")]
extern "C" {
    fn rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveMode_Response() -> *const std::ffi::c_void;
}

#[link(name = "trolley_interfaces__rosidl_generator_c")]
extern "C" {
    fn trolley_interfaces__srv__SetDriveMode_Response__init(msg: *mut SetDriveMode_Response) -> bool;
    fn trolley_interfaces__srv__SetDriveMode_Response__Sequence__init(seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Response>, size: usize) -> bool;
    fn trolley_interfaces__srv__SetDriveMode_Response__Sequence__fini(seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Response>);
    fn trolley_interfaces__srv__SetDriveMode_Response__Sequence__copy(in_seq: &rosidl_runtime_rs::Sequence<SetDriveMode_Response>, out_seq: *mut rosidl_runtime_rs::Sequence<SetDriveMode_Response>) -> bool;
}

// Corresponds to trolley_interfaces__srv__SetDriveMode_Response
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]


// This struct is not documented.
#[allow(missing_docs)]

#[allow(non_camel_case_types)]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, PartialOrd)]
pub struct SetDriveMode_Response {

    // This member is not documented.
    #[allow(missing_docs)]
    pub success: bool,


    // This member is not documented.
    #[allow(missing_docs)]
    pub message: rosidl_runtime_rs::String,

}



impl Default for SetDriveMode_Response {
  fn default() -> Self {
    unsafe {
      let mut msg = std::mem::zeroed();
      if !trolley_interfaces__srv__SetDriveMode_Response__init(&mut msg as *mut _) {
        panic!("Call to trolley_interfaces__srv__SetDriveMode_Response__init() failed");
      }
      msg
    }
  }
}

impl rosidl_runtime_rs::SequenceAlloc for SetDriveMode_Response {
  fn sequence_init(seq: &mut rosidl_runtime_rs::Sequence<Self>, size: usize) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Response__Sequence__init(seq as *mut _, size) }
  }
  fn sequence_fini(seq: &mut rosidl_runtime_rs::Sequence<Self>) {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Response__Sequence__fini(seq as *mut _) }
  }
  fn sequence_copy(in_seq: &rosidl_runtime_rs::Sequence<Self>, out_seq: &mut rosidl_runtime_rs::Sequence<Self>) -> bool {
    // SAFETY: This is safe since the pointer is guaranteed to be valid/initialized.
    unsafe { trolley_interfaces__srv__SetDriveMode_Response__Sequence__copy(in_seq, out_seq as *mut _) }
  }
}

impl rosidl_runtime_rs::Message for SetDriveMode_Response {
  type RmwMsg = Self;
  fn into_rmw_message(msg_cow: std::borrow::Cow<'_, Self>) -> std::borrow::Cow<'_, Self::RmwMsg> { msg_cow }
  fn from_rmw_message(msg: Self::RmwMsg) -> Self { msg }
}

impl rosidl_runtime_rs::RmwMessage for SetDriveMode_Response where Self: Sized {
  const TYPE_NAME: &'static str = "trolley_interfaces/srv/SetDriveMode_Response";
  fn get_type_support() -> *const std::ffi::c_void {
    // SAFETY: No preconditions for this function.
    unsafe { rosidl_typesupport_c__get_message_type_support_handle__trolley_interfaces__srv__SetDriveMode_Response() }
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


