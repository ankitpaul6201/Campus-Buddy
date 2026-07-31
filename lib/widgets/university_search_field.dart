import 'package:flutter/material.dart';
import '../models/university_model.dart';
import '../services/university_service.dart';
import '../utils/debounce.dart';

class UniversitySearchField extends StatefulWidget {
  final UniversityModel? selectedUniversity;
  final ValueChanged<UniversityModel?> onSelectUniversity;

  const UniversitySearchField({
    Key? key,
    required this.selectedUniversity,
    required this.onSelectUniversity,
  }) : super(key: key);

  @override
  State<UniversitySearchField> createState() => _UniversitySearchFieldState();
}

class _UniversitySearchFieldState extends State<UniversitySearchField> {
  final TextEditingController _controller = TextEditingController();
  final Debouncer _debouncer = Debouncer(delay: const Duration(milliseconds: 300));
  
  List<UniversityModel> _results = [];
  bool _isSearching = false;
  bool _isOpen = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    if (widget.selectedUniversity != null) {
      _controller.text = widget.selectedUniversity!.name;
    }
  }

  @override
  void didUpdateWidget(covariant UniversitySearchField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selectedUniversity != oldWidget.selectedUniversity) {
      if (widget.selectedUniversity != null) {
        _controller.text = widget.selectedUniversity!.name;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _debouncer.cancel();
    super.dispose();
  }

  void _onQueryChanged(String query) {
    widget.onSelectUniversity(null);

    if (query.trim().length < 2) {
      setState(() {
        _results = [];
        _isSearching = false;
        _isOpen = false;
        _hasSearched = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _isOpen = true;
    });

    _debouncer.run(() async {
      final data = await UniversityService.searchUniversities(query);
      if (mounted) {
        setState(() {
          _results = data;
          _isSearching = false;
          _hasSearched = true;
        });
      }
    });
  }

  void _selectUniversity(UniversityModel university) {
    _controller.text = university.name;
    setState(() {
      _isOpen = false;
    });
    widget.onSelectUniversity(university);
  }

  void _handleRequestUniversity() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Coming Soon'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'SEARCH & SELECT UNIVERSITY *',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.0,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 6),

        // Rounded Search Input Field
        TextField(
          controller: _controller,
          onChanged: _onQueryChanged,
          onTap: () {
            if (_controller.text.trim().length >= 2) {
              setState(() => _isOpen = true);
            }
          },
          style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Search your university...',
            hintStyle: TextStyle(color: Colors.grey.shade400),
            prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
            suffixIcon: _isSearching
                ? const Padding(
                    padding: EdgeInsets.all(12.0),
                    child: SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFFF3F4F6),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
          ),
        ),

        // Selected Status Card
        if (widget.selectedUniversity != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Selected: ${widget.selectedUniversity!.name}',
                    style: const TextStyle(
                      color: Color(0xFF065F46),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],

        // Dropdown Search Results
        if (_isOpen && _controller.text.trim().length >= 2) ...[
          const SizedBox(height: 6),
          Container(
            constraints: const BoxConstraints(maxHeight: 240),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: _results.isNotEmpty
                ? ListView.builder(
                    shrinkWrap: true,
                    itemCount: _results.length,
                    itemBuilder: (context, index) {
                      final item = _results[index];
                      return ListTile(
                        onTap: () => _selectUniversity(item),
                        title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text('${item.city}, ${item.country}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      );
                    },
                  )
                : !_isSearching && _hasSearched
                    ? Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            const Text(
                              "Couldn't find your university.",
                              style: TextStyle(color: Colors.grey, fontSize: 13),
                            ),
                            const SizedBox(height: 10),
                            OutlinedButton.icon(
                              onPressed: _handleRequestUniversity,
                              icon: const Icon(Icons.add_circle_outline_rounded, size: 16),
                              label: const Text('Request University'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF1944F1),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox.shrink(),
          ),
        ],
      ],
    );
  }
}
