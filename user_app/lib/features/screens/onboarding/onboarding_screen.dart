import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:Quickzon/core/utils/responsive/responsive.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  final box = GetStorage();

  final List<Map<String, String>> onboardingData = [
    {
      "title": "Buy Groceries Easily with Us",
      "subtitle": "Shop for your daily essentials quickly and conveniently.",
      "image": "assets/images/onboarding1.png",
    },
    {
      "title": "We Deliver Grocery at Your Doorstep",
      "subtitle": "Get your products delivered quickly",
      "image": "assets/images/onboarding2.png",
    },
    {
      "title": "All Your Kitchen Needs are Here",
      "subtitle": "Pay securely with multiple payment options",
      "image": "assets/images/onboarding1.png",
    },
  ];

  Future<void> _handleGetStarted() async {
    await box.write('hasVisited', true);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final r = Responsive(context);

    final double buttonRadius = r.wp(r.isTablet ? 11 : 10);
    final double buttonLift = r.hp(r.isTablet ? 3 : 2.5);

    return Scaffold(
      backgroundColor: const Color(0xFFEEF9F0),
      body: SafeArea(
        top: true,
        bottom: false, // we'll manually handle bottom safe area
        child: Column(
          children: [
            // --- Skip button ---
            Padding(
              padding: EdgeInsets.only(top: r.hp(1.5), right: r.wp(4)),
              child: Align(
                alignment: Alignment.topRight,
                child: GestureDetector(
                  onTap: _handleGetStarted,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Skip',
                        style: TextStyle(
                          color: const Color(0xFF5AC268),
                          fontSize: r.sp(16),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(width: r.wp(2)),
                      Container(
                        padding: EdgeInsets.all(r.wp(2.2)),
                        decoration: const BoxDecoration(
                          color: Color(0xFF5AC268),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.arrow_forward,
                          color: Colors.white,
                          size: r.wp(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // --- PageView ---
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: onboardingData.length,
                onPageChanged: (index) => setState(() => _currentPage = index),
                itemBuilder: (context, index) {
                  final data = onboardingData[index];

                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // --- Image section ---
                      Positioned(
                        top: 0,
                        left: 0,
                        right: 0,
                        child: SizedBox(
                          height: r.hp(r.isTablet ? 45 : 50),
                          child: Image.asset(
                            data["image"]!,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),

                      // --- Curved white card ---
                      Positioned(
                        bottom: r.hp(8),
                        left: r.wp(4),
                        right: r.wp(4),
                        child: ClipPath(
                          clipper: BottomClipper(
                            buttonRadius: buttonRadius,
                            lift: buttonLift,
                          ),
                          child: Container(
                            decoration: BoxDecoration(color: Colors.white),
                            height: r.hp(35),
                            padding: EdgeInsets.only(
                              left: r.wp(6),
                              right: r.wp(6),
                              top: r.hp(12),
                              bottom: r.hp(5),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  data["title"]!,
                                  style: Theme.of(
                                    context,
                                  ).textTheme.headlineSmall,
                                  textAlign: TextAlign.center,
                                ),
                                SizedBox(height: r.hp(1.5)),
                                Text(
                                  data["subtitle"]!,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // --- Page indicators ---
                      Positioned(
                        bottom: r.hp(36),
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            onboardingData.length,
                            (i) => AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: EdgeInsets.symmetric(horizontal: r.wp(1)),
                              height: r.hp(0.8),
                              width: _currentPage == i ? r.wp(6) : r.wp(2),
                              decoration: BoxDecoration(
                                color: _currentPage == i
                                    ? const Color(0xFF5AC268)
                                    : Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // --- Floating bottom button (half inside/outside white container) ---
                      Positioned(
                        bottom:
                            r.hp(8) -
                            (buttonRadius), // Align with white card top
                        left: 0,
                        right: 0,
                        child: Center(
                          child: Container(
                            width: buttonRadius * 2,
                            height: buttonRadius * 2,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: GestureDetector(
                                onTap: () {
                                  if (_currentPage ==
                                      onboardingData.length - 1) {
                                    _handleGetStarted();
                                  } else {
                                    _pageController.nextPage(
                                      duration: const Duration(
                                        milliseconds: 500,
                                      ),
                                      curve: Curves.ease,
                                    );
                                  }
                                },
                                child: Container(
                                  width: buttonRadius * 1.3,
                                  height: buttonRadius * 1.3,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF5AC268),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.arrow_forward,
                                    color: Colors.white,
                                    size: r.wp(6),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}

// --- BottomClipper stays unchanged ---
class BottomClipper extends CustomClipper<Path> {
  final double buttonRadius;
  final double lift;

  BottomClipper({required this.buttonRadius, required this.lift});

  @override
  Path getClip(Size size) {
    const double cornerRadius = 20.0;
    const double slantHeight = 30.0;

    Path path = Path();

    path.moveTo(0, cornerRadius);
    path.quadraticBezierTo(0, 0, cornerRadius, 0);

    path.lineTo(size.width - cornerRadius, slantHeight);
    path.quadraticBezierTo(
      size.width,
      slantHeight,
      size.width,
      slantHeight + cornerRadius,
    );

    path.lineTo(size.width, size.height - cornerRadius);
    path.quadraticBezierTo(
      size.width,
      size.height,
      size.width - cornerRadius,
      size.height,
    );

    final double notchCenterX = size.width / 2;
    final double notchDepth = buttonRadius * 0.8;

    path.lineTo(notchCenterX + buttonRadius, size.height);
    path.quadraticBezierTo(
      notchCenterX,
      size.height - notchDepth + lift * 0.4,
      notchCenterX - buttonRadius,
      size.height,
    );

    path.lineTo(cornerRadius, size.height);
    path.quadraticBezierTo(0, size.height, 0, size.height - cornerRadius);

    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
