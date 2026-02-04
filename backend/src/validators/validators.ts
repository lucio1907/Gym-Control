import { z } from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(2, 'The name is short, min 2 characters').max(50),
    lastname: z.string().min(2, 'The lastname is short, min 2 characters').max(50),
    email: z.email("Invalid email"),
    password: z.string().min(8, 'Password must be up to 8 characters'),
    phone: z.string().min(8, 'Invalid phone number'),
    dni: z.string().min(7, 'Invalid DNI').max(9)
});

export const LoginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required')
});

export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;