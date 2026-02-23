"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import Modal from "./Modal";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar eliminación",
    message = "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
    isLoading = false
}: DeleteConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
            <div className="space-y-8">
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10">
                    <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Atención</p>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
