import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quickzone_delivery/core/network/api_client.dart';
import 'package:quickzone_delivery/core/network/api_response.dart';

/// 🔌 Provider for ImageUploadRepository
final imageUploadRepositoryProvider = Provider<ImageUploadRepository>((ref) {
  final client = ref.read(apiClientProvider);
  return ImageUploadRepository(client);
});

/// 📸 Response model for image upload
class ImageUploadResponse {
  final String imageUrl;
  final String? publicId;

  ImageUploadResponse({
    required this.imageUrl,
    this.publicId,
  });

  factory ImageUploadResponse.fromJson(Map<String, dynamic> json) {
    return ImageUploadResponse(
      imageUrl: json['imageUrl'] as String,
      publicId: json['publicId'] as String?,
    );
  }
}


/// 🖼️ Repository for image upload operations
class ImageUploadRepository {
  final ApiClient _client;

  ImageUploadRepository(this._client);

  /// Upload a delivery proof image
  Future<ApiResponse<ImageUploadResponse>> uploadProofImage(File imageFile) async {
    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        ),
      });

      return await _client.post<ImageUploadResponse>(
        '/images/upload-single-image',
        data: formData,
        fromJson: (json) => ImageUploadResponse.fromJson(json),
      );
    } catch (e) {
      rethrow;
    }
  }
}
