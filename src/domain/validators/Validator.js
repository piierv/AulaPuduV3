/**
 * AULAPUDU 2.0 - BASE VALIDATOR
 * Clase base para validadores
 */

export class Validator {
  constructor() {
    this.errors = [];
  }

  required(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      this.errors.push(`${fieldName} is required`);
    }
    return this;
  }

  string(value, fieldName) {
    if (value && typeof value !== 'string') {
      this.errors.push(`${fieldName} must be a string`);
    }
    return this;
  }

  email(value, fieldName) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      this.errors.push(`${fieldName} must be a valid email`);
    }
    return this;
  }

  minLength(value, min, fieldName) {
    if (value && value.length < min) {
      this.errors.push(`${fieldName} must be at least ${min} characters`);
    }
    return this;
  }

  maxLength(value, max, fieldName) {
    if (value && value.length > max) {
      this.errors.push(`${fieldName} must be at most ${max} characters`);
    }
    return this;
  }

  pattern(value, regex, fieldName, message) {
    if (value && !regex.test(value)) {
      this.errors.push(message || `${fieldName} format is invalid`);
    }
    return this;
  }

  oneOf(value, allowedValues, fieldName) {
    if (value && !allowedValues.includes(value)) {
      this.errors.push(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`
      );
    }
    return this;
  }

  custom(value, validatorFn, fieldName, message) {
    if (!validatorFn(value)) {
      this.errors.push(message || `${fieldName} is invalid`);
    }
    return this;
  }

  isValid() {
    return this.errors.length === 0;
  }

  getErrors() {
    return [...this.errors];
  }

  reset() {
    this.errors = [];
    return this;
  }
}

export default Validator;