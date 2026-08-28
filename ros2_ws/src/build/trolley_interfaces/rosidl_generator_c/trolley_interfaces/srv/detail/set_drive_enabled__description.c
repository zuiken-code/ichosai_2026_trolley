// generated from rosidl_generator_c/resource/idl__description.c.em
// with input from trolley_interfaces:srv/SetDriveEnabled.idl
// generated code does not contain a copyright notice

#include "trolley_interfaces/srv/detail/set_drive_enabled__functions.h"

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled__get_type_hash(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0xf4, 0xc0, 0xd7, 0x55, 0x02, 0xfe, 0x36, 0x8b,
      0x5b, 0x95, 0x76, 0xeb, 0xf0, 0xd0, 0x70, 0xf5,
      0x54, 0x1b, 0x9e, 0xfd, 0x03, 0xa3, 0x0d, 0x18,
      0x51, 0x53, 0x3f, 0x6d, 0x87, 0x82, 0x4f, 0x40,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0x58, 0x5e, 0xf3, 0x85, 0x79, 0xba, 0x05, 0x29,
      0x34, 0x8c, 0xf3, 0xc4, 0xaf, 0x15, 0x08, 0xa4,
      0xe1, 0x15, 0xfa, 0x1a, 0x0b, 0xdb, 0x06, 0xa7,
      0x8c, 0xdf, 0x95, 0x67, 0x0d, 0xbf, 0xa8, 0xa3,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0x51, 0x21, 0x8c, 0xd4, 0x92, 0x5d, 0x91, 0xa6,
      0xa0, 0x0f, 0x6d, 0xd5, 0xea, 0x83, 0x42, 0xb5,
      0x41, 0x69, 0x24, 0xdd, 0x70, 0x74, 0x85, 0xfe,
      0xf6, 0x1b, 0x25, 0xee, 0x04, 0x30, 0xa6, 0x70,
    }};
  return &hash;
}

ROSIDL_GENERATOR_C_PUBLIC_trolley_interfaces
const rosidl_type_hash_t *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_hash(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_type_hash_t hash = {1, {
      0xb0, 0xec, 0x0c, 0x95, 0x26, 0xa4, 0x55, 0xbc,
      0x19, 0xca, 0x19, 0x89, 0x3d, 0x77, 0x0c, 0xa5,
      0xce, 0xf3, 0xc8, 0x40, 0xa4, 0x25, 0xc3, 0x88,
      0xbc, 0x67, 0x7d, 0xde, 0x03, 0x82, 0x6a, 0x58,
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

static char trolley_interfaces__srv__SetDriveEnabled__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveEnabled";
static char builtin_interfaces__msg__Time__TYPE_NAME[] = "builtin_interfaces/msg/Time";
static char service_msgs__msg__ServiceEventInfo__TYPE_NAME[] = "service_msgs/msg/ServiceEventInfo";
static char trolley_interfaces__srv__SetDriveEnabled_Event__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveEnabled_Event";
static char trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveEnabled_Request";
static char trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME[] = "trolley_interfaces/srv/SetDriveEnabled_Response";

// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__request_message[] = "request_message";
static char trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__response_message[] = "response_message";
static char trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__event_message[] = "event_message";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveEnabled__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__request_message, 15, 15},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__response_message, 16, 16},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled__FIELD_NAME__event_message, 13, 13},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {trolley_interfaces__srv__SetDriveEnabled_Event__TYPE_NAME, 44, 44},
    },
    {NULL, 0, 0},
  },
};

static rosidl_runtime_c__type_description__IndividualTypeDescription trolley_interfaces__srv__SetDriveEnabled__REFERENCED_TYPE_DESCRIPTIONS[] = {
  {
    {builtin_interfaces__msg__Time__TYPE_NAME, 27, 27},
    {NULL, 0, 0},
  },
  {
    {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Event__TYPE_NAME, 44, 44},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled__get_type_description(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveEnabled__TYPE_NAME, 38, 38},
      {trolley_interfaces__srv__SetDriveEnabled__FIELDS, 3, 3},
    },
    {trolley_interfaces__srv__SetDriveEnabled__REFERENCED_TYPE_DESCRIPTIONS, 5, 5},
  };
  if (!constructed) {
    assert(0 == memcmp(&builtin_interfaces__msg__Time__EXPECTED_HASH, builtin_interfaces__msg__Time__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[0].fields = builtin_interfaces__msg__Time__get_type_description(NULL)->type_description.fields;
    assert(0 == memcmp(&service_msgs__msg__ServiceEventInfo__EXPECTED_HASH, service_msgs__msg__ServiceEventInfo__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[1].fields = service_msgs__msg__ServiceEventInfo__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[2].fields = trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[3].fields = trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[4].fields = trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description(NULL)->type_description.fields;
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveEnabled_Request__FIELD_NAME__enabled[] = "enabled";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveEnabled_Request__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveEnabled_Request__FIELD_NAME__enabled, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_BOOLEAN,
      0,
      0,
      {NULL, 0, 0},
    },
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
      {trolley_interfaces__srv__SetDriveEnabled_Request__FIELDS, 1, 1},
    },
    {NULL, 0, 0},
  };
  if (!constructed) {
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveEnabled_Response__FIELD_NAME__success[] = "success";
static char trolley_interfaces__srv__SetDriveEnabled_Response__FIELD_NAME__message[] = "message";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveEnabled_Response__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveEnabled_Response__FIELD_NAME__success, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_BOOLEAN,
      0,
      0,
      {NULL, 0, 0},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Response__FIELD_NAME__message, 7, 7},
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
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
      {trolley_interfaces__srv__SetDriveEnabled_Response__FIELDS, 2, 2},
    },
    {NULL, 0, 0},
  };
  if (!constructed) {
    constructed = true;
  }
  return &description;
}
// Define type names, field names, and default values
static char trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__info[] = "info";
static char trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__request[] = "request";
static char trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__response[] = "response";

