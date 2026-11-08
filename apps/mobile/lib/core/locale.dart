import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api.dart';
import 'languages.dart';

class LocaleController extends StateNotifier<Locale?> {
  LocaleController(this._ref) : super(null) {
    _restore();
  }
  final Ref _ref;

  Future<void> _restore() async {
    final tag = await _ref.read(storageProvider).read(key: 'locale');
    if (tag != null && tag.isNotEmpty) state = localeFromTag(tag);
  }

  Future<void> choose(Locale? locale) async {
    state = locale;
    final store = _ref.read(storageProvider);
    if (locale == null) {
      await store.delete(key: 'locale');
    } else {
      await store.write(key: 'locale', value: tagOf(locale));
    }
  }
}

final localeProvider = StateNotifierProvider<LocaleController, Locale?>((ref) => LocaleController(ref));