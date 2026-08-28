// generated from rosidl_generator_c/resource/idl__description.c.em
// with input from trolley_interfaces:srv/SetDriveMode.idl
// generated code does not contain a copyright notice

#include "trolley_interfaces/srv/detail/set_drive_mode__functions.h"

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveMode__get_type_hash(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0xa6, 0x5c, 0xda, 0x4a, 0x81, 0x03, 0x35, 0x86,
      0x3f, 0x66, 0xc1, 0x68, 0xc2, 0xc2, 0xab, 0xe8,
      0x75, 0xd3, 0x39, 0x72, 0xdb, 0x8b, 0xbd, 0x47,
      0x6f, 0x8b, 0x75, 0x0f, 0xe9, 0xb5, 0xfd, 0xa6,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveMode_Request__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0x66, 0xdd, 0x44, 0x4d, 0x44, 0xf7, 0x88, 0x92,
      0x1c, 0xc1, 0x5a, 0x78, 0x65, 0xb4, 0x8a, 0x9f,
      0xba, 0x41, 0x99, 0x57, 0xed, 0x97, 0xb2, 0xd8,
      0x28, 0xca, 0xad, 0x8f, 0xa8, 0x9f, 0xca, 0x1d,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveMode_Response__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0xce, 0xcf, 0x9c, 0x8a, 0x6c, 0x7a, 0xfe, 0x71,
      0x97, 0x07, 0xd8, 0x2c, 0xea, 0x4f, 0xc6, 0xa1,
      0x0d, 0x6f, 0xfd, 0x22, 0x52, 0xce, 0x5c, 0xcf,
      0xa2, 0x97, 0xec, 0xf6, 0x75, 0x8f, 0x47, 0x86,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveMode_Event__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0x1a, 0x57, 0xc1, 0x88, 0x2c, 0x03, 0x1c, 0xac,
      0xfe, 0x70, 0x53, 0xdb, 0x8d, 0xfa, 0x7b, 0x97,
      0x62, 0xf9, 0x9b, 0x21, 0x59, 0x2d, 0xc5, 0xce,
      0x47, 0xc4, 0x88, 0x0e, 0x1b, 0xa8, 0x73, 0xbd,
    }};
  return &hash;
}

#include <assert.h>
#include <string.h>

// Include directives for referenced types
#include "service_msgs/msg/detail/service_event_info__functions.h"
#include "builtin_interfaces/msg/detail/time__functions.h"

// Hashes for external referenced types
#ifndef NDEBUG
static const rosidl_type_hash_t builtin_interfaces__msg__Time__EXPECTED_HASH = {1, {
    0xb1, 0x06, 0x23, 0x5e, 0x25, 0xa4, 0xc5, 0xed,
    0x35, 0x09, 0x8a, 0xa0, 0xa6, 0x1a, 0x3e, 0xe9,
    0xc9, 0xb1, 0x8d, 0x19, 0x7f, 0x39, 0x8b, 0x0e,
    0x42, 0x06, 0xce, 0xa9, 0xac, 0xf9, 0xc1, 0x97,
  }};
static const rosidl_type_hash_t service_msgs__msg__ServiceEventInfo__EXPECTED_HASH = {1, {
    0x41, 0xbc, 0xbb, 0xe0, 0x7a, 0x75, 0xc9, 0xb5,
    0x2b, 0xc9, 0x6b, 0xfd, 0x5c, 0x24, 0xd7, 0xf0,
    0xfc, 0x0a, 0x08, 0xc0, 0xcb, 0x79, 0x21, 0xb3,
    0x37, 0x3c, 0x57, 0x32, 0x34, 0x5a, 0x6f, 0x45,
  }};
#endif

static char trolley_interfaces__srv__SetDriveMode__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveMode";
static char builtin_interfaces__msg__Time__TYPE_NAME[] = "builtin_interfaces/msg/Time";
static char service_msgs__msg__ServiceEventInfo__TYPE_NAME[] = "service_msgs/msg/ServiceEventInfo";
static char trolley_interfaces__srv__SetDriveMode_Event__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveMode_Event";
static char trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveMode_Request";
static char trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveMode_Response";

// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveMode__FIELD_NAME__request_message[] = "request_message";
static char trolley_interfaces__srv__SetDriveMode__FIELD_NAME__response_message[] = "response_message";
static char trolley_interfaces__srv__SetDriveMode__FIELD_NAME__event_message[] = "event_message";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveMode__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveMode__FIELD_NAME__request_message, 15, 15},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode__FIELD_NAME__response_message, 16, 16},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode__FIELD_NAME__event_message, 13, 13},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveMode_Event__TYPE_NAME, 41, 41},
    },
    {NULL, 0, 0},
  },
};

