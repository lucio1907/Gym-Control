"use client";

import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Dumbbell, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field-level validation
    const errors: Record<string, string> = {};
    if (!validateEmail(email)) errors.email = "Ingresá un correo válido";
    if (!validatePassword(password)) errors.password = "Mínimo 8 caracteres";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await api.post("/profiles/login", { email, password });

      if (response.data.status === "OK") {
        const role = response.data.user.credentials.role;
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Credenciales inválidas. Revisá tu mail y contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] font-sans selection:bg-rose-500/30">
      {/* Background Blobs (Static) */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-rose-600/20 blur-[150px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-rose-900/20 blur-[150px]" />
      </div>

      <main className="z-10 w-full max-w-md px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-[0_0_30px_rgba(225,29,72,0.4)]">
            <Dumbbell className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white font-outfit uppercase italic">
              GYM <span className="text-rose-600 text-glow">Control</span>
            </h1>
            <p className="mt-3 text-neutral-400 font-medium tracking-widest text-xs uppercase">
              Beyond Your Limits
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 relative group">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-4 rounded-2xl bg-rose-500/10 p-5 border border-rose-500/20">
                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                <p className="text-sm font-semibold text-rose-100 leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">
                Credenciales de Acceso
              </label>

              <div className="relative group/input">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                <input
                  type="email"
                  placeholder="hola@tuenergia.com"
                  className={cn(
                    "input-premium pl-16 text-white",
                    fieldErrors.email && "border-rose-500/50 bg-rose-500/5"
                  )}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                  }}
                />
              </div>
              {fieldErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.email}</p>}

              <div className="relative group/input pt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "input-premium pl-16 pr-12 text-white",
                    fieldErrors.password && "border-rose-500/50 bg-rose-500/5"
                  )}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[55%] -translate-y-1/2 text-neutral-600 hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between px-1">
              <a href="/forgot-password" className="text-xs font-bold text-neutral-500 hover:text-rose-500 transition-colors underline-offset-4 hover:underline">
                ¿Problemas de acceso?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full group relative overflow-hidden py-4 text-lg md:cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ENTRAR <ChevronRight className="h-5 w-5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-sm text-neutral-500 font-bold">
              ¿Sos nuevo? <a href="/register" className="text-rose-500 hover:text-rose-400 font-black">UNITE AL EQUIPO</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-[10px] font-black text-neutral-800 tracking-[0.4em] uppercase">
        GYM CONTROL SYSTEM v1.0 • 2024
      </footer>
    </div>
  );
}
