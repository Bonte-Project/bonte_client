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

  /**
   * Validate trainer bio
   * Requirements:
   * - Maximum 500 characters
   */
  static validateBio(bio: string): string | undefined {
    if (bio && bio.length > 500) {
      return 'Bio cannot exceed 500 characters';
    }
    return undefined;
  }

  /**
   * Validate specialization
   * Requirements:
   * - Required
   * - At least 3 characters
   * - Maximum 100 characters
   */
  static validateSpecialization(specialization: string): string | undefined {
    if (!specialization) {
      return undefined;
    }

    if (specialization.length < 3) {
      return 'Specialization must be at least 3 characters';
    }

    if (specialization.length > 100) {
      return 'Specialization cannot exceed 100 characters';
    }

    return undefined;
  }

  /**
   * Validate location
   * Requirements:
   * - Required
   * - At least 3 characters
   * - Maximum 100 characters
   */
  static validateLocation(location: string): string | undefined {
    if (!location) {
      return undefined;
    }

    if (location.length < 3) {
      return 'Location must be at least 3 characters';
    }

    if (location.length > 100) {
      return 'Location cannot exceed 100 characters';
    }

    return undefined;
  }

  /**
   * Validate certification name
   * Requirements:
   * - Required
   * - At least 3 characters
   * - Maximum 100 characters
   */
  static validateCertificationName(name: string): string | undefined {
    if (!name) {
      return 'Certification name is required';
    }

    if (name.length < 3) {
      return 'Certification name must be at least 3 characters';
    }

    if (name.length > 100) {
      return 'Certification name cannot exceed 100 characters';
    }

    return undefined;
  }

  /**
   * Validate URL format
   * Requirements:
   * - Valid URL format (optional - only validate if provided)
   */
  static validateUrl(url: string): string | undefined {
    if (!url) {
      return undefined;
    }

    try {
      new URL(url);
      return undefined;
    } catch {
      return 'Please enter a valid URL';
    }
  }

  /**
   * Validate job title
   * Requirements:
   * - Required
   * - At least 3 characters
   * - Maximum 100 characters
   */
  static validateJobTitle(title: string): string | undefined {
    if (!title) {
      return 'Job title is required';
    }

    if (title.length < 3) {
      return 'Job title must be at least 3 characters';
    }

    if (title.length > 100) {
      return 'Job title cannot exceed 100 characters';
    }

    return undefined;
  }

  /**
   * Validate experience description
   * Requirements:
   * - Maximum 500 characters
   */
  static validateDescription(description: string): string | undefined {
    if (description && description.length > 500) {
      return 'Description cannot exceed 500 characters';
    }
    return undefined;
  }

  /**
   * Validate start date
   * Requirements:
   * - Required
   * - Valid date format (YYYY-MM)
   */
  static validateStartDate(startDate: string): string | undefined {
    if (!startDate) {
      return 'Start date is required';
    }

    if (!/^\d{4}-\d{2}$/.test(startDate)) {
      return 'Invalid date format';
    }

    return undefined;
  }

  /**
   * Validate end date
   * Requirements:
   * - Required
   * - Valid date format (YYYY-MM) or "Present"
   * - Cannot be before start date
   */
  static validateEndDate(endDate: string, startDate: string): string | undefined {
    if (!endDate) {
      return 'End date is required';
    }

    if (endDate !== 'Present' && !/^\d{4}-\d{2}$/.test(endDate)) {
      return 'Invalid date format';
    }

    if (endDate !== 'Present' && startDate && endDate < startDate) {
      return 'End date cannot be before start date';
    }

    return undefined;
  }

  // Добавь эти методы в FormValidator класс:

  /**
   * Validate age
   * Requirements:
   * - Required
   * - Between 13 and 120
   */
  static validateAge(age: number): string | undefined {
    if (!age) {
      return undefined;
    }

    if (age < 13 || age > 120) {
      return 'Age must be between 13 and 120';
    }

    return undefined;
  }

  /**
   * Validate height
   * Requirements:
   * - Required
   * - Between 50 and 300 cm
   */
  static validateHeight(height: number): string | undefined {
    if (!height) {
      return undefined;
    }

    if (height < 50 || height > 300) {
      return 'Height must be between 50 and 300 cm';
    }

    return undefined;
  }

  /**
   * Validate weight
   * Requirements:
   * - Required
   * - Between 20 and 500 kg
   */
  static validateWeight(weight: number): string | undefined {
    if (!weight) {
      return undefined;
    }

    if (weight < 20 || weight > 500) {
      return 'Weight must be between 20 and 500 kg';
    }

    return undefined;
  }
}
