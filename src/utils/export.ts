import type {
  FlagdConfig,
  FlagDefinition,
  FlagEntry,
  FlagType,
  FlagTargeting,
  FlagVariants,
  TargetingRule,
  TargetingCondition,
  FractionalEntry,
} from "../types/flagd";
import { createConditionId } from "./defaults";

function buildTargetingJson(targeting: FlagTargeting): Record<string, unknown> | undefined {
  if (targeting.rules.length === 0 && !targeting.fractional) {
    return undefined;
  }

  if (targeting.fractional && targeting.fractional.length > 0) {
    const fracs = targeting.fractional.map((f) => [f.variant, f.weight]);
    return {
      fractional: fracs,
    };
  }

  // Build if/then/else chain
  let result: Record<string, unknown> | undefined;

  for (let i = targeting.rules.length - 1; i >= 0; i--) {
    const rule = targeting.rules[i];
    const conditions = rule.conditions.map((c) => buildConditionJson(c));

    const condition =
      conditions.length === 1 ? conditions[0] : { and: conditions };

    if (!result) {
      result = {
        if: [condition, rule.variant, targeting.defaultVariant],
      };
    } else {
      result = {
        if: [condition, rule.variant, result],
      };
    }
  }

  return result;
}

function buildConditionJson(cond: TargetingCondition): Record<string, unknown> {
  const varRef = { var: cond.variable };

  switch (cond.operator) {
    case "==":
      return { "==": [varRef, cond.value] };
    case "!=":
      return { "!=": [varRef, cond.value] };
    case "in":
      return { in: [varRef, cond.value.split(",").map((s) => s.trim())] };
    case "ends_with":
      return { ends_with: [varRef, cond.value] };
    case "starts_with":
      return { starts_with: [varRef, cond.value] };
    case "sem_ver":
      return { sem_ver: [varRef, ">=", cond.value] };
    default:
      return { "==": [varRef, cond.value] };
  }
}

export function flagsToConfig(
  flags: FlagEntry[],
  globalMetadata?: Record<string, unknown>,
  evaluators?: Record<string, unknown>
): FlagdConfig {
  const config: FlagdConfig = {
    $schema: "https://flagd.dev/schema/v0/flags.json",
    flags: {},
  };

  if (globalMetadata && Object.keys(globalMetadata).length > 0) {
    config.metadata = globalMetadata;
  }

  if (evaluators && Object.keys(evaluators).length > 0) {
    config.$evaluators = evaluators;
  }

  for (const flag of flags) {
    const def: FlagDefinition = {
      state: flag.state,
      variants: flag.variants,
      defaultVariant: flag.defaultVariant,
    };

    const targeting = buildTargetingJson(flag.targeting);
    if (targeting) {
      def.targeting = targeting;
    }

    if (Object.keys(flag.metadata).length > 0) {
      def.metadata = flag.metadata;
    }

    config.flags[flag.key] = def;
  }

  return config;
}

function inferFlagType(variants: FlagVariants): FlagType {
  const values = Object.values(variants);
  if (values.length === 0) return "string";
  const first = values[0];
  if (typeof first === "boolean") return "boolean";
  if (typeof first === "number") return "number";
  if (typeof first === "object") return "object";
  return "string";
}

function parseTargeting(
  targeting: Record<string, unknown> | undefined,
  defaultVariant: string
): FlagTargeting {
  const result: FlagTargeting = {
    rules: [],
    fractional: null,
    defaultVariant,
  };

  if (!targeting) return result;

  // Check for fractional
  if ("fractional" in targeting && Array.isArray(targeting.fractional)) {
    result.fractional = (targeting.fractional as [string, number][]).map(
      ([variant, weight]) => ({
        id: createConditionId(),
        variant,
        weight,
      })
    );
    return result;
  }

  // Parse if/then/else chain
  parseIfChain(targeting, result);

  return result;
}

function parseIfChain(
  node: Record<string, unknown>,
  result: FlagTargeting
): void {
  if (!("if" in node) || !Array.isArray(node.if)) return;

  const [condition, thenValue, elseValue] = node.if as [
    Record<string, unknown>,
    string,
    unknown
  ];

  const rule: TargetingRule = {
    id: createConditionId(),
    conditions: parseConditions(condition),
    variant: String(thenValue),
  };

  result.rules.push(rule);

  if (
    elseValue &&
    typeof elseValue === "object" &&
    !Array.isArray(elseValue) &&
    "if" in (elseValue as Record<string, unknown>)
  ) {
    parseIfChain(elseValue as Record<string, unknown>, result);
  } else if (typeof elseValue === "string") {
    result.defaultVariant = elseValue;
  }
}

function parseConditions(node: Record<string, unknown>): TargetingCondition[] {
  if ("and" in node && Array.isArray(node.and)) {
    return (node.and as Record<string, unknown>[]).flatMap(parseConditions);
  }

  for (const op of ["==", "!=", "in", "ends_with", "starts_with", "sem_ver"]) {
    if (op in node && Array.isArray(node[op])) {
      const args = node[op] as unknown[];
      const varRef = args[0] as Record<string, string>;
      const variable = varRef?.var || "";
      const value = Array.isArray(args[1])
        ? args[1].join(", ")
        : String(args[1] ?? "");

      return [
        {
          id: createConditionId(),
          variable,
          operator: op,
          value,
        },
      ];
    }
  }

  return [
    {
      id: createConditionId(),
      variable: "",
      operator: "==",
      value: JSON.stringify(node),
    },
  ];
}

export function configToFlags(config: FlagdConfig): {
  flags: FlagEntry[];
  globalMetadata: Record<string, unknown>;
  evaluators: Record<string, unknown>;
} {
  const flags: FlagEntry[] = [];

  for (const [key, def] of Object.entries(config.flags || {})) {
    const flag: FlagEntry = {
      key,
      state: def.state || "DISABLED",
      flagType: inferFlagType(def.variants || {}),
      variants: def.variants || {},
      defaultVariant: def.defaultVariant || "",
      targeting: parseTargeting(def.targeting, def.defaultVariant || ""),
      metadata: (def.metadata as Record<string, string | number | boolean>) || {},
    };
    flags.push(flag);
  }

  return {
    flags,
    globalMetadata: config.metadata || {},
    evaluators: config.$evaluators || {},
  };
}

export function downloadJson(config: FlagdConfig, filename: string): void {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
