import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'world_data.dart';

// منسق نصي لتقسيم رقم البطاقة إلى مجموعات من 4 أرقام بحد أقصى 16 رقماً
class CardNumberInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    var text = newValue.text.replaceAll(' ', '');
    
    if (text.length > 16) {
      text = text.substring(0, 16);
    }

    var buffer = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      buffer.write(text[i]);
      if ((i + 1) % 4 == 0 && i + 1 != text.length) {
        buffer.write(' ');
      }
    }

    String formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class AdManagerPage extends StatefulWidget {
  const AdManagerPage({super.key});

  @override
  State<AdManagerPage> createState() => _AdManagerPageState();
}

class _AdManagerPageState extends State<AdManagerPage> {
  // 1. قائمة الحملات الإعلانية
  final List _campaigns = [
    {
      'title': 'حملة ترويجية لمتجر درب إكسبريس',
      'objective': 'زيادة المبيعات والوصول',
      'location': 'المغرب (الدار البيضاء)',
      'age': '18 - 45 سنة',
      'budget': '1,200 درهم',
      'spent': '450 درهم',
      'impressions': '28,400',
      'clicks': '2,150',
      'status': 'نشطة (Active)',
      'isActive': true,
    },
  ];

  // 2. بطاقات الدفع المربوطة
  final List _paymentMethods = [
    {'cardName': 'Visa Card (الرئيسية)', 'number': '•••• •••• •••• 4892', 'expiry': '08/28', 'isDefault': true},
  ];

  // دالة لإضافة بطاقة بنكية جديدة بتنسيق احترافي
  void _showAddCardModal(BuildContext context) {
    final cardNumberController = TextEditingController();
    final cardHolderController = TextEditingController();
    final expiryController = TextEditingController();
    final cvvController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.credit_card, color: Colors.blue, size: 28),
              SizedBox(width: 8),
              Text('ربط بطاقة بنكية جديدة 💳', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SizedBox(
            width: 420,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('أدخل معلومات بطاقتك البنكية بأمان تام لتمويل الحملات الإعلانية.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: cardHolderController,
                    decoration: const InputDecoration(labelText: 'اسم حامل البطاقة', border: OutlineInputBorder(), prefixIcon: Icon(Icons.person)),
                  ),
                  const SizedBox(height: 12),
                  
                  // خانة رقم البطاقة الاحترافية
                  TextField(
                    controller: cardNumberController,
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      CardNumberInputFormatter(),
                    ],
                    decoration: const InputDecoration(
                      labelText: 'رقم البطاقة (16 رقم)',
                      hintText: 'xxxx xxxx xxxx xxxx',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.credit_card),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: expiryController,
                          decoration: const InputDecoration(labelText: 'تاريخ الانتهاء (MM/YY)', hintText: 'MM/YY', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: cvvController,
                          keyboardType: TextInputType.number,
                          maxLength: 4,
                          obscureText: true,
                          decoration: const InputDecoration(labelText: 'رمز الأمان (CVV)', counterText: '', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[800], foregroundColor: Colors.white),
              onPressed: () {
                String rawCardNumber = cardNumberController.text.replaceAll(' ', '');
                if (rawCardNumber.length == 16) {
                  setState(() {
                    _paymentMethods.add({
                      'cardName': 'MasterCard / Visa',
                      'number': '•••• •••• •••• ${rawCardNumber.substring(12)}',
                      'expiry': expiryController.text,
                      'isDefault': false,
                    });
                  });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم ربط البطاقة البنكية بنجاح! 🔒')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('الرجاء إدخال رقم بطاقة صحيح يتكون من 16 رقماً! ⚠️', style: TextStyle(color: Colors.white)), backgroundColor: Colors.red),
                  );
                }
              },
              icon: const Icon(Icons.lock),
              label: const Text('حفظ وربط البطاقة'),
            ),
          ],
        );
      },
    );
  }

  // رسالة تنبيه فورية في البداية بدون إجهاد المستخدم في تعبئة البيانات
  void _showComingSoonAlert(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.info_outline, color: Colors.orange, size: 28),
            SizedBox(width: 8),
            Text('تنبيه هام 🚀'),
          ],
        ),
        content: const Text(
          'خاصية إطلاق الحملات الإعلانية متوقفة في النسخة الأولية.',
          style: TextStyle(fontSize: 15, height: 1.4, fontWeight: FontWeight.bold),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue[900], foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('حسناً'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('مدير الحملات الإعلانية - Meta Ads Manager 📊', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.blue[900],
        foregroundColor: Colors.white,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange[800], foregroundColor: Colors.white),
              onPressed: () => _showAddCardModal(context),
              icon: const Icon(Icons.credit_card, size: 18),
              label: const Text('ربط بطاقة بنكية', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              // تظهر الرسالة فوراً في البداية عند الضغط هنا
              onPressed: () => _showComingSoonAlert(context),
              icon: const Icon(Icons.add_circle_outline, size: 18),
              label: const Text('إنشاء حملة جديدة', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // بطاقات الإحصائيات
            Row(
              children: [
                _buildMetricCard('إجمالي الحملات', '${_campaigns.length}', Icons.layers, Colors.blue),
                const SizedBox(width: 16),
                _buildMetricCard('الميزانية النشطة', '1,200 درهم', Icons.account_balance_wallet, Colors.orange),
                const SizedBox(width: 16),
                _buildMetricCard('البطاقات المربوطة', '${_paymentMethods.length} بطاقة', Icons.credit_card, Colors.purple),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'حملاتك الإعلانية مع الاستهداف الجغرافي الذكي المترابط',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 12),

            // قائمة الحملات
            Expanded(
              child: ListView.builder(
                itemCount: _campaigns.length,
                itemBuilder: (context, index) {
                  final camp = _campaigns[index];
                  return Card(
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: (camp['isActive'] == true ? Colors.green : Colors.grey).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(Icons.campaign, color: camp['isActive'] == true ? Colors.green : Colors.grey, size: 32),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(camp['title'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text('الهدف: ${camp['objective']} | الميزانية: ${camp['budget']}', style: TextStyle(color: Colors.grey[700], fontSize: 13)),
                                const SizedBox(height: 2),
                                Text('🌍 الاستهداف: ${camp['location']} | 👥 العمر: ${camp['age']}', style: TextStyle(color: Colors.blue[800], fontSize: 12, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ),
                          Switch(
                            value: camp['isActive'] == true,
                            onChanged: (val) {
                              setState(() {
                                camp['isActive'] = val;
                                camp['status'] = val ? 'نشطة (Active)' : 'متوقفة (Paused)';
                              });
                            },
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
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.08), blurRadius: 6)],
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 30),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text(title, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
              ],
            ),
          ],
        ),
      ),
    );
  }
}