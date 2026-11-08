import 'package:flutter/material.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  // 1. بيانات المتاجر المسجلة
  final List stores = [
    {
      'id': '1',
      'name': 'متجر درب إكسبريس (Derb Express)',
      'owner': 'Driss Elkarmam',
      'status': 'نشط',
      'productsCount': 42,
    },
    {
      'id': '2',
      'name': 'عالم المعدات الكهربائية',
      'owner': 'أحمد التازي',
      'status': 'قيد المراجعة',
      'productsCount': 18,
    },
    {
      'id': '3',
      'name': 'الدار البيضاء للجملة',
      'owner': 'كريم العلمي',
      'status': 'محظور',
      'productsCount': 0,
    },
  ];

  // 2. بيانات الحملات الإعلانية
  final List ads = [
    {
      'title': 'حملة تخفيضات المخططات الهندسية',
      'store': 'متجر درب إكسبريس',
      'budget': '500 درهم',
      'isActive': true,
    },
    {
      'title': 'عروض الإضاءة الذكية والتركيبات',
      'store': 'عالم المعدات الكهربائية',
      'budget': '300 درهم',
      'isActive': false,
    },
  ];

  // 3. بيانات المستخدمين
  final List users = [
    {
      'name': 'Driss Elkarmam',
      'email': 'driss@vervifyx.com',
      'role': 'أدمين رئيسي',
      'isBlocked': false,
    },
    {
      'name': 'أحمد التازي',
      'email': 'ahmed@store.com',
      'role': 'تاجر',
      'isBlocked': false,
    },
    {
      'name': 'يوسف بنجالون',
      'email': 'youssef@user.com',
      'role': 'مشتري',
      'isBlocked': true,
    },
  ];

  // 4. إعدادات النظام
  double commissionRate = 5.0;
  final TextEditingController whatsappController = TextEditingController(text: '+212600000000');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('لوحة تحكم المشرف العام 🛠️', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.blue[900],
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'أهلاً بك، Driss Elkarmam 👑',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                const SizedBox(height: 6),
                const Text(
                  'إليك نظرة عامة وشاملة على أداء منصة Vervifyx التجارية والاجتماعية.',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 24),

                // بطاقات الإحصائيات
                GridView.count(
                  crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: 1.4,
                  children: [
                    _buildStatCard('إجمالي المتاجر', '${stores.length} متجر', Icons.storefront, Colors.blue),
                    _buildStatCard('المنتجات المعروضة', '86 منتج', Icons.inventory_2, Colors.green),
                    _buildStatCard('الحملات النشطة', '${ads.where((a) => a['isActive'] == true).length} إعلان', Icons.campaign, Colors.orange),
                    _buildStatCard('أرباح المنصة', '4,500 درهم', Icons.account_balance_wallet, Colors.purple),
                  ],
                ),
                const SizedBox(height: 30),

                const Text(
                  'إدارة أقسام المنصة ⚙️',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    children: [
                      // 1. إدارة المتاجر
                      ListTile(
                        leading: const Icon(Icons.store, color: Colors.blue),
                        title: const Text('إدارة ومراجعة المتاجر المسجلة', style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: const Text('قبول، تفعيل، أو حظر المتاجر'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _openStoresManagement(context),
                      ),
                      const Divider(height: 1),

                      // 2. إدارة الإعلانات
                      ListTile(
                        leading: const Icon(Icons.campaign, color: Colors.orange),
                        title: const Text('إدارة الإعلانات والحملات الترويجية', style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: const Text('مراجعة وتفعيل إعلانات الواجهة والريلز'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _openAdsManagement(context),
                      ),
                      const Divider(height: 1),

                      // 3. إدارة المستخدمين
                      ListTile(
                        leading: const Icon(Icons.supervised_user_circle, color: Colors.purple),
                        title: const Text('إدارة المستخدمين والمشرفين', style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: const Text('مراقبة الحسابات، الصلاحيات، والحظر'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _openUsersManagement(context),
                      ),
                      const Divider(height: 1),

                      // 4. إعدادات النظام
                      ListTile(
                        leading: const Icon(Icons.settings_suggest, color: Colors.green),
                        title: const Text('إعدادات النظام العامة', style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: const Text('تعديل نسب العمولات، ورقم الواتساب الرسمي'),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () => _openSystemSettings(context),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- 1. صفحة إدارة المتاجر ---
  void _openStoresManagement(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StatefulBuilder(
          builder: (context, setModalState) => Scaffold(
            appBar: AppBar(title: const Text('إدارة المتاجر المسجلة')),
            body: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: stores.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final store = stores[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: store['status'] == 'نشط'
                        ? Colors.green.withOpacity(0.2)
                        : (store['status'] == 'محظور' ? Colors.red.withOpacity(0.2) : Colors.orange.withOpacity(0.2)),
                    child: Icon(
                      Icons.store,
                      color: store['status'] == 'نشط'
                          ? Colors.green
                          : (store['status'] == 'محظور' ? Colors.red : Colors.orange),
                    ),
                  ),
                  title: Text(store['name'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('المالك: ${store['owner']} | الحالة: ${store['status']}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (val) {
                      setState(() {
                        store['status'] = val;
                      });
                      setModalState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('تم تحديث حالة المتجر إلى: $val')),
                      );
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'نشط', child: Text('تفعيل المتجر ✅')),
                      PopupMenuItem(value: 'قيد المراجعة', child: Text('تعليق للمراجعة ⏳')),
                      PopupMenuItem(value: 'محظور', child: Text('حظر المتجر ❌')),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  // --- 2. صفحة إدارة الإعلانات ---
  void _openAdsManagement(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StatefulBuilder(
          builder: (context, setModalState) => Scaffold(
            appBar: AppBar(title: const Text('إدارة الحملات الإعلانية')),
            body: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: ads.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final ad = ads[index];
                return SwitchListTile(
                  title: Text(ad['title'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('المتجر: ${ad['store']} | الميزانية: ${ad['budget']}'),
                  value: ad['isActive'] == true,
                  onChanged: (bool val) {
                    setState(() {
                      ad['isActive'] = val;
                    });
                    setModalState(() {});
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  // --- 3. صفحة إدارة المستخدمين ---
  void _openUsersManagement(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StatefulBuilder(
          builder: (context, setModalState) => Scaffold(
            appBar: AppBar(title: const Text('إدارة المستخدمين والمشرفين')),
            body: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: users.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final user = users[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(user['name'].toString().substring(0, 1)),
                  ),
                  title: Text(user['name'].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${user['email']} | الدور: ${user['role']}'),
                  trailing: IconButton(
                    icon: Icon(
                      user['isBlocked'] == true ? Icons.block : Icons.check_circle,
                      color: user['isBlocked'] == true ? Colors.red : Colors.green,
                    ),
                    onPressed: () {
                      setState(() {
                        user['isBlocked'] = !(user['isBlocked'] == true);
                      });
                      setModalState(() {});
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(user['isBlocked'] == true
                              ? 'تم حظر المستخدم ${user['name']}'
                              : 'تم إلغاء حظر المستخدم ${user['name']}'),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  // --- 4. صفحة إعدادات النظام ---
  void _openSystemSettings(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(title: const Text('إعدادات النظام العامة')),
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('نسبة عمولة المنصة (%)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Slider(
                        value: commissionRate,
                        min: 0.0,
                        max: 20.0,
                        divisions: 40,
                        label: '${commissionRate.toStringAsFixed(1)}%',
                        onChanged: (val) {
                          setState(() {
                            commissionRate = val;
                          });
                        },
                      ),
                    ),
                    Text('${commissionRate.toStringAsFixed(1)}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 24),
                const Text('رقم الواتساب الرسمي للدعم والطلبات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                TextField(
                  controller: whatsappController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.phone),
                  ),
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[900], foregroundColor: Colors.white),
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم حفظ إعدادات النظام بنجاح! 💾')),
                      );
                    },
                    child: const Text('حفظ التعديلات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.08), blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 24),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text('نشط', style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
              )
            ],
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }
}