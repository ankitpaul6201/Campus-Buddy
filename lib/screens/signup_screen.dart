import 'package:flutter/material.dart';
import '../models/university_model.dart';
import '../theme/app_theme.dart';
import '../widgets/university_search_field.dart';
import 'login_screen.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  UniversityModel? _selectedUniversity;
  bool _isLoading = false;

  bool get _isFormValid {
    return _nameController.text.trim().isNotEmpty &&
        _emailController.text.trim().isNotEmpty &&
        _passwordController.text.trim().isNotEmpty &&
        _selectedUniversity != null;
  }

  void _handleSignup() {
    if (!_isFormValid) return;

    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (mounted) {
        setState(() => _isLoading = false);
        
        // Payload with strictly universityId as source of truth
        final payload = {
          'fullName': _nameController.text.trim(),
          'email': _emailController.text.trim(),
          'universityId': _selectedUniversity!.id,
        };

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Registered! Mapped to universityId: "${payload['universityId']}"')),
        );

        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryBlue,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top Section - Title & Subtitle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 24),
                        onPressed: () => Navigator.of(context).pop(),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        },
                        child: const Text(
                          'Sign In',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Welcome to Campus Buddy',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Join your university marketplace.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),

            // Bottom White Card - Form
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28.0),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(36),
                    topRight: Radius.circular(36),
                  ),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Full Name
                      _buildLabel('FULL NAME *'),
                      TextField(
                        controller: _nameController,
                        onChanged: (_) => setState(() {}),
                        style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                        decoration: _inputDecoration('Alex Rivera'),
                      ),
                      const SizedBox(height: 14),

                      // Email
                      _buildLabel('EMAIL *'),
                      TextField(
                        controller: _emailController,
                        onChanged: (_) => setState(() {}),
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                        decoration: _inputDecoration('student@university.edu'),
                      ),
                      const SizedBox(height: 14),

                      // Password
                      _buildLabel('PASSWORD *'),
                      TextField(
                        controller: _passwordController,
                        onChanged: (_) => setState(() {}),
                        obscureText: true,
                        style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
                        decoration: _inputDecoration('••••••••'),
                      ),
                      const SizedBox(height: 14),

                      // University Search Field Component
                      UniversitySearchField(
                        selectedUniversity: _selectedUniversity,
                        onSelectUniversity: (univ) {
                          setState(() {
                            _selectedUniversity = univ;
                          });
                        },
                      ),
                      const SizedBox(height: 24),

                      // Sign Up Button (Disabled until form is valid)
                      SizedBox(
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isFormValid && !_isLoading ? _handleSignup : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.darkButton,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: Colors.grey.shade300,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Text('Sign Up', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        text,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.grey),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey),
      filled: true,
      fillColor: const Color(0xFFF3F4F6),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
    );
  }
}
