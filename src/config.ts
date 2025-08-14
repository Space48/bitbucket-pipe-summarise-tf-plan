export const TEMPLATE_KEYWORD = "{{PLAN_SUMMARY}}";

export function getConfig() {
  return {
    input: getRequiredValue("INPUT_FILES"),
    output: getRequiredValue("OUTPUT_FILE"),
    template: getOptionalValue("TEMPLATE", TEMPLATE_KEYWORD),
  };
}

export function getRequiredValue(key: string, errorMessage?: string): string {
  const value = process.env[key];

  if (!value) throw new Error(errorMessage ?? `Missing required configuration variable: ${key}`);

  return value;
}

export function getOptionalValue(key: string): string | undefined;
export function getOptionalValue(key: string, defaultValue: string): string;
export function getOptionalValue(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key];

  return value ?? defaultValue;
}
