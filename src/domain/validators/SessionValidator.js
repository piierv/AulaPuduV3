/**
 * AULAPUDU 2.0 - SESSION VALIDATORS
 */

import Validator from './Validator.js';

export class CreateSessionValidator extends Validator {
  validate(data) {
    this.reset();

    this.required(data.title, 'Title')
        .string(data.title, 'Title')
        .minLength(data.title, 3, 'Title')
        .maxLength(data.title, 100, 'Title');

    this.required(data.presenterId, 'Presenter ID')
        .string(data.presenterId, 'Presenter ID');

    if (data.settings) {
      if (data.settings.maxAttendees !== undefined) {
        if (typeof data.settings.maxAttendees !== 'number' || 
            data.settings.maxAttendees < 1) {
          this.errors.push('Max attendees must be a positive number');
        }
      }
    }

    return this.isValid();
  }
}

export class JoinSessionValidator extends Validator {
  validate(data) {
    this.reset();

    this.required(data.code, 'Session code')
        .string(data.code, 'Session code')
        .minLength(data.code, 6, 'Session code')
        .maxLength(data.code, 8, 'Session code')
        .pattern(
          data.code,
          /^[A-Z0-9]+$/,
          'Session code',
          'Session code must contain only uppercase letters and numbers'
        );

    this.required(data.attendeeName, 'Name')
        .string(data.attendeeName, 'Name')
        .minLength(data.attendeeName, 2, 'Name')
        .maxLength(data.attendeeName, 50, 'Name');

    return this.isValid();
  }
}

export default { CreateSessionValidator, JoinSessionValidator };