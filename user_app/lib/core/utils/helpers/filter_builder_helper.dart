// core/utils/filters/product_filter_builder.dart
import '../enums/filter_enum.dart';

class ProductFilterBuilder {
  final Map<String, dynamic> _params = {};

  /// Set or update a simple key=value filter
  void set(String key, dynamic value) {
    if (value == null || value == '' || value == 'all') {
      _params.remove(key);
    } else {
      _params[key] = value;
    }
  }

  /// Add a filter with operator: e.g., variants.price[gte]=100
  void addOperator(String field, FilterOperator op, dynamic value) {
    if (value == null) return;
    final opKey = op.key;
    if (opKey.isEmpty) {
      _params[field] = value;
    } else {
      _params['$field[$opKey]'] = value;
    }
  }

  /// Add an array (e.g., tags=tag1,tag2)
  void setList(String field, List<dynamic> values) {
    if (values.isEmpty) {
      _params.remove(field);
    } else {
      _params[field] = values.join(',');
    }
  }

  /// Add search term
  void setSearch(String term) {
    if (term.isEmpty) {
      _params.remove('search');
    } else {
      _params['search'] = term;
    }
  }

  /// Add pagination
  void setPagination({int? page, int? limit}) {
    if (page != null) _params['page'] = page;
    if (limit != null) _params['limit'] = limit;
  }

  /// Add sorting
  void setSort({required String sortBy, bool ascending = false}) {
    _params['sortBy'] = sortBy;
    _params['sortOrder'] = ascending ? 'asc' : 'desc';
  }

  /// Add stock availability flag
  void setInStock(bool inStock) {
    _params['inStock'] = inStock.toString();
  }

  /// Add date range or custom range
  void setDateRange({String? dateRange, DateTime? from, DateTime? to}) {
    if (dateRange != null) {
      _params['dateRange'] = dateRange;
    } else {
      if (from != null) _params['dateFrom'] = from.toIso8601String();
      if (to != null) _params['dateTo'] = to.toIso8601String();
    }
  }

  /// Clear all filters
  void clear() => _params.clear();

  /// Merge multiple filter maps
  void merge(Map<String, dynamic> other) => _params.addAll(other);

  /// Get query map for API calls
  Map<String, dynamic> toQuery() => Map<String, dynamic>.from(_params);

  /// Get URL-encoded query string
  String toQueryString() {
    return _params.entries
        .map((e) => '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent(e.value.toString())}')
        .join('&');
  }

  @override
  String toString() => _params.toString();
}
