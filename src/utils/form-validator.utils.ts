//src\utils\form-validator.utils.ts
export class FormValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PASSWORD_MIN_LENGTH = 8;
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  private static readonly NAME_MIN_LENGTH = 2;
  private static readonly NAME_REGEX = /^[a-zA-Z\s'-]{2,}$/;
  private static readonly VERIFICATION_CODE_LENGTH = 4;

  /**
   * Validate full name
   * Requirements:
   * - At least 2 characters
   * - Only letters, spaces, hyphens, and apostrophes
   */
  static validateFullName(fullName: string): string | undefined {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      return 'Full name is required';
    }

    if (trimmedName.length < this.NAME_MIN_LENGTH) {
      return `Full name must be at least ${this.NAME_MIN_LENGTH} characters`;
    }

    if (!this.NAME_REGEX.test(trimmedName)) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return undefined;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): string | undefined {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return 'Email is required';
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }

    return undefined;
  }

  /**
   * Validate password strength
   * Requirements:
   * - At least 8 characters
   * - Contains uppercase letter
   * - Contains lowercase letter
   * - Contains number
   */
  static validatePassword(password: string): string | undefined {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < this.PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`;
    }

    if (!this.PASSWORD_REGEX.test(password)) {
      return 'Password must contain uppercase, lowercase, and numbers';
    }

    return undefined;
  }

  /**
   * Validate password confirmation
   */
  static validatePasswordMatch(password: string, confirmPassword: string): string | undefined {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return undefined;
  }

  /**
   * Validate email verification code
   * Requirements:
   * - Exactly 4 digits
   * - Only numeric characters
   */
  static verifyEmail(code: string): string | undefined {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return 'Verification code is required';
    }

    if (trimmedCode.length !== this.VERIFICATION_CODE_LENGTH) {
      return `Verification code must be exactly ${this.VERIFICATION_CODE_LENGTH} digits`;
    }

    if (!/^\d+$/.test(trimmedCode)) {
      return 'Verification code must contain only numbers';
    }

    return undefined;
  }

  /**
   * Validate all registration fields
   */
  static validateRegistration(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Record<string, string | undefined> {
    return {
      fullName: this.validateFullName(fullName),
      email: this.validateEmail(email),
      password: this.validatePassword(password),
      confirmPassword: this.validatePasswordMatch(password, confirmPassword),
    };
  }
}
