class AdminSetting {
  final double handlingCharges;
  final List<DeliveryChargeSlab> deliveryCharges;

  // ⭐ NEW: Promo Banner (Image / GIF URL)
  final String promoMedia;
  final String promoRedirectUrl;
  final Map<String, dynamic> masterCategoryPromoBanners; // 🔥 NEW Map for Category-specific Banners
  
  // ⭐ NEW: Checkout Ads Image (for order detail page)
  final String checkoutAdsImage;
  final List<String> checkoutAdsImages; // 🔥 New Array support

  AdminSetting({
    required this.handlingCharges,
    required this.deliveryCharges,
    required this.promoMedia,
    required this.promoRedirectUrl,
    required this.masterCategoryPromoBanners,
    required this.checkoutAdsImage,
    required this.checkoutAdsImages,
  });

  factory AdminSetting.fromJson(Map<String, dynamic> json) {
    return AdminSetting(
      handlingCharges: (json['handlingCharges'] ?? 0).toDouble(),
      deliveryCharges: (json['deliveryCharges'] as List? ?? [])
          .map((e) => DeliveryChargeSlab.fromJson(e))
          .toList(),

      // ⭐ SAFE PARSE
      promoMedia: json['promoMedia'] ?? "",
      promoRedirectUrl: json['promoRedirectUrl'] ?? "",
      masterCategoryPromoBanners: json['masterCategoryPromoBanners'] is Map 
          ? Map<String, dynamic>.from(json['masterCategoryPromoBanners']) 
          : {},
      checkoutAdsImage: json['checkoutAdsImage'] ?? "",
      checkoutAdsImages: (json['checkoutAdsImages'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}


class DeliveryChargeSlab {
  final double minAmount;
  final double maxAmount;
  final double charge;

  DeliveryChargeSlab({
    required this.minAmount,
    required this.maxAmount,
    required this.charge,
  });

  factory DeliveryChargeSlab.fromJson(Map<String, dynamic> json) {
    return DeliveryChargeSlab(
      minAmount: (json['minAmount'] ?? 0).toDouble(),
      maxAmount: (json['maxAmount'] ?? 0).toDouble(),
      charge: (json['charge'] ?? 0).toDouble(),
    );
  }

}
