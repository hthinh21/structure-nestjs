import * as crypto from 'crypto';

export function generateRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function toSlug(text: string): string {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
  while (slug.startsWith('-')) {
    slug = slug.slice(1);
  }
  while (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }
  return slug;
}
