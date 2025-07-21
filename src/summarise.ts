import { readFileSync } from "node:fs";
import { z, ZodError } from "zod";

const terraformPlanSchema = z.looseObject({
  resource_changes: z
    .array(
      z.looseObject({
        address: z.string(),
        change: z.looseObject({
          actions: z.array(z.enum(["no-op", "create", "read", "update", "delete"])),
        }),
      }),
    )
    .optional(),
});

type TerraformPlan = z.infer<typeof terraformPlanSchema>;
type TerraformPlanActions = NonNullable<TerraformPlan["resource_changes"]>[number]["change"]["actions"];

type ResourceChanges = {
  create?: string[];
  update?: string[];
  delete?: string[];
  replace?: string[];
};

export function summarise(filename: string): string {
  const resourceChanges = extractPlanChanges(readTerraformPlan(filename));

  const hasChanges = Object.values(resourceChanges).some((resources) => resources.length > 0);

  const summaryLine = Object.entries(resourceChanges)
    .filter(([, resources]) => resources.length > 0)
    .map(([action, resources]) => `${resources.length} to ${action}`)
    .join(", ");

  const detailsSection = Object.entries(resourceChanges)
    .filter(([, resources]) => resources.length > 0)
    .map(([action, resources]) => `### Resources to ${action}:\n    ${resources.join("\n    ")}\n`)
    .join("\n");

  const planSummary = hasChanges
    ? `**Terraform plan: ${summaryLine}**\n${detailsSection}`
    : "**No infrastructure changes in this plan.**";

  return `## Summary of ${filename}\n${planSummary}`;
}

function readTerraformPlan(filename: string) {
  try {
    return terraformPlanSchema.parse(JSON.parse(readFileSync(filename, { encoding: "utf-8" })));
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("The file does not contain valid JSON data.");
    } else if (e instanceof ZodError) {
      const issues = e.issues.map((issue) => `${issue.path.join(".")} - ${issue.message}`);

      throw new Error(`The file is not a valid Terraform plan file:\n${issues.join("\n")}`);
    }

    throw e;
  }
}

function extractPlanChanges(data: TerraformPlan): ResourceChanges {
  if (!Array.isArray(data.resource_changes) || data.resource_changes.length === 0) return {};

  return data.resource_changes.reduce<ResourceChanges>((changes, resource) => {
    const address = resource.address;
    const action = mapChangeAction(resource.change.actions);

    if (action === undefined) return changes;

    return {
      ...changes,
      [action]: [...(changes[action] || []), address],
    };
  }, {});
}

function mapChangeAction(terraformActions: TerraformPlanActions): keyof ResourceChanges | undefined {
  // Handle replacements, which are represented as "create" and "delete" in any order
  if (terraformActions.toSorted().join("|") === "create|delete") return "replace";

  const primaryAction = terraformActions.at(0);

  // Skip actions that don't represent change
  if (primaryAction === "no-op" || primaryAction === "read") return undefined;

  return primaryAction;
}
