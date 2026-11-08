import 'dart:convert';
import 'package:flutter/cupertino.dart' show CupertinoLocalizations;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// App texts, loaded from assets/i18n/<language>.json.
/// Missing languages or missing keys fall back to English, so the app never shows an empty label.
class AppStrings {
  AppStrings(this._map);
  final Map<String, String> _map;

  String call(String key) => _map[key] ?? key;

  static AppStrings of(BuildContext context) => Localizations.of<AppStrings>(context, AppStrings)!;
  static const delegate = _AppStringsDelegate();
}

Map<String, String>? _english;

Future<Map<String, String>?> _read(String name) async {
  try {
    final raw = await rootBundle.loadString('assets/i18n/$name.json');
    return (jsonDecode(raw) as Map<String, dynamic>).map((k, v) => MapEntry(k, '$v'));
  } catch (_) {
    return null;
  }
}

class _AppStringsDelegate extends LocalizationsDelegate<AppStrings> {
  const _AppStringsDelegate();

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<AppStrings> load(Locale locale) async {
    _english ??= await _read('en') ?? {};
    final candidates = [
      if (locale.scriptCode != null) '${locale.languageCode}_${locale.scriptCode}',
      if (locale.countryCode != null) '${locale.languageCode}_${locale.countryCode}',
      locale.languageCode,
    ];
    for (final name in candidates) {
      final m = await _read(name);
      if (m != null) return AppStrings({..._english!, ...m});
    }
    return AppStrings(_english!);
  }

  @override
  bool shouldReload(_AppStringsDelegate old) => false;
}

class SafeDelegate<T> extends LocalizationsDelegate<T> {
  const SafeDelegate(this.inner);
  final LocalizationsDelegate<T> inner;

  static const _alias = {'ary': 'ar', 'ckb': 'ar', 'zgh': 'fr'};

  @override
  bool isSupported(Locale locale) => true;

  @override
  Future<T> load(Locale locale) {
    var effective = locale;
    if (!inner.isSupported(effective)) {
      final byLanguage = Locale(locale.languageCode);
      final alias = Locale(_alias[locale.languageCode] ?? 'en');
      effective = inner.isSupported(byLanguage) ? byLanguage : (inner.isSupported(alias) ? alias : const Locale('en'));
    }
    return inner.load(effective);
  }

  @override
  bool shouldReload(covariant SafeDelegate<T> old) => false;
}

typedef SafeMaterial = SafeDelegate<MaterialLocalizations>;
typedef SafeCupertino = SafeDelegate<CupertinoLocalizations>;

extension Tr on BuildContext {
  String tr(String key) => AppStrings.of(this)(key);
}