import { effectivePlan, isTrialActive, trialDaysLeft, hasActiveAccess } from './access';

describe('effectivePlan', () => {
  it('returns starter when no owner', () => {
    expect(effectivePlan(null)).toBe('starter');
  });

  it('returns starter when owner has no plan', () => {
    expect(effectivePlan({})).toBe('starter');
  });

  it('returns the owner plan when set', () => {
    expect(effectivePlan({ plan: 'business' })).toBe('business');
  });
});

describe('isTrialActive', () => {
  it('is false when no owner', () => {
    expect(isTrialActive(null)).toBe(false);
  });

  it('is false when trialEndsAt is missing', () => {
    expect(isTrialActive({})).toBe(false);
  });

  it('is true when trialEndsAt is in the future', () => {
    expect(isTrialActive({ trialEndsAt: Date.now() + 10_000 })).toBe(true);
  });

  it('is false when trialEndsAt is in the past', () => {
    expect(isTrialActive({ trialEndsAt: Date.now() - 10_000 })).toBe(false);
  });
});

describe('trialDaysLeft', () => {
  it('is 0 when no trial end date', () => {
    expect(trialDaysLeft({})).toBe(0);
  });

  it('rounds up the remaining days', () => {
    const oneDayAndAHalf = 1.5 * 24 * 60 * 60 * 1000;
    expect(trialDaysLeft({ trialEndsAt: Date.now() + oneDayAndAHalf })).toBe(2);
  });

  it('never returns a negative number once the trial ended', () => {
    expect(trialDaysLeft({ trialEndsAt: Date.now() - 10_000 })).toBe(0);
  });
});

describe('hasActiveAccess', () => {
  it('grants access during an active trial, regardless of subscriptionStatus', () => {
    expect(
      hasActiveAccess({ trialEndsAt: Date.now() + 10_000, subscriptionStatus: 'inactive' }),
    ).toBe(true);
  });

  it('grants access when subscriptionStatus is active', () => {
    expect(hasActiveAccess({ subscriptionStatus: 'active' })).toBe(true);
  });

  it('denies access when trial ended and subscription is not active', () => {
    expect(
      hasActiveAccess({ trialEndsAt: Date.now() - 10_000, subscriptionStatus: 'inactive' }),
    ).toBe(false);
  });

  it('denies access when owner is null', () => {
    expect(hasActiveAccess(null)).toBe(false);
  });
});
