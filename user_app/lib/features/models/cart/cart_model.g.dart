// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartItemType _$CartItemTypeFromJson(Map<String, dynamic> json) => CartItemType(
  productId: CartProductRef.fromJson(json['productId'] as Map<String, dynamic>),
  variantId: json['variantId'] as String,
  title: json['title'] as String?,
  price: (json['price'] as num).toDouble(),
  quantity: (json['quantity'] as num).toInt(),
  discountPercent: (json['discountPercent'] as num?)?.toDouble(),
  discountedPrice: (json['discountedPrice'] as num?)?.toDouble(),
  taxRate: $enumDecode(_$TaxRateTypeEnumMap, json['taxRate']),
  totalPrice: (json['totalPrice'] as num?)?.toDouble(),
  product: json['product'] == null
      ? null
      : CartProduct.fromJson(json['product'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CartItemTypeToJson(CartItemType instance) =>
    <String, dynamic>{
      'productId': instance.productId.toJson(),
      'variantId': instance.variantId,
      'title': instance.title,
      'price': instance.price,
      'quantity': instance.quantity,
      'discountPercent': instance.discountPercent,
      'discountedPrice': instance.discountedPrice,
      'taxRate': _$TaxRateTypeEnumMap[instance.taxRate]!,
      'totalPrice': instance.totalPrice,
      'product': instance.product?.toJson(),
    };

const _$TaxRateTypeEnumMap = {
  TaxRateType.GST_5: 'gst_5',
  TaxRateType.GST_12: 'gst_12',
  TaxRateType.GST_18: 'gst_18',
  TaxRateType.GST_28: 'gst_28',
  TaxRateType.GST_40: 'gst_40',
};

CartProductRef _$CartProductRefFromJson(Map<String, dynamic> json) =>
    CartProductRef(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      categoryId: json['categoryId'] as String,
      mainImage: json['mainImage'] as String,
    );

Map<String, dynamic> _$CartProductRefToJson(CartProductRef instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'categoryId': instance.categoryId,
      'mainImage': instance.mainImage,
    };

CartProduct _$CartProductFromJson(Map<String, dynamic> json) => CartProduct(
  id: json['_id'] as String,
  name: json['name'] as String,
  thumbnail: json['thumbnail'] as String?,
  price: (json['price'] as num).toDouble(),
);

Map<String, dynamic> _$CartProductToJson(CartProduct instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'thumbnail': instance.thumbnail,
      'price': instance.price,
    };

CartType _$CartTypeFromJson(Map<String, dynamic> json) => CartType(
  id: json['_id'] as String?,
  userId: json['userId'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => CartItemType.fromJson(e as Map<String, dynamic>))
      .toList(),
  subTotal: (json['subTotal'] as num).toDouble(),
  totalTax: (json['totalTax'] as num).toDouble(),
  totalAmount: (json['totalAmount'] as num).toDouble(),
  appliedPromo: json['appliedPromo'] == null
      ? null
      : Promo.fromJson(json['appliedPromo'] as Map<String, dynamic>),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$CartTypeToJson(CartType instance) => <String, dynamic>{
  '_id': instance.id,
  'userId': instance.userId,
  'items': instance.items.map((e) => e.toJson()).toList(),
  'subTotal': instance.subTotal,
  'totalTax': instance.totalTax,
  'totalAmount': instance.totalAmount,
  'appliedPromo': instance.appliedPromo?.toJson(),
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
};

Promo _$PromoFromJson(Map<String, dynamic> json) => Promo(
  code: json['code'] as String?,
  discountAmount: (json['discountAmount'] as num?)?.toDouble(),
);

Map<String, dynamic> _$PromoToJson(Promo instance) => <String, dynamic>{
  'code': instance.code,
  'discountAmount': instance.discountAmount,
};
