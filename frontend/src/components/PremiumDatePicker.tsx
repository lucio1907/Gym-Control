"use client";

import { useState, useRef, useEffect } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    isToday,
    parseISO,
    isValid
} from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    label?: string;
}

export default function PremiumDatePicker({ value, onChange, label }: PremiumDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse the current value, fallback to today if invalid
    const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : new Date();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <button
                    onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                    className="p-1.5 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-all"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-black uppercase italic tracking-widest text-white">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                    className="p-1.5 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-all"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["D", "L", "M", "M", "J", "V", "S"];
        return (
            <div className="grid grid-cols-7 mb-2 px-2">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-[9px] font-black uppercase text-neutral-600 py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isCurrentDay = isToday(day);

                const isFuture = day > new Date();

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "relative h-10 w-10 flex items-center justify-center cursor-pointer group transition-all duration-300",
                            !isCurrentMonth && "opacity-20 pointer-events-none",
                            isFuture && "opacity-10 cursor-not-allowed pointer-events-none"
                        )}
                        onClick={(e) => {
                            if (isFuture) return;
                            e.stopPropagation();
                            onChange(format(cloneDay, "yyyy-MM-dd"));
                            setIsOpen(false);
                        }}
                    >
                        {/* Selected Indicator */}
                        {isSelected && (
                            <motion.div
                                layoutId="selected-day"
                                className="absolute inset-1 bg-rose-600 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}

                        {/* Today Indicator (Subtle) */}
                        {isCurrentDay && !isSelected && (
                            <div className="absolute inset-1 border border-rose-500/30 rounded-xl" />
                        )}

                        <span className={cn(
                            "relative z-10 text-[10px] font-bold transition-colors",
                            isSelected ? "text-white font-black" : "text-neutral-400 group-hover:text-white",
                            isCurrentDay && !isSelected && "text-rose-400"
                        )}>
                            {formattedDate}
                        </span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 px-2" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="pb-2">{rows}</div>;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="glass p-4 rounded-3xl border border-white/5 flex items-center gap-4 cursor-pointer group hover:border-rose-500/30 transition-all min-w-[200px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col gap-1 w-full">
                    {label && (
                        <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest italic flex items-center gap-2 cursor-pointer group-hover:text-rose-400 transition-colors">
                            <CalendarIcon className="h-3 w-3" />
                            {label}
                        </label>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-white font-black italic uppercase text-xs">
                            {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })}
                        </span>
                        <ChevronLeft className={cn("h-3 w-3 text-neutral-500 transition-transform duration-300 -rotate-90", isOpen && "rotate-90")} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="absolute top-full mt-4 right-0 z-[100] bg-neutral-950/95 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden min-w-[320px]"
                    >
                        {renderHeader()}
                        <div className="p-2">
                            {renderDays()}
                            {renderCells()}
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange(format(new Date(), "yyyy-MM-dd")); setIsOpen(false); }}
                                className="text-[9px] font-black uppercase italic text-rose-500 hover:text-white transition-colors"
                            >
                                Hoy
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="text-[9px] font-black uppercase italic text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
