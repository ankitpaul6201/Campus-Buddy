import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  final VoidCallback onBackToHome;
  const ChatScreen({Key? key, required this.onBackToHome}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  Map<String, dynamic>? _activeChat;
  final TextEditingController _messageController = TextEditingController();

  final List<Map<String, dynamic>> _conversations = [
    {
      'id': 'chat-1',
      'name': 'Sarah Jenkins',
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'activeStatus': 'Active now',
      'isOnline': true,
      'itemTitle': 'MTH 101 Textbook - Slightly Used',
      'itemPrice': '\$45.00',
      'itemImage': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
      'lastMessage': 'Hey! Is this still available? I can...',
      'time': 'Just now',
      'unreadCount': 1,
      'messages': [
        {
          'sender': 'them',
          'text': 'Hey! Thanks for reaching out. Yes, the textbook is still available. Are you on campus today?',
          'time': '10:42 AM'
        },
        {
          'sender': 'me',
          'text': "Great! Yes, I'll be studying at the main library around 2 PM. Can we meet somewhere near there?",
          'time': '10:45 AM'
        },
        {
          'sender': 'them',
          'text': 'Perfect. Meet by the coffee shop entrance on the first floor?',
          'time': '10:47 AM'
        }
      ]
    },
    {
      'id': 'chat-2',
      'name': 'Michael Chang',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'activeStatus': 'Active 2h ago',
      'isOnline': false,
      'itemTitle': 'Mini Fridge (Dorm Size)',
      'itemPrice': '\$80.00',
      'itemImage': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80',
      'lastMessage': 'Sounds good, see you at 5 then.',
      'time': '2h ago',
      'unreadCount': 0,
      'messages': [
        {
          'sender': 'them',
          'text': 'Sounds good, see you at 5 then.',
          'time': '1:45 PM'
        }
      ]
    },
    {
      'id': 'chat-3',
      'name': 'Elena Rodriguez',
      'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      'activeStatus': 'Active yesterday',
      'isOnline': false,
      'itemTitle': 'Acoustic Guitar - Yamaha',
      'itemPrice': '\$65.00',
      'itemImage': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80',
      'lastMessage': 'Would you take \$50 for it?',
      'time': 'Yesterday',
      'unreadCount': 0,
      'messages': [
        {
          'sender': 'them',
          'text': 'Would you take \$50 for it?',
          'time': 'Yesterday'
        }
      ]
    },
    {
      'id': 'chat-4',
      'name': 'James Doe',
      'avatar': null,
      'initials': 'JD',
      'activeStatus': 'Active Mon',
      'isOnline': false,
      'itemTitle': 'Desk Lamp - LED',
      'itemPrice': '\$15.00',
      'itemImage': 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=300&q=80',
      'lastMessage': 'Thanks again for dropping it off!',
      'time': 'Mon',
      'unreadCount': 0,
      'messages': [
        {
          'sender': 'them',
          'text': 'Thanks again for dropping it off!',
          'time': 'Mon'
        }
      ]
    }
  ];

  void _sendMessage([String? text]) {
    final messageText = text ?? _messageController.text.trim();
    if (messageText.isEmpty || _activeChat == null) return;

    setState(() {
      final List<Map<String, String>> currentMsgs = List.from(_activeChat!['messages']);
      currentMsgs.add({
        'sender': 'me',
        'text': messageText,
        'time': 'Just now'
      });
      _activeChat!['messages'] = currentMsgs;
      _activeChat!['lastMessage'] = messageText;
      _messageController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F3F3),
      body: SafeArea(
        child: _activeChat == null ? _buildInboxListView() : _buildActiveChatDetailView(),
      ),
    );
  }

  // 1. Inbox List View
  Widget _buildInboxListView() {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Messages',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 16),

          // Search Bar
          TextField(
            decoration: InputDecoration(
              hintText: 'Search chats...',
              hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
              prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey, size: 20),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),

          Expanded(
            child: ListView.separated(
              itemCount: _conversations.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final chat = _conversations[index];
                return InkWell(
                  onTap: () => setState(() => _activeChat = chat),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.grey.shade100),
                    ),
                    child: Row(
                      children: [
                        Stack(
                          children: [
                            chat['avatar'] != null
                                ? SizedBox(
                                    width: 56,
                                    height: 56,
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(28),
                                      child: Image.network(chat['avatar'], fit: BoxFit.cover),
                                    ),
                                  )
                                : SizedBox(
                                    width: 56,
                                    height: 56,
                                    child: CircleAvatar(
                                      backgroundColor: const Color(0xFFE8EEFF),
                                      child: Text(
                                        chat['initials'],
                                        style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                            if (chat['isOnline'] == true)
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: Container(
                                  width: 14,
                                  height: 14,
                                  decoration: BoxDecoration(
                                    color: Colors.emerald,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 2),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(width: 12),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    chat['name'],
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                                  ),
                                  Text(
                                    chat['time'],
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: chat['unreadCount'] > 0 ? AppTheme.primaryBlue : Colors.grey,
                                      fontWeight: chat['unreadCount'] > 0 ? FontWeight.bold : FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),

                              Text(
                                chat['itemTitle'],
                                style: const TextStyle(color: AppTheme.primaryBlue, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),

                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      chat['lastMessage'],
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 12, color: Colors.black54),
                                    ),
                                  ),
                                  if (chat['unreadCount'] > 0)
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: const BoxDecoration(
                                        color: AppTheme.primaryBlue,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Text(
                                        '${chat['unreadCount']}',
                                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // 2. Active 1-on-1 Chat Detail View
  Widget _buildActiveChatDetailView() {
    final List messages = _activeChat!['messages'];

    return Column(
      children: [
        // App Bar Header with Bold 3-Dot Menu
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => setState(() => _activeChat = null),
              ),
              CircleAvatar(
                radius: 18,
                backgroundImage: NetworkImage(_activeChat!['avatar'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_activeChat!['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(_activeChat!['activeStatus'], style: const TextStyle(color: AppTheme.primaryBlue, fontSize: 11)),
                ],
              ),
              const Spacer(),
              
              // Thick 3-Dot Icon
              const Icon(Icons.more_vert_rounded, color: Color(0xFF0F172A), size: 24),
            ],
          ),
        ),

        // Product Sub-Header
        Container(
          color: const Color(0xFFF8FAFC),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade100),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(_activeChat!['itemImage'], width: 40, height: 40, fit: BoxFit.cover),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_activeChat!['itemTitle'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      Text(_activeChat!['itemPrice'], style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: Colors.grey),
              ],
            ),
          ),
        ),

        // Chat Bubble Stream
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              final isMe = msg['sender'] == 'me';

              return Align(
                alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                  decoration: BoxDecoration(
                    color: isMe ? AppTheme.primaryBlue : const Color(0xFFE8EEFF),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Text(
                    msg['text'],
                    style: TextStyle(color: isMe ? Colors.white : Colors.black87, fontSize: 13),
                  ),
                ),
              );
            },
          ),
        ),

        // Quick Reply Chips
        Container(
          height: 40,
          color: Colors.white,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              'Is it available?',
              'Can you reduce price?',
              'Where can we meet?'
            ].map((reply) => Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ActionChip(
                label: Text(reply, style: const TextStyle(color: AppTheme.primaryBlue, fontSize: 11)),
                backgroundColor: Colors.white,
                shape: const StadiumBorder(side: BorderSide(color: Color(0xFFD0DDFE))),
                onPressed: () => _sendMessage(reply),
              ),
            )).toList(),
          ),
        ),

        // Input Bar featuring send-1-svgrepo-com Icon
        Container(
          padding: const EdgeInsets.all(12),
          color: Colors.white,
          child: Row(
            children: [
              const CircleAvatar(
                backgroundColor: Color(0xFFE8EEFF),
                child: Icon(Icons.add, color: AppTheme.primaryBlue),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _messageController,
                  decoration: InputDecoration(
                    hintText: 'Message...',
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: AppTheme.primaryBlue,
                child: IconButton(
                  icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  onPressed: () => _sendMessage(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
