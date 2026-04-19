import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

import '../category/category_basic_model.dart';
import 'featured_product_mapping.dart';

part 'featured_product_section.g.dart';

@JsonSerializable(explicitToJson: true)
class FeaturedProductSection {
  @JsonKey(name: '_id')
  final String id;

  final String title;
  final String? imageUrl;

  /// 🔥 HEX COLOR STRING FROM BACKEND
  final String? color;

  final String position;
  final int order;

  /// 🔥 MASTER CATEGORY (IMPORTANT)
  final CategoryBasic? masterCategory;

  @JsonKey(defaultValue: [])
  final List<FeaturedProductMapping> mappings;

  FeaturedProductSection({
    required this.id,
    required this.title,
    this.imageUrl,
    this.color,
    required this.position,
    required this.order,
    this.masterCategory,
    this.mappings = const [],
  });

  /// =======================================================
  /// HEX STRING → COLOR
  /// =======================================================
  Color? get bgColor {
    if (color == null || color!.isEmpty) return null;

    final hex = color!.replaceAll('#', '');

    if (hex.length == 6) {
      return Color(int.parse('FF$hex', radix: 16));
    }

    if (hex.length == 8) {
      return Color(int.parse(hex, radix: 16));
    }

    return null;
  }

  factory FeaturedProductSection.fromJson(Map<String, dynamic> json) =>
      _$FeaturedProductSectionFromJson(json);

  Map<String, dynamic> toJson() =>
      _$FeaturedProductSectionToJson(this);
}
