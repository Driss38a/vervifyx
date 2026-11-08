import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  // قائمة المنشورات في الصفحة الرئيسية
  final feedPosts = [
    {
      'author': 'دريس (متجر درب إكسبريس)',
      'avatar': Icons.storefront,
      'time': 'منذ 10 دقائق',
      'content': 'تم إطلاق متجرنا الرقمي الجديد على منصة Vervifyx 🚀 نوفر لكم أحدث الأدوات التقنية والحلول البرمجية بأفضل الأسعار.',
      'image': Icons.devices,
      'likes': 24,
      'comments': 5,
    },
    {
      'author': 'مهدي للتجهيزات الكهربائية',
      'avatar': Icons.bolt,
      'time': 'منذ ساعة',
      'content': 'توفرت لدينا كمية جديدة من مسارات الإضاءة المغناطيسية وأدوات التركيبات الأصلية.',
      'image': Icons.lightbulb,
      'likes': 42,
      'comments': 12,
    },
  ];

  final TextEditingController _postController = TextEditingController();

  void _createPostDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('إنشاء منشور أو عرض جديد ✍️', style: TextStyle(fontWeight: FontWeight.bold)),
          content: TextField(
            controller: _postController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'ما الذي يدور في ذهنك أو تريد عرضه في المنصة؟',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
              onPressed: () {
                if (_postController.text.isNotEmpty) {
                  setState(() {
                    feedPosts.insert(0, {
                      'author': 'أنت (دريس)',
                      'avatar': Icons.person,
                      'time': 'الآن',
                      'content': _postController.text,
                      'image': Icons.article,
                      'likes': 0,
                      'comments': 0,
                    });
                  });
                  _postController.clear();
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم نشر منشورك بنجاح في المنصة! 🌟')),
                  );
                }
              },
              child: const Text('نشر'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vervifyx - الرئيسية', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // خانة النشر السريع
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Colors.blue,
                    child: Icon(Icons.person, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: _createPostDialog,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Text(
                          'ما الذي تريد مشاركته أو عرضه في متجرك اليوم؟',
                          style: TextStyle(color: Colors.grey[600], fontSize: 13),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),

          // قائمة المنشورات الحية
          ...feedPosts.map((post) {
            return Card(
              elevation: 2,
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                          child: Icon(post['avatar'] as IconData, color: theme.colorScheme.primary),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(post['author'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            Text(post['time'] as String, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      post['content'] as String,
                      style: const TextStyle(fontSize: 14, height: 1.4),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      height: 140,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(post['image'] as IconData, size: 50, color: Colors.blue[300]),
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        TextButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.thumb_up_alt_outlined, size: 18),
                          label: Text('إعجاب (${post['likes']})'),
                        ),
                        TextButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.comment_outlined, size: 18),
                          label: Text('تعليق (${post['comments']})'),
                        ),
                        TextButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.share_outlined, size: 18),
                          label: const Text('مشاركة'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createPostDialog,
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
    );
  }
}