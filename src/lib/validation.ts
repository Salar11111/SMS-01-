import type { ZodType } from "zod";

export function parseFormData<T>(schema: ZodType<T>, input: Record<string, unknown>): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input");
  }
  return result.data;
}

export function formDataToObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData);
}
