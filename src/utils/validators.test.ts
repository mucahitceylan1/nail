import { describe, expect, it } from 'vitest';
import { validatePhone } from './validators';

describe('validatePhone', () => {
  it('kabul eder: 11 hane 0 ile', () => {
    expect(validatePhone('05321234567').isValid).toBe(true);
  });

  it('reddeder: boş', () => {
    expect(validatePhone('').isValid).toBe(false);
  });

  it('reddeder: çok kısa', () => {
    expect(validatePhone('12345').isValid).toBe(false);
  });
});