static rosidl_runtime_c__type_description__IndividualTypeDescription trolley_interfaces__srv__SetDriveMode__REFERENCED_TYPE_DESCRIPTIONS[] = {
  {
    {builtin_interfaces__msg__Time__TYPE_NAME, 27, 27},
    {NULL, 0, 0},
  },
  {
    {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Event__TYPE_NAME, 41, 41},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveMode__get_type_description(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveMode__TYPE_NAME, 35, 35},
      {trolley_interfaces__srv__SetDriveMode__FIELDS, 3, 3},
    },
    {trolley_interfaces__srv__SetDriveMode__REFERENCED_TYPE_DESCRIPTIONS, 5, 5},
  };
  if (!constructed) {
    assert(0 == memcmp(&builtin_interfaces__msg__Time__EXPECTED_HASH, builtin_interfaces__msg__Time__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[0].fields = builtin_interfaces__msg__Time__get_type_description(NULL)->type_description.fields;
    assert(0 == memcmp(&service_msgs__msg__ServiceEventInfo__EXPECTED_HASH, service_msgs__msg__ServiceEventInfo__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[1].fields = service_msgs__msg__ServiceEventInfo__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[2].fields = trolley_interfaces__srv__SetDriveMode_Event__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[3].fields = trolley_interfaces__srv__SetDriveMode_Request__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[4].fields = trolley_interfaces__srv__SetDriveMode_Response__get_type_description(NULL)->type_description.fields;
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveMode_Request__FIELD_NAME__mode[] = "mode";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveMode_Request__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveMode_Request__FIELD_NAME__mode, 4, 4},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_INT32,
      0,
      0,
      {NULL, 0, 0},
    },
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveMode_Request__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
      {trolley_interfaces__srv__SetDriveMode_Request__FIELDS, 1, 1},
    },
    {NULL, 0, 0},
  };
  if (!constructed) {
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveMode_Response__FIELD_NAME__success[] = "success";
static char trolley_interfaces__srv__SetDriveMode_Response__FIELD_NAME__message[] = "message";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveMode_Response__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveMode_Response__FIELD_NAME__success, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_BOOLEAN,
      0,
      0,
      {NULL, 0, 0},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Response__FIELD_NAME__message, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_STRING,
      0,
      0,
      {NULL, 0, 0},
    },
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveMode_Response__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
      {trolley_interfaces__srv__SetDriveMode_Response__FIELDS, 2, 2},
    },
    {NULL, 0, 0},
  };
  if (!constructed) {
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__info[] = "info";
static char trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__request[] = "request";
static char trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__response[] = "response";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveMode_Event__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__info, 4, 4},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__request, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE_BOUNDED_SEQUENCE,
      1,
      0,
      {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Event__FIELD_NAME__response, 8, 8},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE_BOUNDED_SEQUENCE,
      1,
      0,
      {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
    },
    {NULL, 0, 0},
  },
};

static rosidl_runtime_c__type_description__IndividualTypeDescription trolley_interfaces__srv__SetDriveMode_Event__REFERENCED_TYPE_DESCRIPTIONS[] = {
  {
    {builtin_interfaces__msg__Time__TYPE_NAME, 27, 27},
    {NULL, 0, 0},
  },
  {
    {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveMode_Event__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveMode_Event__TYPE_NAME, 41, 41},
      {trolley_interfaces__srv__SetDriveMode_Event__FIELDS, 3, 3},
    },
    {trolley_interfaces__srv__SetDriveMode_Event__REFERENCED_TYPE_DESCRIPTIONS, 4, 4},
  };
  if (!constructed) {
    assert(0 == memcmp(&builtin_interfaces__msg__Time__EXPECTED_HASH, builtin_interfaces__msg__Time__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[0].fields = builtin_interfaces__msg__Time__get_type_description(NULL)->type_description.fields;
    assert(0 == memcmp(&service_msgs__msg__ServiceEventInfo__EXPECTED_HASH, service_msgs__msg__ServiceEventInfo__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[1].fields = service_msgs__msg__ServiceEventInfo__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[2].fields = trolley_interfaces__srv__SetDriveMode_Request__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[3].fields = trolley_interfaces__srv__SetDriveMode_Response__get_type_description(NULL)->type_description.fields;
    constructed = true;
  }
  return &description;
}

static char toplevel_type_raw_source[] =
  "int32 mode\n"
  "---\n"
  "bool success\n"
  "string message";

static char srv_encoding[] = "srv";
static char implicit_encoding[] = "implicit";

// Define all individual source functions

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveMode__get_individual_type_description_source(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveMode__TYPE_NAME, 35, 35},
    {srv_encoding, 3, 3},
    {toplevel_type_raw_source, 42, 42},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveMode_Request__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveMode_Request__TYPE_NAME, 43, 43},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveMode_Response__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveMode_Response__TYPE_NAME, 44, 44},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveMode_Event__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveMode_Event__TYPE_NAME, 41, 41},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveMode__get_type_description_sources(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[6];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 6, 6};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveMode__get_individual_type_description_source(NULL),
    sources[1] = *builtin_interfaces__msg__Time__get_individual_type_description_source(NULL);
    sources[2] = *service_msgs__msg__ServiceEventInfo__get_individual_type_description_source(NULL);
    sources[3] = *trolley_interfaces__srv__SetDriveMode_Event__get_individual_type_description_source(NULL);
    sources[4] = *trolley_interfaces__srv__SetDriveMode_Request__get_individual_type_description_source(NULL);
    sources[5] = *trolley_interfaces__srv__SetDriveMode_Response__get_individual_type_description_source(NULL);
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveMode_Request__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[1];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 1, 1};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveMode_Request__get_individual_type_description_source(NULL),
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveMode_Response__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[1];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 1, 1};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveMode_Response__get_individual_type_description_source(NULL),
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveMode_Event__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[5];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 5, 5};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveMode_Event__get_individual_type_description_source(NULL),
    sources[1] = *builtin_interfaces__msg__Time__get_individual_type_description_source(NULL);
    sources[2] = *service_msgs__msg__ServiceEventInfo__get_individual_type_description_source(NULL);
    sources[3] = *trolley_interfaces__srv__SetDriveMode_Request__get_individual_type_description_source(NULL);
    sources[4] = *trolley_interfaces__srv__SetDriveMode_Response__get_individual_type_description_source(NULL);
    constructed = true;
  }
  return &source_sequence;
}
