import { z } from "zod";

const GoalSchema = z.object({
  _id: z
    .string()
    .length(24, "Invalid ObjectId") // ObjectId string length is 24
    .optional(),
  value: z.number().int().positive("Value must be a positive number"),
  targetDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }), // Ensure date is valid if provided
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500).optional(),
});

// Infer the TypeScript type from the schema
type Goal = z.infer<typeof GoalSchema>;

// Export the schema and the type
export type { Goal };

export default GoalSchema;
