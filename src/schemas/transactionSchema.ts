import { z } from "zod";

const TransactionSchema = z.object({
  _id: z.string().min(24, "Invalid ObjectId").optional(), // ObjectId string length should be 24
  value: z.number(),
  tags: z.array(z.string()),
  name: z.string(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export default TransactionSchema;
