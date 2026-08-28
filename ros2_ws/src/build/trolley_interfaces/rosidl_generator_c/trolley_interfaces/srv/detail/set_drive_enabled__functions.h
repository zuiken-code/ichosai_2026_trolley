// generated from rosidl_generator_c/resource/idl__functions.h.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

// IWYU pragma: private, include "trolley_interfaces/srv/set_drive_enabled.h"


#ifndef TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__FUNCTIONS_H_
#define TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__FUNCTIONS_H_

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdbool.h>
#include <stdlib.h>

#include "rosidl_runtime_c/action_type_support_struct.h"
#include "rosidl_runtime_c/message_type_support_struct.h"
#include "rosidl_runtime_c/service_type_support_struct.h"
#include "rosidl_runtime_c/type_description/type_description__struct.h"
#include "rosidl_runtime_c/type_description/type_source__struct.h"
#include "rosidl_runtime_c/type_hash.h"
#include "rosidl_runtime_c/visibility_control.h"
#include "trolley_interfaces/msg/rosidl_generator_c__visibility_control.h"

#include "trolley_interfaces/srv/detail/set_drive_enabled__struct.h"

/// Retrieve pointer to the hash of the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled__get_type_hash(
  const rosidl_service_type_support_t * type_support);

/// Retrieve pointer to the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled__get_type_description(
  const rosidl_service_type_support_t * type_support);

/// Retrieve pointer to the single raw source text that defined this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled__get_individual_type_description_source(
  const rosidl_service_type_support_t * type_support);

/// Retrieve pointer to the recursive raw sources that defined the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled__get_type_description_sources(
  const rosidl_service_type_support_t * type_support);

