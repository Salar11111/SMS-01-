import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";

export function validateRequest<T>(schema: ZodType<T>) {
  return async (request: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            issues: result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          },
          { status: 400 }
        );
      }

      return { data: result.data };
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
  };
}

export function withValidation<T>(
  schema: ZodType<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateRequest(schema)(request);

    if (validation instanceof NextResponse) {
      return validation;
    }

    return handler(request, validation.data);
  };
}

export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function createApiError(message: string, status = 400, issues?: unknown[]) {
  return NextResponse.json(
    { error: message, issues },
    { status }
  );
}
