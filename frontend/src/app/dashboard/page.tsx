"use client";

import { useEffect, useState, useRef } from "react";
import { LogOut, LayoutDashboard, User, Calendar, CreditCard, Dumbbell, CheckCircle2, Loader2, AlertCircle, ChevronRight, Activity, QrCode, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";
import { Html5Qrcode } from "html5-qrcode";

export default function StudentDashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [routines, setRoutines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const SCANNER_ID = "dashboard-qr-scanner";

    const DAYS_ORDER = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

    // ... rest of sortDays and normalization functions from original (lines 19-30)
    const normalize = (s: string) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const sortDays = (daysObj: any) => {
        if (!daysObj) return [];
        return Object.keys(daysObj).sort((a, b) => {
            const indexA = DAYS_ORDER.indexOf(normalize(a));
            const indexB = DAYS_ORDER.indexOf(normalize(b));
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            // ... original fetchData (lines 33-51)
            try {
                const profileRes = await api.get("/profiles/me");
                const userData = profileRes.data.data;
                setProfile(userData);

                const routinesRes = await api.get(`/routines/profile/${userData.id}`);
                setRoutines(routinesRes.data.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push("/");
                } else {
                    setError("No pudimos sincronizar tus datos. Verificá tu conexión.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    // QR Scanning Effect
    useEffect(() => {
        if (isScanning && scanStatus === 'idle') {
            if (!window.isSecureContext && window.location.hostname !== "localhost") {
                setScanStatus('error');
                setScanMessage("Acceso denegado: La cámara requiere una conexión segura (HTTPS) para funcionar en dispositivos móviles.");
                return;
            }

            const html5QrCode = new Html5Qrcode(SCANNER_ID);
            scannerRef.current = html5QrCode;

            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                () => { }
            ).catch(err => {
                console.error("QR Error", err);
                setScanStatus('error');
                const errorMessage = err.toString().includes("Permission denied")
                    ? "Permiso de cámara denegado. Habilitá el acceso en los ajustes de tu navegador."
                    : "No se pudo acceder a la cámara. Asegurate de no estar usando otra app con la cámara.";
                setScanMessage(errorMessage);
            });

            return () => {
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().catch(e => console.error(e));
                }
            };
        }
    }, [isScanning]);

    const handleScanSuccess = async (token: string) => {
        setScanStatus('loading');
        try {
            const response = await api.post(`/attendance/check-in/QR_SCAN`, { qrToken: token });
            if (response.data.status === 'OK') {
                setScanStatus('success');
                setScanMessage('¡Asistencia registrada con éxito!');
                setTimeout(() => {
                    setIsScanning(false);
                    setScanStatus('idle');
                    window.location.reload(); // Refresh to see updated marked_days
                }, 3000);
            }
        } catch (err: any) {
            setScanStatus('error');
            setScanMessage(err.response?.data?.message || err.message || "Código inválido o expirado.");
            setTimeout(() => setScanStatus('idle'), 4000);
        }
    };

    if (isLoading) {
        // ... original loading UI (lines 54-63)
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 px-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Dumbbell className="h-12 w-12 text-rose-600" />
                </motion.div>
                <p className="text-neutral-500 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">Sincronizando Perfil...</p>
            </div>
        );
    }

    // ... original error UI (lines 65-74)
    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-16 w-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black text-white mb-2 uppercase font-outfit leading-none">Sincronización Fallida</h2>
                <p className="text-neutral-500 mb-8 max-w-xs text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-premium px-10 py-4">REINTENTAR</button>
            </div>
        );
    }

    const stats = [
        { label: "Días Registrados", value: profile?.marked_days || "0", icon: CheckCircle2, color: "text-green-500" },
        { label: "Vencimiento", value: profile?.expiration_day ? new Date(profile.expiration_day).toLocaleDateString() : "N/D", icon: Calendar, color: "text-rose-500" },
        { label: "Membresía", value: profile?.billing_state === "OK" ? "ACTIVA" : "PENDIENTE", icon: CreditCard, color: profile?.billing_state === "OK" ? "text-blue-500" : "text-amber-500" },
    ];

    return (
        <DashboardShell role="STUDENT" userName={profile?.name}>
            {/* QR Scanner Modal */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
                    >
                        <button
                            onClick={() => { setIsScanning(false); setScanStatus('idle'); }}
                            className="absolute top-8 right-8 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-rose-600 transition-colors"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <div className="max-w-md w-full text-center space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black font-outfit uppercase italic italic tracking-tighter">Escanear <span className="text-rose-600">Entrada</span></h2>
                                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Apuntá tu cámara al QR del monitor</p>
                            </div>

                            <div className="relative mx-auto w-fit">
                                <div className="absolute -inset-4 bg-rose-600/20 blur-xl rounded-full opacity-50" />
                                <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-rose-600 shadow-2xl bg-black">
                                    <div id={SCANNER_ID} className="w-full h-full object-cover" />
                                    {scanStatus === 'loading' && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                            <Loader2 className="h-12 w-12 text-rose-600 animate-spin mb-4" />
                                            <p className="text-xs font-black text-white uppercase tracking-widest">Validando...</p>
                                        </div>
                                    )}
                                    {scanStatus === 'success' && (
                                        <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center p-6 text-center">
                                            <CheckCircle2 className="h-20 w-20 text-white mb-4" />
                                            <p className="text-xl font-black text-white uppercase italic font-outfit">{scanMessage}</p>
                                        </div>
                                    )}
                                    {scanStatus === 'error' && (
                                        <div className="absolute inset-0 bg-rose-500/90 flex flex-col items-center justify-center p-6 text-center">
                                            <AlertCircle className="h-20 w-20 text-white mb-4" />
                                            <p className="text-xl font-black text-white uppercase italic font-outfit">{scanMessage}</p>
                                            <button onClick={() => setScanStatus('idle')} className="mt-4 px-6 py-2 bg-white text-rose-600 rounded-full font-black text-xs uppercase tracking-widest">REINTENTAR</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        ¡Hola, <span className="text-rose-600">{profile?.name}</span>! 👋
                    </h1>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">Es momento de romper tus límites</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* New QR Scan Button */}
                    <button
                        onClick={() => setIsScanning(true)}
                        className="btn-premium px-8 py-5 h-fit shadow-rose-600/30 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <QrCode className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            MARCAR ENTRADA
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="flex items-center gap-4 glass p-3 md:p-4 rounded-full border-white/5 pr-6 max-w-fit">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-rose-600/20 shrink-0 capitalize">
                            {profile?.name?.[0]}{profile?.lastname?.[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm font-black text-white uppercase tracking-wider truncate">{profile?.name} {profile?.lastname}</p>
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Alumno Elite</p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 group hover:border-rose-500/20 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("p-4 rounded-2xl bg-neutral-900 border border-white/5", stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-2xl md:text-3xl font-black font-outfit tracking-tighter">{stat.value}</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] leading-none whitespace-nowrap">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 sm:mt-24">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-4 italic leading-none">
                        <span className="h-8 w-1 bg-rose-600 rounded-full shrink-0" />
                        Tu Plan de Batalla
                    </h2>
                    <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 shrink-0">Ver historial</button>
                </div>

                <AnimatePresence mode="wait">
                    {(() => {
                        const activeRoutine = routines.find((r: any) => r.is_active == true || r.is_active === 1 || r.is_active === "true");
                        const days = activeRoutine?.routine_content?.days || {};
                        const dayNames = sortDays(days);

                        // Default to first day if none selected
                        const currentDay = dayNames[0];

                        if (dayNames.length > 0) {
                            return (
                                <div className="space-y-12">
                                    {/* Day Switcher */}
                                    <div className="flex flex-wrap gap-3">
                                        {dayNames.map((day) => (
                                            <button
                                                key={day}
                                                className={cn(
                                                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20"
                                                    // In a real expanded version, we'd have a local state for student's selected day
                                                )}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Loop through all days to show sections (or could be tabs) */}
                                    {dayNames.map((day) => (
                                        <div key={day} className="space-y-8">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xl font-black font-outfit uppercase italic tracking-tighter text-white/40">{day}</h3>
                                                <div className="h-px bg-white/5 flex-grow" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                                                {days[day].map((exercise: any, idx: number) => (
                                                    <motion.div
                                                        key={`${day}-${idx}`}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="glass rounded-[2rem] p-8 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group"
                                                    >
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                            <Dumbbell className="h-16 w-16" />
                                                        </div>
                                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                                            <div className="min-w-0 pr-4">
                                                                <h3 className="text-lg md:text-xl font-black text-rose-600 uppercase italic tracking-tighter leading-none truncate">{exercise.name}</h3>
                                                                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-3 whitespace-nowrap">Objetivo Sesión</p>
                                                            </div>
                                                            <div className="text-[10px] font-black px-4 py-2 bg-rose-600/10 border border-rose-600/20 rounded-xl text-rose-500 tracking-widest shrink-0">
                                                                {exercise.sets} X {exercise.reps}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4 text-[10px] relative z-10">
                                                            <div className="space-y-1">
                                                                <p className="text-neutral-500 font-black uppercase tracking-widest">Carga / Notas</p>
                                                                <p className="text-white font-black text-base md:text-lg font-outfit leading-none">{exercise.weight || '--'}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card rounded-[3rem] p-12 md:p-20 border-white/5 flex flex-col items-center justify-center text-center w-full"
                            >
                                <div className="p-8 rounded-full bg-neutral-900 border border-white/5 mb-8 shadow-2xl shadow-black ring-1 ring-white/5">
                                    <Dumbbell className="h-10 w-10 md:h-16 md:w-16 text-neutral-800" />
                                </div>
                                <h3 className="text-lg md:text-2xl font-black text-white font-outfit uppercase italic tracking-tight leading-none">Sin misiones asignadas</h3>
                                <p className="text-neutral-500 max-w-sm mt-4 font-medium leading-relaxed text-sm">Aún no se te han asignado rutinas. Consultá con tu instructor.</p>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>
        </DashboardShell>
    );
}
