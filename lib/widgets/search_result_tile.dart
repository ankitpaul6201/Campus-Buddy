import 'package:flutter/material.dart';
import '../models/university_model.dart';
import '../theme/app_theme.dart';

class SearchResultTile extends StatelessWidget {
  final UniversityModel university;
  final bool isSelected;
  final ValueChanged<UniversityModel> onSelect;

  const SearchResultTile({
    Key? key,
    required this.university,
    required this.isSelected,
    required this.onSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
        border: isSelected
            ? const Border(left: BorderSide(color: AppTheme.primaryBlue, width: 4))
            : Border(bottom: BorderSide(color: Colors.grey.shade200, width: 0.5)),
      ),
      child: ListTile(
        onTap: () => onSelect(university),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(
            Icons.school_rounded,
            color: AppTheme.primaryBlue,
            size: 20,
          ),
        ),
        title: Text(
          university.name,
          style: const TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2.0),
          child: Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 12, color: Colors.grey),
              const SizedBox(width: 2),
              Text(
                '${university.city}, ${university.country}',
                style: const TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        trailing: isSelected
            ? const Icon(Icons.check_circle_rounded, color: AppTheme.primaryBlue, size: 20)
            : null,
      ),
    );
  }
}
