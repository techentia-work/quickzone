// lib/core/utils/delivery_area_utils.dart
/// Utility class for validating delivery area restrictions
class DeliveryAreaUtils {
  // Store location
  static const String storeCity = 'Agra';
  static const String storeLocation = 'Shop No F, Parsvnath Panchvati, Taj Nagari, Kaveri Vihar Phase II, Shamsabad, Agra, Uttar Pradesh 282004';
  
  // Allowed cities for delivery (currently only Agra)
  static const List<String> allowedCities = ['agra'];

  /// Check if the given city is within delivery area
  static bool isInDeliveryArea(String? city) {
    if (city == null || city.trim().isEmpty) return false;
    
    final normalizedCity = city.trim().toLowerCase();
    return allowedCities.contains(normalizedCity);
  }

  /// Extract city from formatted address string
  /// Expected format: "Street, City, State Pincode"
  static String? extractCityFromAddress(String? address) {
    if (address == null || address.isEmpty) return null;
    
    final parts = address.split(',').map((e) => e.trim()).toList();
    
    // Try to find "Agra" in any part of the address
    for (var part in parts) {
      if (part.toLowerCase().contains('agra')) {
        return 'Agra';
      }
    }
    
    // If not found, try to get the second part (usually city)
    if (parts.length > 1) {
      return parts[1];
    }
    
    return null;
  }

  /// Get user-friendly error message for out-of-area delivery
  static String getOutOfAreaMessage() {
    return 'Sorry, we don\'t deliver to this area yet. Please select a location in Agra.';
  }

  /// Get form validation error message
  static String getFormValidationMessage() {
    return 'We currently deliver only in Agra';
  }

  /// Get button disabled message
  static String getButtonDisabledMessage() {
    return 'Service not available in this area';
  }
}
