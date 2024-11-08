import { z } from "zod";

const TransactionSchema = z.object({
    _id: z.string().min(24, "Invalid ObjectId").optional(), // ObjectId string length should be 24
    value: z.number().optional(),  // Optional field for value
    tags: z.array(z.string()).optional(),  // Optional field for tags
    name: z.string().optional(),  // Optional field for name
    description: z.string().optional(),  // Optional field for description
});

export default TransactionSchema;