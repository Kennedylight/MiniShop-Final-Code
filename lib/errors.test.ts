import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('extracts the message from an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a plain string as-is', () => {
    expect(getErrorMessage('something went wrong')).toBe('something went wrong');
  });

  it('falls back to a generic message for unknown shapes', () => {
    expect(getErrorMessage({ weird: true })).toBe('An unexpected error occurred.');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred.');
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred.');
  });
});
