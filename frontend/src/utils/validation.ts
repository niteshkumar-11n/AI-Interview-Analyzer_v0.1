/**
 * Validation Utility
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  return { valid: true, message: '' };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; message: string } {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
}
