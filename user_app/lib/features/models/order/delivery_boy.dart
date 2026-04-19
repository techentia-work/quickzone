import 'package:json_annotation/json_annotation.dart';

part 'delivery_boy.g.dart';

@JsonSerializable()
class DeliveryBoy {
  @JsonKey(name: '_id')
  final String id;
  final String name;
  final String phone;

  DeliveryBoy({
    required this.id,
    required this.name,
    required this.phone,
  });

  factory DeliveryBoy.fromJson(Map<String, dynamic> json) =>
      _$DeliveryBoyFromJson(json);

  Map<String, dynamic> toJson() => _$DeliveryBoyToJson(this);
}
