import { z } from "zod";
import TransactionSchema from "./transactionSchema";
import GoalSchema from "./goalSchema";

const UserSchema = z.object({
  _id: z.object({ $oid: z.string() }), // MongoDB ObjectId
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  createdAt: z.string().default(() => new Date().toString()), // Default to current date
  emailVerified: z.boolean().default(false), // Default to false
  balance: z.number().default(0), // Default to 0
  preferences: z
    .object({
      theme: z.enum(["dark", "light", "system"]).default("system"), // Default theme
      accountId: z.string().optional(),
    })
    .optional(),
  transactions: z.array(TransactionSchema).default([]), // Default empty array
  goals: z.array(GoalSchema).default([]), // Default empty array
});

// Infer TypeScript type
export type User = z.infer<typeof UserSchema>;

export default UserSchema;
