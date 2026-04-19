class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type; // ORDER_CONFIRMED, ORDER_DELIVERED etc
  final String? orderId;
  final bool read;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.orderId,
    this.read = false,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id']?.toString() ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'] ?? 'GENERAL',
      orderId: json['orderId']?.toString(),
      read: json['read'] ?? false,
    );
  }

  AppNotification copyWith({bool? read}) {
    return AppNotification(
      id: id,
      title: title,
      body: body,
      type: type,
      orderId: orderId,
      read: read ?? this.read,
      createdAt: createdAt,
    );
  }
}
