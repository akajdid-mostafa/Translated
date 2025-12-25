/**
 * Centralized Pricing Calculation Utility
 * 
 * This module provides a fixed calculation algorithm that uses
 * pricing settings from the database. The algorithm is fixed,
 * but the pricing values can be changed anytime from the dashboard.
 */

export interface PricingSettings {
  standardCertifiedPricePerPage: number;
  swornPricePerPage: number;
  standardMultiplier: number;
  nextDayMultiplier: number;
  sameDayMultiplier: number;
  hardCopyFee: number;
}

export type DeliveryType = "STANDARD" | "NEXT_DAY" | "SAME_DAY";

/**
 * Calculate the base price per page based on service type
 */
export function getPricePerPage(
  serviceType: "STANDARD_CERTIFIED" | "SWORN",
  pricing: PricingSettings
): number {
  return serviceType === "SWORN" 
    ? pricing.swornPricePerPage 
    : pricing.standardCertifiedPricePerPage;
}

/**
 * Get turnaround multiplier
 */
export function getTurnaroundMultiplier(
  turnaround: "STANDARD" | "NEXT_DAY" | "SAME_DAY",
  pricing: PricingSettings
): number {
  switch (turnaround) {
    case "NEXT_DAY":
      return pricing.nextDayMultiplier;
    case "SAME_DAY":
      return pricing.sameDayMultiplier;
    case "STANDARD":
    default:
      return pricing.standardMultiplier;
  }
}

/**
 * Calculate hard copy fee (single option)
 */
export function getHardCopyFee(
  includeHardCopy: boolean,
  pricing: PricingSettings
): number {
  return includeHardCopy ? pricing.hardCopyFee : 0;
}

/**
 * Main pricing calculation function
 * 
 * Algorithm (FIXED):
 * 1. Get base price per page based on service type (Standard Certified or Sworn)
 * 2. Calculate base translation price: pages × base price per page
 * 3. Apply turnaround multiplier
 * 4. Add hard copy fee if applicable
 * 5. Apply coupon discount if provided
 * 
 * @param numPages - Number of pages to translate
 * @param serviceType - Service type (STANDARD_CERTIFIED or SWORN)
 * @param turnaround - Turnaround time (STANDARD, NEXT_DAY, SAME_DAY)
 * @param pricing - Current pricing settings from database
 * @param includeHardCopy - Whether hard copy is requested
 * @param couponDiscount - Optional coupon discount amount
 * @returns Final calculated price
 */
export function calculatePrice(
  numPages: number,
  serviceType: "STANDARD_CERTIFIED" | "SWORN",
  turnaround: "STANDARD" | "NEXT_DAY" | "SAME_DAY",
  pricing: PricingSettings,
  includeHardCopy: boolean = false,
  couponDiscount: number = 0
): number {
  // Step 1: Get base price per page based on service type
  const basePricePerPage = getPricePerPage(serviceType, pricing);
  
  // Step 2: Calculate base translation price
  const baseTranslationPrice = numPages * basePricePerPage;
  
  // Step 3: Apply turnaround multiplier
  const multiplier = getTurnaroundMultiplier(turnaround, pricing);
  const translationPrice = baseTranslationPrice * multiplier;
  
  // Step 4: Add hard copy fee
  const hardCopyFee = getHardCopyFee(includeHardCopy, pricing);
  
  // Step 5: Calculate subtotal
  let subtotal = translationPrice + hardCopyFee;
  
  // Step 6: Apply coupon discount
  const finalPrice = Math.max(0, subtotal - couponDiscount);

  return finalPrice;
}

/**
 * Calculate price breakdown for display
 */
export interface PriceBreakdown {
  translationPrice: number;
  pricePerPage: number;
  hardCopyFee: number;
  subtotal: number;
  couponDiscount: number;
  finalPrice: number;
}

export function calculatePriceBreakdown(
  numPages: number,
  serviceType: "STANDARD_CERTIFIED" | "SWORN",
  turnaround: "STANDARD" | "NEXT_DAY" | "SAME_DAY",
  pricing: PricingSettings,
  includeHardCopy: boolean = false,
  couponDiscount: number = 0
): PriceBreakdown {
  const basePricePerPage = getPricePerPage(serviceType, pricing);
  const baseTranslationPrice = numPages * basePricePerPage;
  const multiplier = getTurnaroundMultiplier(turnaround, pricing);
  const translationPrice = baseTranslationPrice * multiplier;
  const hardCopyFee = getHardCopyFee(includeHardCopy, pricing);
  const subtotal = translationPrice + hardCopyFee;
  const finalPrice = Math.max(0, subtotal - couponDiscount);

  return {
    translationPrice,
    pricePerPage: basePricePerPage,
    hardCopyFee,
    subtotal,
    couponDiscount,
    finalPrice,
  };
}

