"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Search, Filter, Loader2, DollarSign, ArrowUpRight, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ManualPaymentModal from "@/components/ManualPaymentModal";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [metrics, setMetrics] = useState({
        totalIncome: 0,
        thisMonth: 0,
        pending: 0
    });

    const fetchPayments = async () => {
        try {
            const res = await api.get("/payments/history");
            const data = res.data.data || [];
            setPayments(data);

            // Calculate quick metrics
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            let income = 0;
            let currentMonthIncome = 0;

            data.forEach((p: any) => {
                if (p.status === "completed") {
                    const amount = Number(p.amount);
                    income += amount;

                    const pDate = new Date(p.payment_date);
                    if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                        currentMonthIncome += amount;
                    }
                }
            });

            // Pending could be derived from students table in a real scenario
            // Here we'll just check if there are failed/pending payments in the registry
            const pendingCount = data.filter((p: any) => p.status !== "completed").length;

            setMetrics({
                totalIncome: income,
                thisMonth: currentMonthIncome,
                pending: pendingCount
            });

        } catch (err) {
            console.error("Error fetching payments", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p => {
        const searchTerm = search.toLowerCase();
        const profileName = p.profile?.name?.toLowerCase() || "";
        const profileLastname = p.profile?.lastname?.toLowerCase() || "";
        const profileDni = p.profile?.dni || "";
        const concept = p.concept?.toLowerCase() || "";

        return profileName.includes(searchTerm) ||
            profileLastname.includes(searchTerm) ||
            profileDni.includes(searchTerm) ||
            concept.includes(searchTerm);
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <DashboardShell role="ADMIN">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Historial de <span className="text-rose-600">Pagos</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                        Registro financiero y facturación
                    </p>
                </div>

                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="btn-premium px-8 py-4 text-[10px] tracking-[0.2em] flex items-center gap-4 shrink-0"
                >
                    <DollarSign className="h-5 w-5" />
                    NUEVO COBRO
                </button>
            </motion.header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <ArrowUpRight className="h-24 w-24 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-4">Ingresos Totales</p>
                        <h3 className="text-4xl font-black font-outfit tracking-tighter mb-2">{formatCurrency(metrics.totalIncome)}</h3>
                        <p className="text-xs text-neutral-400 font-medium">Histórico acumulado</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <DollarSign className="h-24 w-24 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-4">Este Mes</p>
                        <h3 className="text-4xl font-black font-outfit tracking-tighter mb-2 text-rose-500">{formatCurrency(metrics.thisMonth)}</h3>
                        <p className="text-xs text-neutral-400 font-medium">Recaudación actual</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <AlertTriangle className="h-24 w-24 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-4">Pagos Fallidos</p>
                        <h3 className="text-4xl font-black font-outfit tracking-tighter mb-2">{metrics.pending}</h3>
                        <p className="text-xs text-neutral-400 font-medium">Transacciones incompletas</p>
                    </div>
                </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por alumno, DNI o concepto..."
                        className="input-premium pl-16 py-4 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-white/5">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="border-b border-white/5 bg-white/[0.02]">
                            <tr className="font-outfit text-white uppercase tracking-widest text-[9px] md:text-[10px]">
                                <th className="px-8 py-8 font-black">Fecha</th>
                                <th className="px-6 py-8 font-black">Alumno</th>
                                <th className="px-6 py-8 font-black">DNI</th>
                                <th className="px-6 py-8 font-black">Concepto</th>
                                <th className="px-6 py-8 font-black">Monto</th>
                                <th className="px-8 py-8 text-right font-black">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <Loader2 className="h-10 w-10 text-rose-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((payment, idx) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <p className="font-medium text-sm text-neutral-300">
                                                {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: es })}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {format(new Date(payment.payment_date), "HH:mm")} hs
                                            </p>
                                        </td>
                                        <td className="px-6 py-6 font-medium text-sm text-white">
                                            {payment.profile ? `${payment.profile.name} ${payment.profile.lastname}` : "Desconocido"}
                                        </td>
                                        <td className="px-6 py-6 font-mono text-xs tracking-wider text-neutral-400">
                                            {payment.profile?.dni || "-"}
                                        </td>
                                        <td className="px-6 py-6 text-sm text-neutral-300">
                                            <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-[11px] font-black uppercase tracking-widest">
                                                {payment.concept}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-outfit font-black text-rose-500 text-base">
                                            {formatCurrency(Number(payment.amount))}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {payment.status === "completed" ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Completado
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {payment.status}
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-white/5 mb-6 text-neutral-500">
                                            <Search className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-black font-outfit uppercase tracking-tighter mb-2">No hay pagos registrados</h3>
                                        <p className="text-sm text-neutral-500 font-medium">Aún no hay transacciones o ningún pago cumple con tu búsqueda.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ManualPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    fetchPayments(); // Refresh list after payment
                }}
            />
        </DashboardShell>
    );
}
