import { BadRequestException } from '@nestjs/common';
import { ModerationService } from '../moderation/moderation.service';
import { SECTION_TYPES, Section } from './templates';

const MAX_SECTIONS = 40;
const MAX_JSON_CHARS = 100_000;
const MAX_STRING = 5_000;
const DANGEROUS = /<\s*\/?\s*(script|iframe|object|embed|style|link|meta)\b|javascript:|data:text\/html/i;

function collectStrings(value: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 8) throw new BadRequestException('Sections are nested too deeply');
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out, depth + 1));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out, depth + 1));
  return out;
}

export function validateSections(sections: unknown, moderation: ModerationService): Section[] {
  if (!Array.isArray(sections) || sections.length > MAX_SECTIONS) {
    throw new BadRequestException(`sections must be an array of at most ${MAX_SECTIONS} items`);
  }
  if (JSON.stringify(sections).length > MAX_JSON_CHARS) throw new BadRequestException('Page content is too large');

  for (const s of sections) {
    if (!s || typeof s !== 'object' || !(SECTION_TYPES as readonly string[]).includes((s as Section).type)
        || typeof (s as Section).props !== 'object' || (s as Section).props === null || Array.isArray((s as Section).props)) {
      throw new BadRequestException('Each section needs a valid "type" and a "props" object');
    }
  }

  const strings = collectStrings(sections);
  for (const str of strings) {
    if (str.length > MAX_STRING) throw new BadRequestException('A text value is too long');
    if (DANGEROUS.test(str)) throw new BadRequestException('Unsafe content is not allowed in pages');
    if (/^http:\/\//i.test(str)) throw new BadRequestException('Only https links are allowed');
  }

  const screen = moderation.screenText(...strings);
  if (screen.decision === 'REJECT') {
    throw new BadRequestException({ message: 'Page content violates the marketplace policy', reasons: screen.reasons });
  }
  return sections as Section[];
}