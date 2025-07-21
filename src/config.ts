export function getConfig() {
  return {
    input: getRequiredValue("INPUT_FILES"),
    output: getRequiredValue("OUTPUT_FILE"),
  };
}

export function getRequiredValue(key: string, errorMessage?: string): string {
  const value = process.env[key];

  if (!value) throw new Error(errorMessage ?? `Missing required configuration variable: ${key}`);

  return value;
}
