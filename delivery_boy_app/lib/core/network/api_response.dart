// core/network/api_response.dart

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final dynamic error;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.error,
  });
}

class PaginationResponse {
  final int currentPage;
  final int totalPages;
  final int totalCount;
  final bool hasNextPage;
  final bool hasPrevPage;
  final int limit;

  PaginationResponse({
    required this.currentPage,
    required this.totalPages,
    required this.totalCount,
    required this.hasNextPage,
    required this.hasPrevPage,
    required this.limit,
  });

  factory PaginationResponse.fromJson(Map<String, dynamic> json) {
    return PaginationResponse(
      currentPage: json['currentPage'] ?? 0,
      totalPages: json['totalPages'] ?? 0,
      totalCount: json['totalCount'] ?? 0,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPrevPage: json['hasPrevPage'] ?? false,
      limit: json['limit'] ?? 0,
    );
  }
}
