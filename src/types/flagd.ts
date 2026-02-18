export type FlagType = "boolean" | "string" | "number" | "object";

export type VariantValue = boolean | string | number | Record<string, unknown>;

export interface FlagVariants {
  [key: string]: VariantValue;
}

export interface TargetingCondition {
  id: string;
  variable: string;
  operator: string;
  value: string;
}

export interface TargetingRule {
  id: string;
  conditions: TargetingCondition[];
  variant: string;
}

export interface FractionalEntry {
  id: string;
  variant: string;
  weight: number;
}

export interface FlagTargeting {
  rules: TargetingRule[];
  fractional: FractionalEntry[] | null;
  defaultVariant: string;
}

export interface FlagDefinition {
  state: "ENABLED" | "DISABLED";
  variants: FlagVariants;
  defaultVariant: string;
  targeting?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface FlagEntry {
  key: string;
  state: "ENABLED" | "DISABLED";
  flagType: FlagType;
  variants: FlagVariants;
  defaultVariant: string;
  targeting: FlagTargeting;
  metadata: Record<string, string | number | boolean>;
}

export interface FlagdConfig {
  $schema?: string;
  flags: Record<string, FlagDefinition>;
  $evaluators?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export const OPERATORS = [
  "==",
  "!=",
  "in",
  "ends_with",
  "starts_with",
  "sem_ver",
  "fractional",
] as const;

export type Operator = (typeof OPERATORS)[number];
