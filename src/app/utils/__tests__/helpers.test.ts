import { describe, it, expect } from 'vitest'
import { deriveBenefitPlan, formatINR, parseINR, getInitials } from '../helpers'

describe('deriveBenefitPlan', () => {
  it('returns Executive for CTC >= 10L', () => { expect(deriveBenefitPlan(1_000_000)).toBe('Executive') })
  it('returns Premium for CTC >= 6.5L', () => { expect(deriveBenefitPlan(650_000)).toBe('Premium') })
  it('returns Standard for CTC < 6.5L', () => { expect(deriveBenefitPlan(500_000)).toBe('Standard') })
})

describe('formatINR', () => {
  it('formats with Indian locale', () => { expect(formatINR(100000)).toMatch(/1,00,000/) })
})

describe('parseINR', () => {
  it('parses currency string', () => { expect(parseINR('₹1,00,000')).toBe(100000) })
  it('returns 0 for invalid', () => { expect(parseINR('')).toBe(0) })
})

describe('getInitials', () => {
  it('returns first and last initials', () => { expect(getInitials('John Doe')).toBe('JD') })
  it('handles single name', () => { expect(getInitials('John')).toBe('JO') })
})