/// Initialize srv/SetDriveEnabled message.
/**
 * If the init function is called twice for the same message without
 * calling fini inbetween previously allocated memory will be leaked.
 * \param[in,out] msg The previously allocated message pointer.
 * Fields without a default value will not be initialized by this function.
 * You might want to call memset(msg, 0, sizeof(
 * trolley_interfaces__srv__SetDriveEnabled_Request
 * )) before or use
 * trolley_interfaces__srv__SetDriveEnabled_Request__create()
 * to allocate and initialize the message.
 * \return true if initialization was successful, otherwise false
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__init(trolley_interfaces__srv__SetDriveEnabled_Request * msg);

/// Finalize srv/SetDriveEnabled message.
/**
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Request__fini(trolley_interfaces__srv__SetDriveEnabled_Request * msg);

/// Create srv/SetDriveEnabled message.
/**
 * It allocates the memory for the message, sets the memory to zero, and
 * calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__init().
 * \return The pointer to the initialized message if successful,
 * otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Request *
trolley_interfaces__srv__SetDriveEnabled_Request__create(void);

/// Destroy srv/SetDriveEnabled message.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__fini()
 * and frees the memory of the message.
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Request__destroy(trolley_interfaces__srv__SetDriveEnabled_Request * msg);

/// Check for srv/SetDriveEnabled message equality.
/**
 * \param[in] lhs The message on the left hand size of the equality operator.
 * \param[in] rhs The message on the right hand size of the equality operator.
 * \return true if messages are equal, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Request * lhs, const trolley_interfaces__srv__SetDriveEnabled_Request * rhs);

/// Copy a srv/SetDriveEnabled message.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source message pointer.
 * \param[out] output The target message pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer is null
 *   or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Request * input,
  trolley_interfaces__srv__SetDriveEnabled_Request * output);

/// Retrieve pointer to the hash of the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_hash(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the single raw source text that defined this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Request__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the recursive raw sources that defined the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description_sources(
  const rosidl_message_type_support_t * type_support);

/// Initialize array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the number of elements and calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__init()
 * for each element of the array.
 * \param[in,out] array The allocated array pointer.
 * \param[in] size The size / capacity of the array.
 * \return true if initialization was successful, otherwise false
 * If the array pointer is valid and the size is zero it is guaranteed
 # to return true.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__init(trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * array, size_t size);

/// Finalize array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__fini()
 * for each element of the array and frees the memory for the number of
 * elements.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__fini(trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * array);

/// Create array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the array and calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__init().
 * \param[in] size The size / capacity of the array.
 * \return The pointer to the initialized array if successful, otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__create(size_t size);

/// Destroy array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__fini()
 * on the array,
 * and frees the memory of the array.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__destroy(trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * array);

/// Check for srv/SetDriveEnabled message array equality.
/**
 * \param[in] lhs The message array on the left hand size of the equality operator.
 * \param[in] rhs The message array on the right hand size of the equality operator.
 * \return true if message arrays are equal in size and content, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * lhs, const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * rhs);

/// Copy an array of srv/SetDriveEnabled messages.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source array pointer.
 * \param[out] output The target array pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer
 *   is null or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Request__Sequence__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * input,
  trolley_interfaces__srv__SetDriveEnabled_Request__Sequence * output);

/// Initialize srv/SetDriveEnabled message.
/**
 * If the init function is called twice for the same message without
 * calling fini inbetween previously allocated memory will be leaked.
 * \param[in,out] msg The previously allocated message pointer.
 * Fields without a default value will not be initialized by this function.
 * You might want to call memset(msg, 0, sizeof(
 * trolley_interfaces__srv__SetDriveEnabled_Response
 * )) before or use
 * trolley_interfaces__srv__SetDriveEnabled_Response__create()
 * to allocate and initialize the message.
 * \return true if initialization was successful, otherwise false
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__init(trolley_interfaces__srv__SetDriveEnabled_Response * msg);

/// Finalize srv/SetDriveEnabled message.
/**
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Response__fini(trolley_interfaces__srv__SetDriveEnabled_Response * msg);

/// Create srv/SetDriveEnabled message.
/**
 * It allocates the memory for the message, sets the memory to zero, and
 * calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__init().
 * \return The pointer to the initialized message if successful,
 * otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Response *
trolley_interfaces__srv__SetDriveEnabled_Response__create(void);

/// Destroy srv/SetDriveEnabled message.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__fini()
 * and frees the memory of the message.
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Response__destroy(trolley_interfaces__srv__SetDriveEnabled_Response * msg);

/// Check for srv/SetDriveEnabled message equality.
/**
 * \param[in] lhs The message on the left hand size of the equality operator.
 * \param[in] rhs The message on the right hand size of the equality operator.
 * \return true if messages are equal, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Response * lhs, const trolley_interfaces__srv__SetDriveEnabled_Response * rhs);

/// Copy a srv/SetDriveEnabled message.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source message pointer.
 * \param[out] output The target message pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer is null
 *   or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Response * input,
  trolley_interfaces__srv__SetDriveEnabled_Response * output);

/// Retrieve pointer to the hash of the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_hash(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the single raw source text that defined this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Response__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the recursive raw sources that defined the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description_sources(
  const rosidl_message_type_support_t * type_support);

/// Initialize array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the number of elements and calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__init()
 * for each element of the array.
 * \param[in,out] array The allocated array pointer.
 * \param[in] size The size / capacity of the array.
 * \return true if initialization was successful, otherwise false
 * If the array pointer is valid and the size is zero it is guaranteed
 # to return true.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__init(trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * array, size_t size);

/// Finalize array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__fini()
 * for each element of the array and frees the memory for the number of
 * elements.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__fini(trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * array);

/// Create array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the array and calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__init().
 * \param[in] size The size / capacity of the array.
 * \return The pointer to the initialized array if successful, otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__create(size_t size);

/// Destroy array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__fini()
 * on the array,
 * and frees the memory of the array.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__destroy(trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * array);

/// Check for srv/SetDriveEnabled message array equality.
/**
 * \param[in] lhs The message array on the left hand size of the equality operator.
 * \param[in] rhs The message array on the right hand size of the equality operator.
 * \return true if message arrays are equal in size and content, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * lhs, const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * rhs);

/// Copy an array of srv/SetDriveEnabled messages.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source array pointer.
 * \param[out] output The target array pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer
 *   is null or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Response__Sequence__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * input,
  trolley_interfaces__srv__SetDriveEnabled_Response__Sequence * output);

/// Initialize srv/SetDriveEnabled message.
/**
 * If the init function is called twice for the same message without
 * calling fini inbetween previously allocated memory will be leaked.
 * \param[in,out] msg The previously allocated message pointer.
 * Fields without a default value will not be initialized by this function.
 * You might want to call memset(msg, 0, sizeof(
 * trolley_interfaces__srv__SetDriveEnabled_Event
 * )) before or use
 * trolley_interfaces__srv__SetDriveEnabled_Event__create()
 * to allocate and initialize the message.
 * \return true if initialization was successful, otherwise false
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__init(trolley_interfaces__srv__SetDriveEnabled_Event * msg);

/// Finalize srv/SetDriveEnabled message.
/**
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Event__fini(trolley_interfaces__srv__SetDriveEnabled_Event * msg);

/// Create srv/SetDriveEnabled message.
/**
 * It allocates the memory for the message, sets the memory to zero, and
 * calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__init().
 * \return The pointer to the initialized message if successful,
 * otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Event *
trolley_interfaces__srv__SetDriveEnabled_Event__create(void);

/// Destroy srv/SetDriveEnabled message.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__fini()
 * and frees the memory of the message.
 * \param[in,out] msg The allocated message pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Event__destroy(trolley_interfaces__srv__SetDriveEnabled_Event * msg);

/// Check for srv/SetDriveEnabled message equality.
/**
 * \param[in] lhs The message on the left hand size of the equality operator.
 * \param[in] rhs The message on the right hand size of the equality operator.
 * \return true if messages are equal, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Event * lhs, const trolley_interfaces__srv__SetDriveEnabled_Event * rhs);

/// Copy a srv/SetDriveEnabled message.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source message pointer.
 * \param[out] output The target message pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer is null
 *   or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Event * input,
  trolley_interfaces__srv__SetDriveEnabled_Event * output);

/// Retrieve pointer to the hash of the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_hash(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the single raw source text that defined this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Event__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support);

/// Retrieve pointer to the recursive raw sources that defined the description of this type.
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description_sources(
  const rosidl_message_type_support_t * type_support);

/// Initialize array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the number of elements and calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__init()
 * for each element of the array.
 * \param[in,out] array The allocated array pointer.
 * \param[in] size The size / capacity of the array.
 * \return true if initialization was successful, otherwise false
 * If the array pointer is valid and the size is zero it is guaranteed
 # to return true.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__init(trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * array, size_t size);

/// Finalize array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__fini()
 * for each element of the array and frees the memory for the number of
 * elements.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__fini(trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * array);

/// Create array of srv/SetDriveEnabled messages.
/**
 * It allocates the memory for the array and calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__init().
 * \param[in] size The size / capacity of the array.
 * \return The pointer to the initialized array if successful, otherwise NULL
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__create(size_t size);

/// Destroy array of srv/SetDriveEnabled messages.
/**
 * It calls
 * trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__fini()
 * on the array,
 * and frees the memory of the array.
 * \param[in,out] array The initialized array pointer.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
void
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__destroy(trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * array);

/// Check for srv/SetDriveEnabled message array equality.
/**
 * \param[in] lhs The message array on the left hand size of the equality operator.
 * \param[in] rhs The message array on the right hand size of the equality operator.
 * \return true if message arrays are equal in size and content, otherwise false.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__are_equal(const trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * lhs, const trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * rhs);

/// Copy an array of srv/SetDriveEnabled messages.
/**
 * This functions performs a deep copy, as opposed to the shallow copy that
 * plain assignment yields.
 *
 * \param[in] input The source array pointer.
 * \param[out] output The target array pointer, which must
 *   have been initialized before calling this function.
 * \return true if successful, or false if either pointer
 *   is null or memory allocation fails.
 */
ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
bool
trolley_interfaces__srv__SetDriveEnabled_Event__Sequence__copy(
  const trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * input,
  trolley_interfaces__srv__SetDriveEnabled_Event__Sequence * output);
#ifdef __cplusplus
}
#endif

#endif  // TROLLEY_INTERFACES__SRV__DETAIL__SET_DRIVE_ENABLED__FUNCTIONS_H_
