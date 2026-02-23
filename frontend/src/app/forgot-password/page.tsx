"use client";

import { useState } from "react";
import { Mail, Loader2, ArrowLeft, Dumbbell, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from "@/lib/validations";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setFieldErrors({ email: "Correo inválido" });
            return;
        }

        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            await api.post("/profiles/forgot-password", { email });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "No se pudo procesar la solicitud.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 selection:bg-rose-500/30">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/10 blur-[120px]" />
            </div>

            <main className="z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <a href="/" className="flex items-center gap-2 text-neutral-500 hover:text-rose-500 transition-all font-bold text-xs uppercase tracking-widest group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </a>
                </motion.div>

                <div className="mb-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-xl shadow-rose-600/20"
                    >
                        <Dumbbell className="h-8 w-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit uppercase">
                        Recuperar <span className="text-rose-600 text-glow">Clave</span>
                    </h1>
                    <p className="mt-2 text-neutral-400 font-medium text-sm">
                        Te enviaremos las instrucciones por mail
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[2.5rem] p-8 sm:p-12 mb-8"
                >
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                                onSubmit={handleSubmit}
                            >
                                {error && (
                                    <div className="flex items-start gap-4 rounded-2xl bg-rose-500/10 p-5 border border-rose-500/20">
                                        <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                                        <p className="text-sm font-semibold text-rose-100 leading-snug">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">
                                        Tu Correo Electrónico
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="nombre@ejemplo.com"
                                            className={cn(
                                                "input-premium pl-16",
                                                fieldErrors.email && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (fieldErrors.email) setFieldErrors({});
                                            }}
                                        />
                                    </div>
                                    {fieldErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-premium w-full py-4 tracking-widest text-xs"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                    ) : (
                                        "SOLICITAR RECUPERACIÓN"
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-6"
                            >
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-white font-outfit uppercase">¡Mail enviado!</h3>
                                <p className="mt-4 text-neutral-400 font-medium text-sm leading-relaxed">
                                    Si el correo coincide con una cuenta activa, recibirás un link para cambiar tu contraseña en unos minutos.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="text-center text-[10px] font-black text-neutral-800 tracking-[0.4em] uppercase mt-auto">
                    Gym Control © 2024
                </p>
            </main>
        </div>
    );
}
