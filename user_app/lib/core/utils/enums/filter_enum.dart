// core/utils/filters/filter_types.dart
enum FilterOperator {
  eq, // =
  gt,
  gte,
  lt,
  lte,
  ne,
  inList,
  nin,
  exists,
}

extension FilterOperatorX on FilterOperator {
  String get key {
    switch (this) {
      case FilterOperator.eq:
        return '';
      case FilterOperator.gt:
        return 'gt';
      case FilterOperator.gte:
        return 'gte';
      case FilterOperator.lt:
        return 'lt';
      case FilterOperator.lte:
        return 'lte';
      case FilterOperator.ne:
        return 'ne';
      case FilterOperator.inList:
        return 'in';
      case FilterOperator.nin:
        return 'nin';
      case FilterOperator.exists:
        return 'exists';
    }
  }
}
