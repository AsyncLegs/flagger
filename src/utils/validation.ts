import type { FlagEntry } from "../types/flagd";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFlag(flag: FlagEntry): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!flag.key.trim()) {
    errors.push({ field: "key", message: "Flag key is required" });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(flag.key)) {
    errors.push({
      field: "key",
      message: "Flag key may only contain letters, numbers, hyphens, and underscores",
    });
  }

  const variantKeys = Object.keys(flag.variants);
  if (variantKeys.length === 0) {
    errors.push({ field: "variants", message: "At least one variant is required" });
  }

  if (flag.defaultVariant && !variantKeys.includes(flag.defaultVariant)) {
    errors.push({
      field: "defaultVariant",
      message: `Default variant "${flag.defaultVariant}" is not in variants`,
    });
  }

  for (const rule of flag.targeting.rules) {
    if (rule.variant && !variantKeys.includes(rule.variant)) {
      errors.push({
        field: "targeting",
        message: `Rule targets variant "${rule.variant}" which does not exist`,
      });
    }
    for (const cond of rule.conditions) {
      if (!cond.variable.trim()) {
        errors.push({
          field: "targeting",
          message: "Condition variable is required",
        });
      }
    }
  }

  if (flag.targeting.fractional) {
    const totalWeight = flag.targeting.fractional.reduce(
      (sum, e) => sum + e.weight,
      0
    );
    if (totalWeight !== 100) {
      errors.push({
        field: "fractional",
        message: `Fractional weights must sum to 100 (currently ${totalWeight})`,
      });
    }
  }

  return errors;
}
