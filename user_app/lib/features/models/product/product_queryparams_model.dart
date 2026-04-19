/// Query params for product endpoints
class ProductQueryParams {
  final String? search;
  final int? page;
  final int? limit;
  final String? sortBy;

  ProductQueryParams({
    this.search,
    this.page,
    this.limit,
    this.sortBy,
  });

  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{};
    if (search != null) map['search'] = search;
    if (page != null) map['page'] = page;
    if (limit != null) map['limit'] = limit;
    if (sortBy != null) map['sortBy'] = sortBy;
    return map;
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
          other is ProductQueryParams &&
              runtimeType == other.runtimeType &&
              search == other.search &&
              page == other.page &&
              limit == other.limit &&
              sortBy == other.sortBy;

  @override
  int get hashCode =>
      (search?.hashCode ?? 0) ^
      (page?.hashCode ?? 0) ^
      (limit?.hashCode ?? 0) ^
      (sortBy?.hashCode ?? 0);
}
