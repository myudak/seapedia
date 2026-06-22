import { z } from "zod";

export const positiveMoneySchema = z.number().int().positive();
export const nonNegativeStockSchema = z.number().int().min(0);
export const phoneSchema = z
  .string()
  .min(8)
  .max(24)
  .regex(/^[0-9+\-\s()]+$/, "Phone number may only contain phone characters.");

export function validatePublicText(value: string, maxLength: number) {
  return z.string().min(1).max(maxLength).parse(value.replace(/\s+/g, " ").trim());
}