static rosidl_runtime_c__type_description__Field trolley_interfaces__srv__SetDriveEnabled_Event__FIELDS[] = {
  {
    {trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__info, 4, 4},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE,
      0,
      0,
      {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__request, 7, 7},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE_BOUNDED_SEQUENCE,
      1,
      0,
      {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
    },
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Event__FIELD_NAME__response, 8, 8},
    {
      rosidl_runtime_c__type_description__FieldType__FIELD_TYPE_NESTED_TYPE_BOUNDED_SEQUENCE,
      1,
      0,
      {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
    },
    {NULL, 0, 0},
  },
};

static rosidl_runtime_c__type_description__IndividualTypeDescription trolley_interfaces__srv__SetDriveEnabled_Event__REFERENCED_TYPE_DESCRIPTIONS[] = {
  {
    {builtin_interfaces__msg__Time__TYPE_NAME, 27, 27},
    {NULL, 0, 0},
  },
  {
    {service_msgs__msg__ServiceEventInfo__TYPE_NAME, 33, 33},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
    {NULL, 0, 0},
  },
  {
    {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
    {NULL, 0, 0},
  },
};

const rosidl_runtime_c__type_description__TypeDescription *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static bool constructed = false;
  static const rosidl_runtime_c__type_description__TypeDescription description = {
    {
      {trolley_interfaces__srv__SetDriveEnabled_Event__TYPE_NAME, 44, 44},
      {trolley_interfaces__srv__SetDriveEnabled_Event__FIELDS, 3, 3},
    },
    {trolley_interfaces__srv__SetDriveEnabled_Event__REFERENCED_TYPE_DESCRIPTIONS, 4, 4},
  };
  if (!constructed) {
    assert(0 == memcmp(&builtin_interfaces__msg__Time__EXPECTED_HASH, builtin_interfaces__msg__Time__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[0].fields = builtin_interfaces__msg__Time__get_type_description(NULL)->type_description.fields;
    assert(0 == memcmp(&service_msgs__msg__ServiceEventInfo__EXPECTED_HASH, service_msgs__msg__ServiceEventInfo__get_type_hash(NULL), sizeof(rosidl_type_hash_t)));
    description.referenced_type_descriptions.data[1].fields = service_msgs__msg__ServiceEventInfo__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[2].fields = trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description(NULL)->type_description.fields;
    description.referenced_type_descriptions.data[3].fields = trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description(NULL)->type_description.fields;
    constructed = true;
  }
  return &description;
}

static char toplevel_type_raw_source[] =
  "bool enabled\n"
  "---\n"
  "bool success\n"
  "string message";

static char srv_encoding[] = "srv";
static char implicit_encoding[] = "implicit";

// Define all individual source functions

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled__get_individual_type_description_source(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveEnabled__TYPE_NAME, 38, 38},
    {srv_encoding, 3, 3},
    {toplevel_type_raw_source, 44, 44},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Request__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveEnabled_Request__TYPE_NAME, 46, 46},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Response__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveEnabled_Response__TYPE_NAME, 47, 47},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource *
trolley_interfaces__srv__SetDriveEnabled_Event__get_individual_type_description_source(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static const rosidl_runtime_c__type_description__TypeSource source = {
    {trolley_interfaces__srv__SetDriveEnabled_Event__TYPE_NAME, 44, 44},
    {implicit_encoding, 8, 8},
    {NULL, 0, 0},
  };
  return &source;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled__get_type_description_sources(
  const rosidl_service_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[6];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 6, 6};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveEnabled__get_individual_type_description_source(NULL),
    sources[1] = *builtin_interfaces__msg__Time__get_individual_type_description_source(NULL);
    sources[2] = *service_msgs__msg__ServiceEventInfo__get_individual_type_description_source(NULL);
    sources[3] = *trolley_interfaces__srv__SetDriveEnabled_Event__get_individual_type_description_source(NULL);
    sources[4] = *trolley_interfaces__srv__SetDriveEnabled_Request__get_individual_type_description_source(NULL);
    sources[5] = *trolley_interfaces__srv__SetDriveEnabled_Response__get_individual_type_description_source(NULL);
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Request__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[1];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 1, 1};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveEnabled_Request__get_individual_type_description_source(NULL),
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Response__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[1];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 1, 1};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveEnabled_Response__get_individual_type_description_source(NULL),
    constructed = true;
  }
  return &source_sequence;
}

const rosidl_runtime_c__type_description__TypeSource__Sequence *
trolley_interfaces__srv__SetDriveEnabled_Event__get_type_description_sources(
  const rosidl_message_type_support_t * type_support)
{
  (void)type_support;
  static rosidl_runtime_c__type_description__TypeSource sources[5];
  static const rosidl_runtime_c__type_description__TypeSource__Sequence source_sequence = {sources, 5, 5};
  static bool constructed = false;
  if (!constructed) {
    sources[0] = *trolley_interfaces__srv__SetDriveEnabled_Event__get_individual_type_description_source(NULL),
    sources[1] = *builtin_interfaces__msg__Time__get_individual_type_description_source(NULL);
    sources[2] = *service_msgs__msg__ServiceEventInfo__get_individual_type_description_source(NULL);
    sources[3] = *trolley_interfaces__srv__SetDriveEnabled_Request__get_individual_type_description_source(NULL);
    sources[4] = *trolley_interfaces__srv__SetDriveEnabled_Response__get_individual_type_description_source(NULL);
    constructed = true;
  }
  return &source_sequence;
}
