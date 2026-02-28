import { email, z } from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(2, 'The name is short, min 2 characters').max(50),
    lastname: z.string().min(2, 'The lastname is short, min 2 characters').max(50),
    email: z.email("Invalid email"),
    password: z.string().min(8, 'Password must be up to 8 characters'),
    phone: z.string().min(8, 'Invalid phone number'),
    dni: z.string().min(7, 'Invalid DNI').max(9),
    rol: z.enum(["admin", "user", "teacher"]).optional()
});

export const LoginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required')
});

export const ForgotPasswordSchema = z.object({
    email: z.email("Invalid email")
})

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters.")
})

export type RegisterType = z.infer<typeof RegisterSchema>;
export type LoginType = z.infer<typeof LoginSchema>;
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>