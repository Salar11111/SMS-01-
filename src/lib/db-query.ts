const PARAM_KEYS = new Set(["where", "orderBy", "select", "populate", "include"]);

const RELATIONS = new Set([
  "user",
  "studentProfile",
  "teacherProfile",
  "classSubjects",
  "academicYear",
  "enrollments",
  "attendance",
  "grades",
  "class",
  "subject",
  "teacher",
  "student",
  "assignment",
  "parent",
]);

export type QueryArgs = {
  where: Record<string, unknown>;
  orderBy?: unknown;
  select?: unknown;
  populate?: unknown;
};

export type PopulateSpec = {
  path: string;
  match?: Record<string, unknown>;
  select?: string;
  populate?: PopulateSpec[];
};

export type OrderStep = { path: string[]; dir: 1 | -1 };

export function unwrapArgs(input: unknown): QueryArgs {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { where: {} };
  }
  const obj = input as Record<string, unknown>;
  const isParams = Object.keys(obj).some((key) => PARAM_KEYS.has(key));
  if (!isParams) return { where: obj };
  return {
    where: (obj.where as Record<string, unknown> | undefined) ?? {},
    orderBy: obj.orderBy,
    select: obj.select,
    populate: obj.populate ?? obj.include,
  };
}

export function normalizeWhere(where: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!where) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(where)) {
    const field = key === "id" ? "_id" : key;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const inner = value as Record<string, unknown>;
      if ("in" in inner) {
        out[field] = { $in: inner.in };
        continue;
      }
    }
    out[field] = value;
  }
  return out;
}

export function selectFields(select: unknown): string | null {
  if (!select) return null;
  if (Array.isArray(select)) {
    return select.map((field) => (field === "id" ? "_id" : String(field))).join(" ");
  }
  if (typeof select === "object") {
    return Object.entries(select as Record<string, unknown>)
      .filter(([, enabled]) => enabled === true)
      .map(([field]) => (field === "id" ? "_id" : field))
      .join(" ");
  }
  return null;
}

function isFieldSelect(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => value[key] === true && !RELATIONS.has(key));
}

export function buildPopulate(populate: unknown): PopulateSpec[] {
  if (!populate || typeof populate !== "object" || Array.isArray(populate)) return [];
  const result: PopulateSpec[] = [];
  for (const [key, value] of Object.entries(populate as Record<string, unknown>)) {
    if (key === "_count") continue;
    if (value === true) {
      result.push({ path: key });
      continue;
    }
    if (typeof value === "string") {
      result.push({ path: key, select: value });
      continue;
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const record = value as Record<string, unknown>;
    const match =
      record.where && typeof record.where === "object"
        ? normalizeWhere(record.where as Record<string, unknown>)
        : undefined;
    const rest: Record<string, unknown> = {};
    for (const [child, childValue] of Object.entries(record)) {
      if (child === "where" || child === "select") continue;
      rest[child] = childValue;
    }
    const spec: PopulateSpec = { path: key };
    if (match) spec.match = match;
    if (isFieldSelect(rest)) {
      const fields = selectFields(rest);
      if (fields) spec.select = fields;
    } else {
      const nested = buildPopulate(rest);
      if (nested.length > 0) spec.populate = nested;
    }
    result.push(spec);
  }
  return result;
}

export function mongoSort(orderBy: unknown): Record<string, 1 | -1> | null {
  if (orderBy == null) return null;
  const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
  const sort: Record<string, 1 | -1> = {};
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") return null;
    for (const [key, value] of Object.entries(entry as Record<string, unknown>)) {
      if (value !== "asc" && value !== "desc") return null;
      sort[key === "id" ? "_id" : key] = value === "asc" ? 1 : -1;
    }
  }
  return sort;
}

function walkOrder(node: Record<string, unknown>, prefix: string[], steps: OrderStep[]) {
  for (const [key, value] of Object.entries(node)) {
    if (value === "asc" || value === "desc") {
      steps.push({ path: [...prefix, key], dir: value === "asc" ? 1 : -1 });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      walkOrder(value as Record<string, unknown>, [...prefix, key], steps);
    }
  }
}

export function orderSteps(orderBy: unknown): OrderStep[] {
  if (orderBy == null) return [];
  const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
  const steps: OrderStep[] = [];
  for (const entry of entries) {
    if (entry && typeof entry === "object") walkOrder(entry as Record<string, unknown>, [], steps);
  }
  return steps;
}

function readPath(value: unknown, path: string[]): unknown {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right));
}

export function sortInMemory<T>(rows: T[], orderBy: unknown): T[] {
  const steps = orderSteps(orderBy);
  if (steps.length === 0) return rows;
  return [...rows].sort((left, right) => {
    for (const step of steps) {
      const diff = compareValues(readPath(left, step.path), readPath(right, step.path)) * step.dir;
      if (diff !== 0) return diff;
    }
    return 0;
  });
}

export function present<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) present(item);
    return value;
  }
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  const obj = value as Record<string, unknown>;
  if (obj._id != null && obj.id == null) obj.id = obj._id;
  for (const key of Object.keys(obj)) {
    if (key === "_id") continue;
    present(obj[key]);
  }
  return value;
}

export function collectClassDocs(value: unknown, found: Record<string, unknown>[] = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectClassDocs(item, found);
    return found;
  }
  if (!value || typeof value !== "object" || value instanceof Date) return found;
  const obj = value as Record<string, unknown>;
  if (typeof obj.section === "string" && typeof obj.academicYearId === "string" && (obj.id != null || obj._id != null)) {
    found.push(obj);
  }
  for (const [key, child] of Object.entries(obj)) {
    if (key === "_id" || key === "id") continue;
    collectClassDocs(child, found);
  }
  return found;
}

export function mapGroupRows(rows: { _id: Record<string, unknown>; count: number }[]): Array<Record<string, unknown> & { count: number }> {
  return rows.map((row) => ({ ...row._id, count: row.count }));
}

export function attemptsIncrement(by = 1) {
  return { $inc: { attempts: by } };
}
