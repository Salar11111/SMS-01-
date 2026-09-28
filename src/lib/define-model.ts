import mongoose, { Schema, model, models, type Model } from "mongoose";
import { nanoid } from "nanoid";

mongoose.set("bufferTimeoutMS", 30000);

export type VirtualRef = {
  name: string;
  ref: string;
  localField: string;
  foreignField: string;
  justOne?: boolean;
};

export function defineModel(
  name: string,
  definition: mongoose.SchemaDefinition,
  options?: {
    indexes?: { fields: Record<string, 1 | -1>; unique?: boolean }[];
    virtuals?: VirtualRef[];
  },
): Model<any> {
  if (process.env.NODE_ENV !== "production" && models[name]) {
    mongoose.deleteModel(name);
  }
  if (models[name]) return models[name] as unknown as Model<any>;

  const schema = new Schema(
    {
      _id: { type: String, default: () => nanoid() },
      ...definition,
    },
    { timestamps: true },
  );
  (schema as unknown as { set: (key: string, value: unknown) => void }).set("strictPopulate", false);
  schema.set("toJSON", { virtuals: true });
  schema.set("toObject", { virtuals: true });

  for (const virtual of options?.virtuals ?? []) {
    schema.virtual(virtual.name, {
      ref: virtual.ref,
      localField: virtual.localField,
      foreignField: virtual.foreignField,
      justOne: virtual.justOne ?? false,
    });
  }

  for (const index of options?.indexes ?? []) {
    schema.index(index.fields, index.unique ? { unique: true } : undefined);
  }

  return model(name, schema) as unknown as Model<any>;
}
