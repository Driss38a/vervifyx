import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AdManagerPage extends ConsumerStatefulWidget {
  const AdManagerPage({super.key});

  @override
  ConsumerState<AdManagerPage> createState() => _AdManagerPageState();
}

class _AdManagerPageState extends ConsumerState<AdManagerPage> {
  // تم تبسيط تعريف المتغير لتفادي مشكل الأقواس في النسخ
  final dynamic myCampaigns = [
    {
      'title': 'حملة ترويجية لمنصة Vervifyx',
      'budget': '100 درهم',
      'isActive': true,
    }
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الحملات الإعلانية'),
        centerTitle: true,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: myCampaigns.length,
        itemBuilder: (context, index) {
          final item = myCampaigns[index];
          return Card(
            child: ListTile(
              title: Text(item['title'].toString()),
              subtitle: Text('الميزانية: ${item['budget']}'),
              trailing: Switch(
                value: item['isActive'] as bool,
                onChanged: (val) {
                  setState(() {
                    item['isActive'] = val;
                  });
                },
              ),
            ),
          );
        },
      ),
    );
  }
}