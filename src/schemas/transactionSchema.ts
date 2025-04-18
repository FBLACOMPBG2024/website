import { ObjectId } from "mongodb";
import { z } from "zod";

const TransactionSchema = z.object({
  _id: z
    .instanceof(ObjectId)
    .optional()
    .default(() => new ObjectId()), // Default to a new ObjectId
  value: z.number(),
  tags: z.array(z.string()).default([]), // Default to an empty array
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  date: z
    .string()
    .optional()
    .default(() => new Date().toISOString()) // Default to current date
    .refine((date) => !date || !isNaN(new Date(date).getMilliseconds()), {
      message: "Invalid date format",
    }), // Ensure date is valid if provided
  imported: z.boolean().default(false),
});

// Infer TypeScript type
export type Transaction = z.infer<typeof TransactionSchema>;

// Export the schema
export default TransactionSchema;
