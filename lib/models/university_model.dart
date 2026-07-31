class UniversityModel {
  final String id;
  final String name;
  final String city;
  final String country;
  final String website;

  UniversityModel({
    required this.id,
    required this.name,
    required this.city,
    required this.country,
    required this.website,
  });

  factory UniversityModel.fromJson(Map<String, dynamic> json) {
    return UniversityModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      city: json['city'] ?? '',
      country: json['country'] ?? '',
      website: json['website'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'city': city,
      'country': country,
      'website': website,
    };
  }
}
