import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, GraduationCap, Pencil, Sparkles, ArrowLeft } from "lucide-react";

function DecorIcon({ children, className }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute text-primary/30 ${className}`}
        >
            {children}
        </div>
    );
}

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden bg-fourth">
            <div aria-hidden="true" className="absolute inset-0 bg-primary/5" />

            <DecorIcon className="-top-6 left-6 rotate-12">
                <Pencil size={28} />
            </DecorIcon>
            <DecorIcon className="top-10 right-8 -rotate-12">
                <BookOpen size={30} />
            </DecorIcon>
            <DecorIcon className="top-28 left-10 rotate-6">
                <Sparkles size={26} />
            </DecorIcon>
            <DecorIcon className="bottom-24 left-8 -rotate-6">
                <Bookmark size={28} />
            </DecorIcon>
            <DecorIcon className="bottom-20 right-10 rotate-6">
                <GraduationCap size={32} />
            </DecorIcon>

            <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Error 404
                </div>

                {/* EFEK 3D BORDER TEXT 404 */}
                <div className="relative mt-8 flex items-center justify-center">
                    <div className="relative inline-flex">
                        
                        {/* LAYER 1: Bayangan 3D (Paling Belakang) */}
                        <div
                            className="absolute top-2 left-2 sm:top-3 sm:left-3 font-black tracking-tighter leading-none text-black/30 text-[clamp(6rem,22vw,16rem)] flex select-none"
                            style={{ WebkitTextStroke: "clamp(12px, 3vw, 28px) currentColor" }}
                            aria-hidden="true"
                        >
                            <span>4</span><span>0</span><span>4</span>
                        </div>

                        {/* LAYER 2: Border Outline Tebal Warna Primary (Tengah) */}
                        <div
                            className="absolute top-0 left-0 font-black tracking-tighter leading-none text-primary text-[clamp(6rem,22vw,16rem)] flex select-none"
                            style={{ WebkitTextStroke: "clamp(12px, 3vw, 28px) currentColor" }}
                            aria-hidden="true"
                        >
                            <span>4</span><span>0</span><span>4</span>
                        </div>

                        {/* LAYER 3: Fill Text / Warna Dalam (Paling Depan) */}
                        <h1 className="relative font-black tracking-tighter leading-none text-[clamp(6rem,22vw,16rem)] flex">
                            
                            {/* Angka 4 (Kiri) - Di-mix dengan putih agar warnanya jadi muda */}
                            <span className="relative">
                                <span className="text-white absolute inset-0">4</span>
                                <span className="text-primary opacity-[0.6] relative">4</span>
                            </span>

                            {/* Angka 0 (Tengah) - Tetap Putih */}
                            <span className="text-white relative">0</span>

                            {/* Angka 4 (Kanan) - Di-mix dengan putih agar warnanya jadi muda */}
                            <span className="relative">
                                <span className="text-white absolute inset-0">4</span>
                                <span className="text-primary opacity-[0.6] relative">4</span>
                            </span>

                        </h1>

                    </div>
                </div>

                <h2 className="mt-10 text-xl sm:text-3xl font-extrabold text-primary z-10">
                    Waduh! Halaman Tidak Ditemukan.
                </h2>

                <p className="mt-3 max-w-2xl text-sm sm:text-base font-medium text-primary/80 leading-relaxed z-10">
                    Sepertinya Anda tersesat di perpustakaan digital kami yang luas. Jangan khawatir, mari kita kembali ke jalur.
                </p>

                <div className="mt-10 flex items-center justify-center z-10">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        Kembali ke Beranda
                    </button>
                </div>
            </main>
        </div>
    );
}