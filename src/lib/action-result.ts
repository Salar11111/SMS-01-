export type ActionState = { error?: string; ok?: boolean } | null;

export function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

export function actionError(error: unknown, duplicateMessage = "That record already exists."): ActionState {
  if (isDuplicateKey(error)) return { error: duplicateMessage };
  if (error instanceof Error && error.message) return { error: error.message };
  return { error: "Something went wrong." };
}
