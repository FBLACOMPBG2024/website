import { z } from "zod";

const SignInSchema = z.object({
    email: z.string().email().min(1).max(50),
    password: z.string().min(8).max(50),
});

export default SignInSchema;
