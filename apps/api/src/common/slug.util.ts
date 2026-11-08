import { randomBytes } from 'crypto';

export function slugify(input: string): string {
  const s = input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return s || 'item';
}

export function uniqueSlug(input: string): string {
  return `${slugify(input)}-${randomBytes(3).toString('hex')}`;
}