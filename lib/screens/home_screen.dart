import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedNavIndex = 0;
  String _selectedCategory = 'all';
  final Set<String> _favoriteIds = {'card-2'};

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All Items'},
    {'id': 'books', 'label': 'Books & Notes'},
    {'id': 'electronics', 'label': 'Electronics'},
    {'id': 'cycles', 'label': 'Cycles & Vehicles'},
    {'id': 'dorm', 'label': 'Dorm Essentials'},
  ];

  final List<Map<String, dynamic>> _products = [
    {
      'id': 'card-1',
      'title': 'Engineering Mathematics Vol 2',
      'price': '\$45',
      'condition': 'LIKE NEW',
      'conditionBg': const Color(0xFFE0F2FE),
      'conditionColor': const Color(0xFF0284C7),
      'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      'sellerName': 'Rahul',
      'sellerAvatar': 'R',
      'sellerBg': const Color(0xFFDBEAFE),
      'sellerColor': const Color(0xFF1E40AF),
      'verified': true,
      'timeAgo': '2h ago'
    },
    {
      'id': 'card-2',
      'title': 'TI-84 Plus CE Graphing Calculator',
      'price': '\$80',
      'condition': 'GOOD',
      'conditionBg': const Color(0xFFEEF2FF),
      'conditionColor': const Color(0xFF4F46E5),
      'image': 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?auto=format&fit=crop&w=600&q=80',
      'sellerName': 'Sarah',
      'sellerAvatar': 'S',
      'sellerBg': const Color(0xFFE0E7FF),
      'sellerColor': const Color(0xFF3730A3),
      'verified': false,
      'timeAgo': '5h ago'
    },
    {
      'id': 'card-3',
      'title': 'Hercules Roadeo Campus Cycle',
      'price': '\$120',
      'condition': 'FAIR',
      'conditionBg': const Color(0xFFFFEDD5),
      'conditionColor': const Color(0xFFEA580C),
      'image': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
      'sellerName': 'Karan',
      'sellerAvatar': 'K',
      'sellerBg': const Color(0xFFD1FAE5),
      'sellerColor': const Color(0xFF065F46),
      'verified': true,
      'timeAgo': '1d ago'
    },
    {
      'id': 'card-4',
      'title': 'Study Desk Lamp (LED)',
      'price': '\$15',
      'condition': 'LIKE NEW',
      'conditionBg': const Color(0xFFE0F2FE),
      'conditionColor': const Color(0xFF0369A1),
      'image': 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=600&q=80',
      'sellerName': 'Maya',
      'sellerAvatar': 'M',
      'sellerBg': const Color(0xFFE0F2FE),
      'sellerColor': const Color(0xFF0369A1),
      'verified': false,
      'timeAgo': '2d ago'
    }
  ];

  void _toggleFavorite(String id) {
    setState(() {
      if (_favoriteIds.contains(id)) {
        _favoriteIds.remove(id);
      } else {
        _favoriteIds.add(id);
      }
    });
  }

  void _showWishlistBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final wishlisted = _products.where((p) => _favoriteIds.contains(p['id'])).toList();
        return Container(
          padding: const EdgeInsets.all(20),
          height: 400,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.favorite_rounded, color: Colors.redAccent, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        'My Wishlist (${wishlisted.length})',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(),
              Expanded(
                child: wishlisted.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.favorite_border_rounded, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Your wishlist is empty', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Tap the heart on items to save them', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: wishlisted.length,
                        itemBuilder: (context, index) {
                          final item = wishlisted[index];
                          return ListTile(
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(item['image'], width: 48, height: 48, fit: BoxFit.cover),
                            ),
                            title: Text(item['title'], maxLines: 1, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            subtitle: Text(item['price'], style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent),
                              onPressed: () {
                                _toggleFavorite(item['id']);
                                Navigator.pop(context);
                              },
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isSellActive = _selectedNavIndex == 2;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Stack(
          children: [
            // Scrollable Content
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 90),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Header Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const CircleAvatar(
                            radius: 22,
                            backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Hi, Ankit 👋',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Find what students are selling today',
                                style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.normal),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          // Wishlist Header Button with Circular Counter Badge Positioned On Top
                          InkWell(
                            onTap: _showWishlistBottomSheet,
                            child: SizedBox(
                              width: 44,
                              height: 44,
                              child: Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  Container(
                                    width: 42,
                                    height: 42,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: const Color(0xFFF1F5F9)),
                                    ),
                                    child: Icon(
                                      _favoriteIds.isNotEmpty ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                      size: 20,
                                      color: _favoriteIds.isNotEmpty ? Colors.redAccent : const Color(0xFF0F172A),
                                    ),
                                  ),
                                  if (_favoriteIds.isNotEmpty)
                                    Positioned(
                                      top: -3,
                                      right: -3,
                                      child: Container(
                                        width: 20,
                                        height: 20,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: Colors.redAccent,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.white, width: 2),
                                        ),
                                        child: Text(
                                          '${_favoriteIds.length}',
                                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFF1F5F9)),
                            ),
                            child: const Icon(Icons.notifications_none_rounded, size: 20, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // 2. Search & Filter Bar
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13, fontWeight: FontWeight.normal),
                          decoration: InputDecoration(
                            hintText: 'Search books, gadgets, cycle',
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13, fontWeight: FontWeight.normal),
                            prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey, size: 20),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFF1F5F9)),
                        ),
                        child: const Icon(Icons.tune_rounded, color: Color(0xFF0F172A), size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // 3. Banner Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1944F1), Color(0xFF0D30BA)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: Stack(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Sell your unused items\ntoday',
                              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.2),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Clear your room, make\nsome cash.',
                              style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12, fontWeight: FontWeight.normal, height: 1.2),
                            ),
                            const SizedBox(height: 14),
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppTheme.primaryBlue,
                                shape: const StadiumBorder(),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                elevation: 0,
                              ),
                              child: const Text('Start Selling', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                            ),
                          ],
                        ),
                        Positioned(
                          right: -10,
                          bottom: -10,
                          child: Icon(Icons.local_shipping_outlined, size: 100, color: Colors.white.withOpacity(0.2)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 4. Categories Horizontal List
                  SizedBox(
                    height: 38,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        final isSelected = _selectedCategory == cat['id'];
                        return ChoiceChip(
                          label: Text(cat['label']!),
                          selected: isSelected,
                          onSelected: (_) => setState(() => _selectedCategory = cat['id']!),
                          selectedColor: AppTheme.primaryBlue,
                          backgroundColor: Colors.white,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                          ),
                          shape: const StadiumBorder(side: BorderSide(color: Color(0xFFF1F5F9))),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 5. Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Fresh on Campus',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: Row(
                          children: const [
                            Text('See All', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w500, fontSize: 12)),
                            SizedBox(width: 2),
                            Icon(Icons.arrow_forward_rounded, size: 14, color: AppTheme.primaryBlue),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // 6. Product Cards Grid
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.72,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: _products.length,
                    itemBuilder: (context, index) {
                      final item = _products[index];
                      final isFav = _favoriteIds.contains(item['id']);

                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFF1F5F9)),
                        ),
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(18),
                                    child: Image.network(item['image'], fit: BoxFit.cover, width: double.infinity, height: double.infinity),
                                  ),

                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: InkWell(
                                      onTap: () => _toggleFavorite(item['id']),
                                      child: CircleAvatar(
                                        radius: 16,
                                        backgroundColor: Colors.white.withOpacity(0.9),
                                        child: Icon(
                                          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                          size: 16,
                                          color: isFav ? Colors.redAccent : Colors.grey,
                                        ),
                                      ),
                                    ),
                                  ),

                                  Positioned(
                                    bottom: 8,
                                    left: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.95),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        item['price'],
                                        style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12, color: Color(0xFF0F172A)),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),

                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: item['conditionBg'],
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item['condition'],
                                style: TextStyle(color: item['conditionColor'], fontSize: 9, fontWeight: FontWeight.w500),
                              ),
                            ),
                            const SizedBox(height: 4),

                            Text(
                              item['title'],
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12, color: Color(0xFF0F172A), height: 1.2),
                            ),
                            const SizedBox(height: 8),

                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 10,
                                      backgroundColor: item['sellerBg'],
                                      child: Text(item['sellerAvatar'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: item['sellerColor'])),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(item['sellerName'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
                                    if (item['verified']) ...[
                                      const SizedBox(width: 2),
                                      const Icon(Icons.check_circle_rounded, size: 12, color: AppTheme.primaryBlue),
                                    ],
                                  ],
                                ),
                                Text(item['timeAgo'], style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.normal)),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Bottom Navigation Bar Dock
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                height: 70,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(0, Icons.home_rounded, Icons.home_outlined, 'Home'),
                    _buildNavItem(1, Icons.chat_bubble_rounded, Icons.chat_bubble_outline_rounded, 'Chats'),
                    
                    // Floating Sell FAB Button
                    Transform.translate(
                      offset: const Offset(0, -14),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          FloatingActionButton(
                            onPressed: () => setState(() => _selectedNavIndex = 2),
                            backgroundColor: AppTheme.primaryBlue,
                            elevation: 4,
                            child: const Icon(Icons.add_rounded, size: 26, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Sell',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSellActive ? FontWeight.w600 : FontWeight.w500,
                              color: isSellActive ? AppTheme.primaryBlue : Colors.grey.shade400,
                            ),
                          ),
                        ],
                      ),
                    ),

                    _buildNavItem(3, Icons.folder_rounded, Icons.folder_outlined, 'My Ads'),
                    _buildNavItem(4, Icons.person_rounded, Icons.person_outline_rounded, 'Profile'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData filledIcon, IconData outlineIcon, String label) {
    final isSelected = _selectedNavIndex == index;
    return InkWell(
      onTap: () => setState(() => _selectedNavIndex = index),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? filledIcon : outlineIcon, 
              color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade400, 
              size: 20
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
