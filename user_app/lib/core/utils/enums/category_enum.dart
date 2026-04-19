// core/utils/enums/category_enum.dart
import 'package:json_annotation/json_annotation.dart';

enum TypeOfCategory {
  @JsonValue('MASTER')
  MASTER,
  @JsonValue('SUPER')
  SUPER,
  @JsonValue('CATEGORY')
  CATEGORY,
  @JsonValue('SUBCATEGORY')
  SUBCATEGORY,
  @JsonValue('LEVEL_5')
  LEVEL_5,
  @JsonValue('LEVEL_6')
  LEVEL_6,
  @JsonValue('LEVEL_7')
  LEVEL_7,
}
