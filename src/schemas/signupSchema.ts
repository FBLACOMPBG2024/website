import { z } from "zod";

const SignupSchema = z.object({
    firstName: z.string().min(1).max(20),
    lastName: z.string().min(1).max(20),
    email: z.string().email().min(1).max(50),
    password: z.string().min(8).max(50),
});

export default SignupSchema;
