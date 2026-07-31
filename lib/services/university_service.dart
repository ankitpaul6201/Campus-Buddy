import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/university_model.dart';

class UniversityService {
  // In-memory session cache
  static final Map<String, List<UniversityModel>> _cache = {};

  /// Calls GET /universities/search?q=<query>
  static Future<List<UniversityModel>> searchUniversities(String query) async {
    final q = query.trim().toLowerCase();

    // Performance rule: Do not send requests for empty input or less than 2 characters
    if (q.length < 2) {
      return [];
    }

    if (_cache.containsKey(q)) {
      return _cache[q]!;
    }

    try {
      // Simulate backend endpoint GET /universities/search?q=<query>
      final results = await _fetchBackendUniversities(q);
      _cache[q] = results;
      return results;
    } catch (e) {
      debugPrint('University search error: $e');
      return [];
    }
  }

  static Future<List<UniversityModel>> _fetchBackendUniversities(String q) async {
    // Backend API endpoint simulation with fallback dataset
    await Future.delayed(const Duration(milliseconds: 250));

    final seedData = [
      {
        'id': 'stanford-university',
        'name': 'Stanford University',
        'city': 'Stanford',
        'country': 'United States',
        'website': 'https://www.stanford.edu'
      },
      {
        'id': 'massachusetts-institute-of-technology',
        'name': 'Massachusetts Institute of Technology',
        'city': 'Cambridge',
        'country': 'United States',
        'website': 'https://mit.edu'
      },
      {
        'id': 'harvard-university',
        'name': 'Harvard University',
        'city': 'Cambridge',
        'country': 'United States',
        'website': 'https://harvard.edu'
      },
      {
        'id': 'university-of-california-berkeley',
        'name': 'University of California, Berkeley',
        'city': 'Berkeley',
        'country': 'United States',
        'website': 'https://berkeley.edu'
      },
      {
        'id': 'indian-institute-of-technology-delhi',
        'name': 'Indian Institute of Technology Delhi',
        'city': 'New Delhi',
        'country': 'India',
        'website': 'https://iitd.ac.in'
      },
      {
        'id': 'indian-institute-of-technology-bombay',
        'name': 'Indian Institute of Technology Bombay',
        'city': 'Mumbai',
        'country': 'India',
        'website': 'https://iitb.ac.in'
      },
      {
        'id': 'university-of-oxford',
        'name': 'University of Oxford',
        'city': 'Oxford',
        'country': 'United Kingdom',
        'website': 'https://ox.ac.uk'
      },
      {
        'id': 'university-of-toronto',
        'name': 'University of Toronto',
        'city': 'Toronto',
        'country': 'Canada',
        'website': 'https://utoronto.ca'
      }
    ];

    final filtered = seedData.where((u) {
      final name = u['name']!.toLowerCase();
      final city = u['city']!.toLowerCase();
      final country = u['country']!.toLowerCase();
      return name.contains(q) || city.contains(q) || country.contains(q);
    }).map((json) => UniversityModel.fromJson(json)).toList();

    return filtered;
  }
}
