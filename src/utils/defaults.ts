import { v4 as uuidv4 } from "uuid";
import type { FlagEntry, FlagType, FlagVariants } from "../types/flagd";

export function createDefaultFlag(key: string): FlagEntry {
  return {
    key,
    state: "ENABLED",
    flagType: "boolean",
    variants: { on: true, off: false },
    defaultVariant: "off",
    targeting: {
      rules: [],
      fractional: null,
      defaultVariant: "off",
    },
    metadata: {},
  };
}

export function defaultVariantsForType(
  flagType: FlagType
): FlagVariants {
  switch (flagType) {
    case "boolean":
      return { on: true, off: false };
    case "string":
      return { variant_a: "value_a", variant_b: "value_b" };
    case "number":
      return { low: 0, high: 100 };
    case "object":
      return { default: {} };
  }
}

export function createConditionId(): string {
  return uuidv4();
}
