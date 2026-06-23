import * as crypto from 'crypto';

export function hashString(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function compareHash(raw: string, hashed: string): boolean {
  return hashString(raw) === hashed;
}
