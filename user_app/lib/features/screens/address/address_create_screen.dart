// lib/features/screens/address/address_create_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../widgets/input/custom_text_field.dart';
import '../../providers/providers.dart';
import '../../../core/utils/delivery_area_utils.dart';

class CreateAddressScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? locationData;
  final String? addressId; // For editing

  const CreateAddressScreen({
    super.key,
    this.locationData,
    this.addressId,
  });

  @override
  ConsumerState<CreateAddressScreen> createState() => _CreateAddressScreenState();
}

class _CreateAddressScreenState extends ConsumerState<CreateAddressScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _alternatePhoneController;
  late TextEditingController _houseController;
  late TextEditingController _areaController;
  late TextEditingController _landmarkController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pincodeController;
  late TextEditingController _customLabelController;
  late TextEditingController _googleLocationController;

  String _selectedType = 'HOME';
  String _selectedLabel = 'Home';
  bool _isDefault = false;
  bool _isSaving = false;

  final List<Map<String, dynamic>> _addressTypes = [
    {'label': 'Home', 'type': 'HOME', 'icon': Icons.home_outlined},
    {'label': 'Work', 'type': 'WORK', 'icon': Icons.work_outline},
    {'label': 'Other', 'type': 'CUSTOM', 'icon': Icons.location_on_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _initializeControllers();

    // Pre-fill if location data provided
    if (widget.locationData != null) {
      final address = widget.locationData!['address'] as String?;
      if (address != null) {
        _parseAddress(address);
      }
      // Pre-fill google location if available
      final googleLoc = widget.locationData!['googleLocation'] as String?;
      if (googleLoc != null) {
        _googleLocationController.text = googleLoc;
      }
    }

    // Load existing address if editing
    if (widget.addressId != null) {
      _loadExistingAddress();
    }
  }

  void _initializeControllers() {
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _alternatePhoneController = TextEditingController();
    _houseController = TextEditingController();
    _areaController = TextEditingController();
    _landmarkController = TextEditingController();
    _cityController = TextEditingController();
    _stateController = TextEditingController();
    _pincodeController = TextEditingController();
    _customLabelController = TextEditingController();
    _googleLocationController = TextEditingController();
  }

  void _loadExistingAddress() {
    final addresses = ref.read(addressControllerProvider).value;
    if (addresses != null) {
      final address = addresses.firstWhere(
            (a) => a.id == widget.addressId,
        orElse: () => addresses.first,
      );

      _nameController.text = address.fullName;
      _phoneController.text = address.phone;
      _alternatePhoneController.text = address.alternatePhone ?? '';
      _houseController.text = address.addressLine1;
      _areaController.text = address.addressLine2 ?? '';
      _landmarkController.text = address.landmark ?? '';
      _cityController.text = address.city;
      _stateController.text = address.state;
      _pincodeController.text = address.pincode;
      _googleLocationController.text = address.googleLocation ?? '';
      _selectedType = address.type.name;
      _selectedLabel = address.label;
      _customLabelController.text = address.customLabel ?? '';
      _isDefault = address.isDefault;
    }
  }

  void _parseAddress(String address) {
    final parts = address.split(',').map((e) => e.trim()).toList();
    if (parts.isNotEmpty) _googleLocationController.text = parts[0];
    if (parts.length > 1) _cityController.text = parts[1];
    if (parts.length > 2) {
      final statePincode = parts[2].split(' ');
      if (statePincode.isNotEmpty) {
        _stateController.text = statePincode[0];
        if (statePincode.length > 1) {
          _pincodeController.text = statePincode.last;
        }
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _alternatePhoneController.dispose();
    _houseController.dispose();
    _areaController.dispose();
    _landmarkController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _customLabelController.dispose();
    _googleLocationController.dispose();
    super.dispose();
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final payload = {
      'label': _selectedType == 'CUSTOM' && _customLabelController.text.trim().isNotEmpty
          ? _customLabelController.text.trim()
          : _selectedLabel,
      'type': _selectedType,
      'customLabel': _selectedType == 'CUSTOM' && _customLabelController.text.trim().isNotEmpty
          ? _customLabelController.text.trim()
          : null,
      'fullName': _nameController.text.trim(),
      'phone': _phoneController.text.trim(),
      'alternatePhone': _alternatePhoneController.text.trim().isEmpty
          ? null
          : _alternatePhoneController.text.trim(),
      'addressLine1': _houseController.text.trim(),
      'addressLine2': _areaController.text.trim().isEmpty
          ? null
          : _areaController.text.trim(),
      'googleLocation': _googleLocationController.text.trim().isEmpty
          ? null
          : _googleLocationController.text.trim(),
      'landmark': _landmarkController.text.trim().isEmpty
          ? null
          : _landmarkController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'country': 'India',
      'isDefault': _isDefault,
    };

    try {
      final controller = ref.read(addressControllerProvider.notifier);
      final response = widget.addressId != null
          ? await controller.updateAddress(widget.addressId!, payload)
          : await controller.addAddress(payload);

      String message = response.message;

      if (response.success) {
        if (mounted) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                content: Text(
                  widget.addressId != null
                      ? 'Address updated successfully'
                      : 'Address added successfully',
                  style: const TextStyle(fontSize: 14),
                ),
                backgroundColor: const Color(0xFF5AC268),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 3),
              ),
            );
          context.go('/');
        }
      } else {
        // Combine message + detailed validation info (if any)
        if (response.error is List) {
          final details = (response.error as List)
              .map((e) => e['message'] ?? '')
              .where((msg) => msg.isNotEmpty)
              .join('\n');
          if (details.isNotEmpty) {
            message = '$message\n$details';
          }
        }

        if (mounted) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                content: Text(
                  message,
                  style: const TextStyle(fontSize: 14),
                ),
                backgroundColor: Colors.redAccent,
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 6),
              ),
            );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(
                'Something went wrong: $e',
                style: const TextStyle(fontSize: 14),
              ),
              backgroundColor: Colors.redAccent,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 6),
            ),
          );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCustomType = _selectedType == 'CUSTOM';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back, color: Color(0xFF212121)),
        ),
        title: Text(
          widget.addressId != null ? 'Edit Address' : 'Add New Address',
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF212121),
          ),
        ),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Address Type Selection
                    Text(
                      'Address Type',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF212121),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: _addressTypes.map((type) {
                        final isSelected = _selectedType == type['type'];
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedType = type['type'];
                                  _selectedLabel = type['label'];
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFF5AC268)
                                      : Colors.white,
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFF5AC268)
                                        : const Color(0xFFE0E0E0),
                                    width: isSelected ? 2 : 1,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      type['icon'],
                                      color: isSelected
                                          ? Colors.white
                                          : const Color(0xFF757575),
                                      size: 24,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      type['label'],
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? Colors.white
                                            : const Color(0xFF757575),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    // Custom Label Field (only visible when CUSTOM is selected)
                    if (isCustomType) ...[
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _customLabelController,
                        hintText: 'E.g. Friend\'s House, Office 2, etc.',
                        labelText: 'Custom Label',
                        prefixIcon: const Icon(Icons.label_outline),
                        validator: (value) {
                          if (isCustomType && (value == null || value.trim().isEmpty)) {
                            return 'Please enter a custom label';
                          }
                          if (value != null && value.length > 50) {
                            return 'Label is too long (max 50 characters)';
                          }
                          return null;
                        },
                      ),
                    ],
                    const SizedBox(height: 24),

                    // Contact Details Section
                    Text(
                      'Contact Details',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF212121),
                      ),
                    ),
                    const SizedBox(height: 12),

                    CustomTextField(
                      controller: _nameController,
                      hintText: 'Enter your full name',
                      labelText: 'Full Name',
                      prefixIcon: const Icon(Icons.person_outline),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    CustomTextField(
                      controller: _phoneController,
                      hintText: 'Enter your phone number',
                      labelText: 'Phone Number',
                      prefixIcon: const Icon(Icons.phone_outlined),
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter phone number';
                        }
                        if (value.length != 10) {
                          return 'Please enter valid 10-digit number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    CustomTextField(
                      controller: _alternatePhoneController,
                      hintText: 'Enter alternate phone (optional)',
                      labelText: 'Alternate Phone',
                      prefixIcon: const Icon(Icons.phone_outlined),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 24),

                    // Address Details Section
                    Text(
                      'Address Details',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF212121),
                      ),
                    ),
                    const SizedBox(height: 12),

                    CustomTextField(
                      controller: _houseController,
                      hintText: 'House No., Building Name',
                      labelText: 'House / Flat / Building',
                      prefixIcon: const Icon(Icons.home_outlined),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter house/flat details';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    CustomTextField(
                      controller: _areaController,
                      hintText: 'Road name, Area, Colony',
                      labelText: 'Area / Sector / Locality',
                      prefixIcon: const Icon(Icons.map_outlined),
                    ),
                    const SizedBox(height: 16),

                    CustomTextField(
                      controller: _landmarkController,
                      hintText: 'E.g. near apollo hospital',
                      labelText: 'Landmark (Optional)',
                      prefixIcon: const Icon(Icons.location_on_outlined),
                    ),
                    const SizedBox(height: 16),

                    // Google Location Field (optional for all types)
                    CustomTextField(
                      controller: _googleLocationController,
                      hintText: 'Google Maps location or coordinates',
                      labelText: 'Google Location (Optional)',
                      prefixIcon: const Icon(Icons.map),
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: CustomTextField(
                            controller: _cityController,
                            hintText: 'City',
                            labelText: 'City',
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Required';
                              }
                              if (!DeliveryAreaUtils.isInDeliveryArea(value)) {
                                return DeliveryAreaUtils.getFormValidationMessage();
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomTextField(
                            controller: _pincodeController,
                            hintText: 'Pincode',
                            labelText: 'Pincode',
                            keyboardType: TextInputType.number,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Required';
                              }
                              if (value.length != 6) {
                                return 'Invalid';
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    CustomTextField(
                      controller: _stateController,
                      hintText: 'State',
                      labelText: 'State',
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter state';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),

                    // Set as Default
                    InkWell(
                      onTap: () {
                        setState(() => _isDefault = !_isDefault);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F5F5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isDefault
                                  ? Icons.check_box
                                  : Icons.check_box_outline_blank,
                              color: _isDefault
                                  ? const Color(0xFF5AC268)
                                  : const Color(0xFF9E9E9E),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Set as default address',
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF212121),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'This will be your primary delivery address',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: const Color(0xFF757575),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Save Button
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: SafeArea(
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _saveAddress,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5AC268),
                      disabledBackgroundColor: const Color(0xFFE0E0E0),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Colors.white,
                        ),
                      ),
                    )
                        : Text(
                      'Save Address',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}