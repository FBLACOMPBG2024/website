import { z } from "zod";
import TransactionSchema from "./transactionSchema";

const UserSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  emailVerified: z.boolean(),
  balance: z.number(),
  preferences: z
    .object({
      theme: z.enum(["dark", "light", "system"]).optional(),
    })
    .optional(),
  transactions: z.array(TransactionSchema),
});

export default UserSchema;
