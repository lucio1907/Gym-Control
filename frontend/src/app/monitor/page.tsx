"use client";

import { useState, useEffect, useRef } from "react";
import {
    CheckCircle2,
    XCircle,
    Dumbbell,
    Loader2,
    Clock,
    QrCode,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

export default function MonitorPage() {
    const [dni, setDni] = useState("");
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [qrError, setQrError] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string | null>(null);
    const [studentInfo, setStudentInfo] = useState<{ name: string, lastname: string, marked_days: number } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const inputRef = useRef<HTMLInputElement>(null);

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Persistent focus logic for physical keypad
    useEffect(() => {
        const focusInput = () => {
            if (status === "idle" && inputRef.current) {
                inputRef.current.focus();
            }
        };

        // Initial focus
        focusInput();

        // Re-focus interval (safety)
        const interval = setInterval(focusInput, 1000);

        // Focus on click anywhere
        const handleClick = () => focusInput();
        document.addEventListener("click", handleClick);

        return () => {
            clearInterval(interval);
            document.removeEventListener("click", handleClick);
        };
    }, [status]);

    // Entrance QR Refresh logic
    useEffect(() => {
        const fetchQR = async () => {
            try {
                setQrError(false);
                const response = await api.get("/qrs/entrance-qr");
                if (response.data.status === "OK") {
                    setQrToken(response.data.token);
                } else {
                    setQrError(true);
                }
            } catch (err) {
                console.error("Error fetching entrance QR:", err);
                setQrError(true);
            }
        };

        fetchQR();
        const interval = setInterval(fetchQR, 60000); // 1 minute refresh
        return () => clearInterval(interval);
    }, []);

    // Real-time listener for QR scans done from mobile
    useEffect(() => {
        const attendanceChannel = supabase
            .channel('public:attendance_monitor')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'attendance' },
                async (payload) => {
                    const newEntry = payload.new as any;

                    // If a student scanned the monitor's QR or a temporal QR from mobile
                    if (newEntry.method === 'QR_SCAN') {
                        try {
                            const res = await api.get(`/attendance/monitor-profile/${newEntry.profile_id}`);
                            if (res.data.status === "OK") {
                                setStudentInfo(res.data.data);
                                setStatus("success");
                                setMessage("¡Bienvenido!");

                                setTimeout(() => {
                                    setStatus("idle");
                                }, 4000);
                            }
                        } catch (err) {
                            console.error("Error fetching student info for monitor:", err);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(attendanceChannel);
        };
    }, []);

    const handleCheckIn = async (dniValue: string) => {
        if (status !== "idle" || !dniValue) return;

        setStatus("loading");
        setMessage(null);
        setStudentInfo(null);

        try {
            const response = await api.post("/attendance/monitor-check-in", { dni: dniValue, method: "DNI" });

            if (response.data.status === "OK") {
                setStatus("success");
                setStudentInfo(response.data.data.profile);
                setMessage("¡Bienvenido!");

                setTimeout(() => {
                    setStatus("idle");
                    setDni("");
                }, 4000);
            }
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.message || err.message || "Error al procesar el ingreso");

            setTimeout(() => {
                setStatus("idle");
                setDni("");
            }, 4000);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCheckIn(dni);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-rose-500/30 overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-rose-600/20 blur-[150px]" />
                <div className="absolute -bottom-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-rose-900/20 blur-[150px]" />
            </div>

            {/* Header */}
            <header className="z-10 bg-black/40 backdrop-blur-md border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-2 rounded-xl shadow-lg shadow-rose-600/20">
                        <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic font-outfit leading-none">
                            GYM <span className="text-rose-600">CONTROL</span>
                        </h1>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1">Terminal de Acceso</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest">{currentTime.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                        <p className="text-xl font-black font-outfit tracking-tight">{currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <Clock className="h-6 w-6 text-neutral-600" />
                </div>
            </header>

            {/* Main Content: Split Screen */}
            <main className="flex-1 z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 relative">

                {/* Full Screen Overlays */}
                <AnimatePresence>
                    {status !== "idle" && status !== "loading" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-3xl px-6 text-center",
                                status === "success" ? "bg-black/90" : "bg-black/95"
                            )}
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className={cn(
                                    "mb-8 p-10 rounded-full border shadow-2xl",
                                    status === "success"
                                        ? "bg-green-500/10 border-green-500/50 text-green-500"
                                        : "bg-rose-500/10 border-rose-500/50 text-rose-500"
                                )}
                            >
                                {status === "success" ? <CheckCircle2 className="h-40 w-40" /> : <XCircle className="h-40 w-40" />}
                            </motion.div>

                            <h2 className={cn(
                                "text-6xl md:text-8xl font-black uppercase italic font-outfit tracking-tighter mb-6",
                                status === "success" ? "text-green-500 text-glow" : "text-rose-500"
                            )}>
                                {status === "success" ? "¡Bienvenido!" : "Acceso Denegado"}
                            </h2>

                            {status === "success" && studentInfo && (
                                <div className="space-y-4">
                                    <p className="text-4xl font-black text-white uppercase italic tracking-tight">{studentInfo.name} {studentInfo.lastname}</p>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 inline-flex items-center gap-4">
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Asistencias del mes</span>
                                        <span className="text-4xl font-black text-green-500 font-outfit leading-none">{studentInfo.marked_days}</span>
                                    </div>
                                </div>
                            )}

                            {status === "error" && (
                                <p className="text-2xl font-bold text-neutral-300 max-w-lg">{message}</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LEFT: QR Display Area */}
                <section className="flex flex-col items-center justify-center p-12 lg:border-r border-white/5 bg-white/[0.01]">
                    <div className="max-w-md w-full space-y-12 text-center">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black uppercase italic font-outfit tracking-tighter">Acceso <span className="text-rose-600 text-glow-rose">QR</span></h3>
                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Escaneá para ingresar desde tu celular</p>
                        </div>

                        <div className="relative group mx-auto w-fit">
                            <div className="absolute -inset-8 bg-rose-600/20 blur-3xl rounded-full opacity-40 animate-pulse" />
                            <div className="relative p-6 glass-card rounded-[3rem] border-white/10 bg-white shadow-2xl overflow-hidden min-w-[320px] min-h-[320px] flex items-center justify-center">
                                {qrToken ? (
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrToken}&color=050505&bgcolor=ffffff&margin=10`}
                                        alt="Monitor QR"
                                        className="w-[280px] h-[280px] object-contain rounded-2xl"
                                    />
                                ) : qrError ? (
                                    <div className="flex flex-col items-center gap-4 text-neutral-400">
                                        <AlertCircle className="h-12 w-12 text-rose-500" />
                                        <p className="text-xs font-black uppercase tracking-widest">Error al cargar QR</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="text-[10px] underline font-bold"
                                        >
                                            REINTENTAR
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-12 w-12 text-rose-600 animate-spin" />
                                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">Generando QR...</p>
                                    </div>
                                )}

                                {/* Corner Decoration */}
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-rose-600 rounded-tl-[3rem]" />
                                <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-rose-600 rounded-tr-[3rem]" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-rose-600 rounded-bl-[3rem]" />
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-rose-600 rounded-br-[3rem]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-neutral-600">
                            <QrCode className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">CÓDIGO DINÁMICO • SE ACTUALIZA SOLO</span>
                        </div>
                    </div>
                </section>

                {/* RIGHT: DNI Input Area (Physical Keypad optimized) */}
                <section className="flex flex-col items-center justify-center p-12 bg-black/40">
                    <div className="max-w-md w-full space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black uppercase italic font-outfit tracking-tighter flex items-center gap-4 justify-center">
                                <div className="h-10 w-1 bg-rose-600 rounded-full" />
                                Manual por DNI
                            </h3>
                            <p className="text-center text-neutral-500 font-bold uppercase tracking-widest text-xs">Escribí tu DNI y presioná ENTER</p>
                        </div>

                        {/* DNI Input */}
                        <div className="space-y-8">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-rose-600/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    autoFocus
                                    placeholder="DNI"
                                    className="w-full h-32 bg-white/[0.02] border-4 border-white/5 rounded-[2.5rem] text-center text-6xl font-black font-outfit tracking-tighter text-white placeholder:text-neutral-800 focus:border-rose-600 focus:bg-rose-600/5 transition-all outline-none shadow-2xl"
                                />
                            </div>

                            <div className="flex flex-col gap-6">
                                <button
                                    disabled={dni.length < 6 || status === "loading"}
                                    onClick={() => handleCheckIn(dni)}
                                    className={cn(
                                        "btn-premium w-full py-8 text-2xl shadow-2xl uppercase italic font-black",
                                        (dni.length < 6 || status === "loading") && "opacity-50 grayscale pointer-events-none"
                                    )}
                                >
                                    {status === "loading" ? <Loader2 className="h-8 w-8 animate-spin" /> : "Confirmar Ingreso"}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-neutral-600">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Listo para recibir teclado físico</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="z-10 px-12 py-6 text-center border-t border-white/5 bg-black/40">
                <p className="text-[9px] font-black text-neutral-800 tracking-[0.5em] uppercase">
                    Gym Control System • Acceso Terminal v3.2 • {currentTime.getFullYear()}
                </p>
            </footer>
        </div>
    );
}
