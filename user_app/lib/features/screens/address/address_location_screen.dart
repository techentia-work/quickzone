// lib/features/screens/address/address_location_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import '../../../core/utils/delivery_area_utils.dart';

class LocationSelectionScreen extends ConsumerStatefulWidget {
  const LocationSelectionScreen({super.key});

  @override
  ConsumerState<LocationSelectionScreen> createState() =>
      _LocationSelectionScreenState();
}

class _LocationSelectionScreenState
    extends ConsumerState<LocationSelectionScreen> {
  final MapController _mapController = MapController();
  LatLng _currentPosition = const LatLng(28.6139, 77.2090); // Default: Delhi
  bool _isLoading = true;
  bool _isFetchingAddress = false;
  String _selectedAddress = '';
  String _selectedCity = '';
  bool _isInDeliveryArea = true;
  final TextEditingController _searchController = TextEditingController();

  List<Map<String, dynamic>> _searchResults = [];
  bool _showSearchResults = false;
  Timer? _debounce;
  Timer? _mapIdleTimer;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    _mapIdleTimer?.cancel();
    super.dispose();
  }

  // ── GPS: get device location ────────────────────────────────────────────
  Future<void> _getCurrentLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Location permission permanently denied. Please enable it in settings.',
              ),
            ),
          );
        }
        setState(() => _isLoading = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final loc = LatLng(position.latitude, position.longitude);
      setState(() {
        _currentPosition = loc;
        _isLoading = false;
      });

      _mapController.move(loc, 16);
      await _reverseGeocode(loc);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to get location: $e')),
        );
      }
    }
  }

  // ── Nominatim reverse geocoding (free) ──────────────────────────────────
  Future<void> _reverseGeocode(LatLng position) async {
    setState(() => _isFetchingAddress = true);
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse'
        '?format=jsonv2'
        '&lat=${position.latitude}'
        '&lon=${position.longitude}'
        '&addressdetails=1',
      );
      final res = await http.get(uri, headers: {'Accept-Language': 'en'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final addr = data['address'] as Map<String, dynamic>? ?? {};
        final city = addr['city'] ??
            addr['town'] ??
            addr['village'] ??
            addr['county'] ??
            addr['state_district'] ??
            '';
        final fullAddress = data['display_name'] as String? ?? '';

        if (mounted) {
          setState(() {
            _selectedAddress = fullAddress;
            _selectedCity = city.toString();
            _isInDeliveryArea =
                DeliveryAreaUtils.isInDeliveryArea(city.toString());
          });
        }
      }
    } catch (e) {
      debugPrint('Reverse geocode error: $e');
    } finally {
      if (mounted) setState(() => _isFetchingAddress = false);
    }
  }

  // ── Nominatim forward search (free) ──────────────────────────────────────
  Future<void> _searchPlaces(String query) async {
    if (query.isEmpty) {
      setState(() {
        _showSearchResults = false;
        _searchResults = [];
      });
      return;
    }
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/search'
        '?format=jsonv2'
        '&q=${Uri.encodeComponent(query)}'
        '&countrycodes=in'
        '&limit=5'
        '&addressdetails=1',
      );
      final res = await http.get(uri, headers: {'Accept-Language': 'en'});
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List<dynamic>;
        final results = data.map((item) {
          final addr = item['address'] as Map<String, dynamic>? ?? {};
          final city = addr['city'] ??
              addr['town'] ??
              addr['village'] ??
              addr['county'] ??
              '';
          return {
            'name': item['display_name'] as String,
            'address': '$city, ${addr['state'] ?? ''}',
            'lat': double.parse(item['lat'].toString()),
            'lng': double.parse(item['lon'].toString()),
            'fullAddress': item['display_name'] as String,
            'city': city.toString(),
          };
        }).toList();

        if (mounted) {
          setState(() {
            _searchResults = results;
            _showSearchResults = results.isNotEmpty;
          });
        }
      }
    } catch (e) {
      debugPrint('Search error: $e');
      if (mounted) {
        setState(() {
          _searchResults = [];
          _showSearchResults = false;
        });
      }
    }
  }

  void _onSearchChanged(String value) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _searchPlaces(value);
    });
  }

  void _selectSearchResult(Map<String, dynamic> result) {
    final position = LatLng(result['lat'], result['lng']);
    final city = result['city'] as String? ?? '';

    setState(() {
      _currentPosition = position;
      _selectedAddress = result['fullAddress'] as String;
      _selectedCity = city;
      _isInDeliveryArea = DeliveryAreaUtils.isInDeliveryArea(city);
      _showSearchResults = false;
      _searchController.text = result['name'] as String;
    });

    _mapController.move(position, 16);
  }

  // Called when map stops moving (drag end)
  void _onMapEvent(MapEvent event) {
    if (event is MapEventMoveEnd) {
      final center = event.camera.center;
      setState(() => _currentPosition = center);
      // Debounce reverse geocode so it doesn't fire while still dragging
      _mapIdleTimer?.cancel();
      _mapIdleTimer = Timer(const Duration(milliseconds: 400), () {
        _reverseGeocode(center);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // ── Flutter Map (OpenStreetMap) ──────────────────────────────
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentPosition,
              initialZoom: 15,
              onMapEvent: _onMapEvent,
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.techentia.quickzon',
              ),
            ],
          ),

          // ── Center fixed pin ─────────────────────────────────────────
          Center(
            child: Icon(
              Icons.location_pin,
              size: 50,
              color: const Color(0xFF5AC268),
              shadows: [
                Shadow(
                  blurRadius: 4,
                  color: Colors.black.withOpacity(0.3),
                  offset: const Offset(0, 2),
                ),
              ],
            ),
          ),

          // ── Top search bar ───────────────────────────────────────────
          SafeArea(
            child: Column(
              children: [
                Container(
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header row
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            IconButton(
                              onPressed: () => context.pop(),
                              icon: const Icon(Icons.arrow_back),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Confirm Delivery Location',
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Search bar
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          onTap: () {
                            if (_searchResults.isNotEmpty) {
                              setState(() => _showSearchResults = true);
                            }
                          },
                          decoration: InputDecoration(
                            hintText: 'Search for area, street name...',
                            hintStyle: GoogleFonts.inter(
                              color: const Color(0xFF9E9E9E),
                              fontSize: 14,
                            ),
                            prefixIcon: const Icon(
                              Icons.search,
                              color: Color(0xFF9E9E9E),
                            ),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 20),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() {
                                        _showSearchResults = false;
                                        _searchResults = [];
                                      });
                                    },
                                  )
                                : null,
                            filled: true,
                            fillColor: const Color(0xFFF5F5F5),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Search results dropdown
                if (_showSearchResults && _searchResults.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    constraints: const BoxConstraints(maxHeight: 300),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _searchResults.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final result = _searchResults[index];
                        return ListTile(
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF5AC268).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.location_on,
                              color: Color(0xFF5AC268),
                              size: 20,
                            ),
                          ),
                          title: Text(
                            result['name'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF212121),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            result['address'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: const Color(0xFF757575),
                            ),
                          ),
                          onTap: () => _selectSearchResult(result),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // ── GPS button ───────────────────────────────────────────────
          Positioned(
            right: 16,
            bottom: 260,
            child: FloatingActionButton(
              onPressed: _getCurrentLocation,
              backgroundColor: Colors.white,
              elevation: 4,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Color(0xFF5AC268),
                      ),
                    )
                  : const Icon(
                      Icons.my_location,
                      color: Color(0xFF5AC268),
                    ),
            ),
          ),

          // ── Bottom sheet with address + confirm button ────────────────
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Select Location',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Address preview
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF5AC268).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.location_on,
                              color: Color(0xFF5AC268),
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _isFetchingAddress
                                ? Row(
                                    children: [
                                      const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 1.5,
                                          color: Color(0xFF5AC268),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Fetching address...',
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          color: const Color(0xFF757575),
                                        ),
                                      ),
                                    ],
                                  )
                                : Text(
                                    _selectedAddress.isEmpty
                                        ? 'Move the map or tap GPS button'
                                        : _selectedAddress,
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      color: const Color(0xFF212121),
                                    ),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                          ),
                        ],
                      ),

                      // Out-of-area warning
                      if (!_isInDeliveryArea &&
                          _selectedAddress.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3E0),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFFFF9800),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.warning_amber_rounded,
                                color: Color(0xFFFF9800),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  DeliveryAreaUtils.getOutOfAreaMessage(),
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: const Color(0xFFE65100),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 20),

                      // Confirm button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: (_selectedAddress.isEmpty ||
                                  !_isInDeliveryArea ||
                                  _isFetchingAddress)
                              ? null
                              : () {
                                  context.push(
                                    '/address/create',
                                    extra: {
                                      'latitude':
                                          _currentPosition.latitude,
                                      'longitude':
                                          _currentPosition.longitude,
                                      'address': _selectedAddress,
                                      'googleLocation':
                                          '${_currentPosition.latitude},${_currentPosition.longitude}',
                                    },
                                  );
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF5AC268),
                            disabledBackgroundColor: const Color(0xFFE0E0E0),
                            padding:
                                const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                          ),
                          child: Text(
                            !_isInDeliveryArea && _selectedAddress.isNotEmpty
                                ? DeliveryAreaUtils.getButtonDisabledMessage()
                                : 'Confirm Address',
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}