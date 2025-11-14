/**
 * AULAPUDU 2.0 - AUTH VALIDATORS
 */

import Validator from './Validator.js';

export class SignUpValidator extends Validator {
  validate(data) {
    this.reset();

    this.required(data.email, 'Email')
        .email(data.email, 'Email');

    this.required(data.password, 'Password')
        .minLength(data.password, 8, 'Password')
        .custom(
          data.password,
          (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd),
          'Password',
          'Password must contain uppercase, lowercase, and numbers'
        );

    this.required(data.displayName, 'Display name')
        .minLength(data.displayName, 2, 'Display name')
        .maxLength(data.displayName, 50, 'Display name');

    if (data.role) {
      this.oneOf(data.role, ['presenter', 'spectator', 'admin'], 'Role');
    }

    return this.isValid();
  }
}

export class SignInValidator extends Validator {
  validate(data) {
    this.reset();

    this.required(data.email, 'Email')
        .email(data.email, 'Email');

    this.required(data.password, 'Password');

    return this.isValid();
  }
}

export default { SignUpValidator, SignInValidator };