import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:vervifyx/core/i18n.dart';
import 'package:vervifyx/design/language_picker.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _postController = TextEditingController();
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _groupNameController = TextEditingController();
  
  bool _isSearching = false;
  bool _isLiked = false;
  
  final List<String> _commentsList = ['مرحباً بك يا أسي دريس، منتجات ممتازة جداً! ⚡', 'تبارك الله على جودة الخدمات الرقمية.'];

  final List _groupsList = [
    {'name': 'مجموعة تقنيات الكهرباء والمعدات', 'members': '1.2K أعضاء', 'icon': '⚡'},
    {'name': 'عشاق التجارة الإلكترونية والدروبشيبينغ', 'members': '3.4K أعضاء', 'icon': '🛒'},
    {'name': 'تخفيضات وعروض Derb Express', 'members': '5K أعضاء', 'icon': '🔥'},
  ];

  String _safeTranslate(BuildContext context, String key, String fallback) {
    try {
      final res = context.tr(key);
      return (res.isEmpty || res == key) ? fallback : res;
    } catch (_) {
      return fallback;
    }
  }

  // دالة فتح البروفيل (حساب عادي أو حساب متجر) عند الضغط على الاسم أو الصورة
  void _openUserProfile(BuildContext context, {
    required String name,
    required String role,
    required String avatarLetter,
    required bool isStore,
  }) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _QuickProfileViewPage(
          name: name,
          role: role,
          avatarLetter: avatarLetter,
          isStore: isStore,
        ),
      ),
    );
  }

  // نافذة إنشاء منشور أو منتج جديد
  void _showCreatePostBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('إنشاء منشور أو عرض منتج جديد', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Divider(),
              const SizedBox(height: 10),
              TextField(
                controller: _postController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'ما الذي تريد مشاركته أو عرضه اليوم؟',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 15),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {
                    if (_postController.text.isNotEmpty) {
                      Navigator.pop(context);
                      _postController.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم نشر المنشور بنجاح! 🚀')),
                      );
                    }
                  },
                  child: const Text('نشر الآن', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // نافذة إنشاء مجموعة جديدة
  void _showCreateGroupBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('إنشاء مجموعة تجارية/تقنية جديدة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Divider(),
              const SizedBox(height: 10),
              TextField(
                controller: _groupNameController,
                decoration: const InputDecoration(
                  hintText: 'أدخل اسم المجموعة (مثال: مجموعة معدات الكهرباء)...',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 15),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1565C0),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () {
                    if (_groupNameController.text.isNotEmpty) {
                      setState(() {
                        _groupsList.add({
                          'name': _groupNameController.text,
                          'members': '1 عضو جديد',
                          'icon': '👥',
                        });
                      });
                      Navigator.pop(context);
                      _groupNameController.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم إنشاء المجموعة بنجاح! ⚡')),
                      );
                    }
                  },
                  child: const Text('إنشاء المجموعة', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // نافذة التعليقات التفاعلية
  void _showCommentsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                left: 20,
                right: 20,
                top: 20,
              ),
              height: MediaQuery.of(context).size.height * 0.5,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('التعليقات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const Divider(),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _commentsList.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(
                            children: [
                              const CircleAvatar(backgroundColor: Colors.blue, radius: 14, child: Text('د', style: TextStyle(color: Colors.white, fontSize: 11))),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                                  child: Text(_commentsList[index], style: const TextStyle(fontSize: 13)),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          decoration: const InputDecoration(
                            hintText: 'اكتب تعليقاً...',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.send, color: Color(0xFF1565C0)),
                        onPressed: () {
                          if (_commentController.text.isNotEmpty) {
                            setModalState(() {
                              _commentsList.add(_commentController.text);
                              _commentController.clear();
                            });
                            setState(() {});
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // نافذة الإشعارات
  void _showNotificationsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('الإشعارات الأخيرة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.campaign, color: Colors.blue),
                title: const Text('تم إطلاق متجر Derb Express بنجاح'),
                subtitle: const Text('منذ 10 دقائق'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.shopping_bag, color: Colors.green),
                title: const Text('طلب جديد في انتظار المراجعة'),
                subtitle: const Text('منذ ساعة'),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }

  // نافذة خيارات المشاركة
  void _showFacebookShareOptions(BuildContext context, String productName) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          height: MediaQuery.of(context).size.height * 0.45,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 15),
              const Text('خيارات المشاركة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 5),
              Text('مشاركة منتج: "$productName"', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              const Divider(height: 20),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Colors.blueAccent, child: Icon(Icons.person, color: Colors.white)),
                title: const Text('مشاركة في ملفك الشخصي (Feed)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تمت مشاركة المنشور في ملفك الشخصي بنجاح! ✅')),
                  );
                },
              ),
              ListTile(
                leading: const CircleAvatar(backgroundColor: Colors.green, child: Icon(Icons.groups, color: Colors.white)),
                title: const Text('مشاركة في مجموعة', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تمت المشاركة في المجموعة بنجاح! 🚀')),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        elevation: 1,
        titleSpacing: 10,
        title: _isSearching
            ? Container(
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: TextField(
                  controller: _searchController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    hintText: 'بحث في VervifyX (منتجات، مجموعات)...',
                    hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                    prefixIcon: Icon(Icons.search, size: 20, color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              )
            : const Text(
                'VervifyX',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24, letterSpacing: 0.5),
              ),
        actions: [
          CircleAvatar(
            backgroundColor: Colors.blue[700],
            radius: 18,
            child: IconButton(
              icon: Icon(_isSearching ? Icons.close : Icons.search, color: Colors.white, size: 18),
              onPressed: () {
                setState(() {
                  _isSearching = !_isSearching;
                  if (!_isSearching) _searchController.clear();
                });
              },
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: Colors.blue[700],
            radius: 18,
            child: IconButton(
              icon: const Icon(Icons.language, color: Colors.white, size: 18),
              onPressed: () => showLanguagePicker(context),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: Colors.blue[700],
            radius: 18,
            child: IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 18),
              onPressed: () => _showNotificationsSheet(context),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          // 1. صندوق إنشاء منشور
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                Row(
                  children: [
                    // الضغط على صورة البروفيل الفوقانية كيحل البروفيل ديالك
                    InkWell(
                      onTap: () => _openUserProfile(
                        context,
                        name: 'Driss Elkarmam',
                        role: 'مدير المنصة • حساب موثق',
                        avatarLetter: 'د',
                        isStore: false,
                      ),
                      child: const CircleAvatar(
                        backgroundColor: Colors.blue,
                        child: Text('د', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () => _showCreatePostBottomSheet(context),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Text(
                            _safeTranslate(context, 'what_on_your_mind', 'ما الذي تريد مشاركته أو عرضه اليوم يا دريس؟'),
                            style: TextStyle(color: Colors.grey[600], fontSize: 13),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    InkWell(
                      onTap: () => _showCreatePostBottomSheet(context),
                      borderRadius: BorderRadius.circular(8),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.photo_library, color: Colors.green, size: 20),
                            SizedBox(width: 6),
                            Text('صورة / منتج', style: TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () => _showCreateGroupBottomSheet(context),
                      borderRadius: BorderRadius.circular(8),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.groups, color: Colors.blue, size: 20),
                            SizedBox(width: 6),
                            Text('مجموعة جديدة', style: TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // 2. شريط القصص / المتاجر (Stories) - الضغط على أي متجر كيفتح البروفيل ديالو
          Container(
            color: Colors.white,
            height: 120,
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                InkWell(
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('جارٍ رفع القصة الجديدة... 📸')),
                    );
                  },
                  child: Container(
                    width: 80,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(backgroundColor: Colors.blue, radius: 18, child: Icon(Icons.add, color: Colors.white, size: 20)),
                        SizedBox(height: 6),
                        Text('إضافة قصة', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                for (int i = 1; i <= 5; i++)
                  InkWell(
                    onTap: () => _openUserProfile(
                      context,
                      name: 'متجر $i (Derb Express Partner)',
                      role: 'متجر تجاري معتمد • الدار البيضاء',
                      avatarLetter: '$i',
                      isStore: true,
                    ),
                    child: Container(
                      width: 80,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blue[300]!, width: 1.5),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            top: 6,
                            left: 6,
                            child: CircleAvatar(
                              backgroundColor: Colors.blue,
                              radius: 12,
                              child: Text('$i', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          Align(
                            alignment: Alignment.bottomCenter,
                            child: Padding(
                              padding: const EdgeInsets.all(6.0),
                              child: Text(
                                'متجر $i',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // 3. منشور تجريبي - الضغط على الصورة أو اسم الحساب كيفتح البروفيل ديالو
          Container(
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: InkWell(
                    onTap: () => _openUserProfile(
                      context,
                      name: 'Driss Elkarmam',
                      role: 'مدير المنصة • حساب تجاري وشخصي',
                      avatarLetter: 'د',
                      isStore: true,
                    ),
                    child: const Row(
                      children: [
                        CircleAvatar(backgroundColor: Colors.blue, child: Text('د', style: TextStyle(color: Colors.white))),
                        SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Driss Elkarmam (مدير المنصة)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1565C0))),
                            Text('منذ 10 دقائق • 🌍 عام', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    'متوفر لدينا أحدث الأدوات الرقمية واللولول البوسنية بتخفيض الأسعار ⚡ تم إطلاق متجرنا الرقمي الجديد على منصة VervifyX.',
                    style: TextStyle(fontSize: 13.5),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 200,
                  width: double.infinity,
                  color: Colors.blue[50],
                  child: const Center(
                    child: Icon(Icons.shopping_bag_outlined, size: 60, color: Colors.blue),
                  ),
                ),
                const Divider(height: 1),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _isLiked = !_isLiked;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(_isLiked ? 'تم إبداء الإعجاب بالمنشور! 👍' : 'تم إلغاء الإعجاب')),
                        );
                      },
                      icon: Icon(
                        _isLiked ? Icons.thumb_up_alt : Icons.thumb_up_alt_outlined, 
                        size: 18, 
                        color: _isLiked ? Colors.blue : Colors.grey,
                      ),
                      label: Text('إعجاب', style: TextStyle(color: _isLiked ? Colors.blue : Colors.grey)),
                    ),
                    TextButton.icon(
                      onPressed: () => _showCommentsBottomSheet(context),
                      icon: const Icon(Icons.chat_bubble_outline, size: 18, color: Colors.grey),
                      label: const Text('تعليق', style: TextStyle(color: Colors.grey)),
                    ),
                    TextButton.icon(
                      onPressed: () => _showFacebookShareOptions(context, 'أدوات رقمية ولولول'),
                      icon: const Icon(Icons.share_outlined, size: 18, color: Colors.grey),
                      label: const Text('مشاركة', style: TextStyle(color: Colors.grey)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// صفحة عرض البروفيل (حساب عادي أو متجر) بشريط علوي أزرق موحد
class _QuickProfileViewPage extends StatefulWidget {
  final String name;
  final String role;
  final String avatarLetter;
  final bool isStore;

  const _QuickProfileViewPage({
    required this.name,
    required this.role,
    required this.avatarLetter,
    required this.isStore,
  });

  @override
  State<_QuickProfileViewPage> createState() => _QuickProfileViewPageState();
}

class _QuickProfileViewPageState extends State<_QuickProfileViewPage> {
  bool _isFollowing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: Text(widget.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: const Color(0xFF1565C0),
                  child: Text(widget.avatarLetter, style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(widget.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 6),
                    Icon(widget.isStore ? Icons.storefront : Icons.verified, color: Colors.blue, size: 20),
                  ],
                ),
                const SizedBox(height: 4),
                Text(widget.role, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isFollowing ? Colors.grey[300] : const Color(0xFF1565C0),
                        foregroundColor: _isFollowing ? Colors.black87 : Colors.white,
                      ),
                      onPressed: () => setState(() => _isFollowing = !_isFollowing),
                      icon: Icon(_isFollowing ? Icons.check : Icons.person_add, size: 18),
                      label: Text(_isFollowing ? 'متابَع' : 'متابعة'),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('فتح محادثة مباشرة مع ${widget.name}... 💬')),
                        );
                      },
                      icon: const Icon(Icons.message_outlined, size: 18),
                      label: const Text('مراسلة'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Text(
              widget.isStore ? 'منتجات وعروض المتجر' : 'المنشورات الأخيرة',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.isStore
                      ? 'عروض حصرية متوفرة الآن للطلب المباشر عبر منصة VervifyX.'
                      : 'مرحباً بالجميع في حسابي الشخصي على VervifyX!',
                  style: const TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 10),
                Container(
                  height: 140,
                  width: double.infinity,
                  decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(8)),
                  child: Icon(widget.isStore ? Icons.shopping_bag_outlined : Icons.article_outlined, size: 50, color: Colors.blue),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}