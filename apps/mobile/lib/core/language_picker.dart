import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/i18n.dart';
import '../core/languages.dart';
import '../core/locale.dart';

// تعريف الدالة بحيث تقبل وسيطاً واحداً (context) فقط لتتوافق مع login_page و home_page و profile_page
void showLanguagePicker(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => const _LanguageSheet(),
  );
}

class _LanguageSheet extends ConsumerStatefulWidget {
  const _LanguageSheet();
  @override
  ConsumerState<_LanguageSheet> createState() => _LanguageSheetState();
}

class _LanguageSheetState extends ConsumerState<_LanguageSheet> {
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final current = ref.watch(localeProvider);
    final q = _q.trim().toLowerCase();
    
    // تأكد من استخدام الاسم الصحيح الموجود في ملف languages.dart (سواء AppLocales أو AppLanguages)
    final items = AppLocales.supported
        .where((l) => q.isEmpty || languageName(l).toLowerCase().contains(q) || tagOf(l).toLowerCase().contains(q))
        .toList();
        
    return SizedBox(
      height: MediaQuery.of(context).size.height * .8,
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            onChanged: (v) => setState(() => _q = v),
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search), 
              hintText: context.tr('search'),
            ),
          ),
        ),
        Expanded(
          child: ListView(children: [
            ListTile(
              leading: const Icon(Icons.phone_android),
              title: Text(context.tr('system_default')),
              trailing: current == null ? const Icon(Icons.check) : null,
              onTap: () { 
                ref.read(localeProvider.notifier).choose(null); 
                Navigator.pop(context); 
              },
            ),
            for (final l in items)
              ListTile(
                title: Text(languageName(l)),
                subtitle: Text(tagOf(l)),
                trailing: current != null && tagOf(current) == tagOf(l) ? const Icon(Icons.check) : null,
                onTap: () { 
                  ref.read(localeProvider.notifier).choose(l); 
                  Navigator.pop(context); 
                },
              ),
          ]),
        ),
      ]),
    );
  }
}