import 'package:json_annotation/json_annotation.dart';

enum AddressLabelType {
  @JsonValue('HOME')
  HOME,

  @JsonValue('WORK')
  WORK,

  @JsonValue('CUSTOM')
  CUSTOM,
}