import { z } from "zod";

const TransactionSchema = z.object({
  _id: z
    .string()
    .length(24, "Invalid ObjectId") // ObjectId string length is 24
    .optional(),
  value: z.number(),
  tags: z.array(z.string()).default([]), // Default to an empty array
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z
    .string()
    .optional()
    .default(() => new Date().toISOString()) // Default to current date
    .refine((date) => !date || !isNaN(new Date(date).getMilliseconds()), {
      message: "Invalid date format",
    }), // Ensure date is valid if provided
  imported: z.boolean().optional(),
});

// Infer TypeScript type
export type Transaction = z.infer<typeof TransactionSchema>;

// Export the schema
export default TransactionSchema;
