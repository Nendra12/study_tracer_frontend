import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, GraduationCap, Pencil, Sparkles, Globe, ArrowLeft } from "lucide-react";

function DecorIcon({ children, className }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute text-primary/25 ${className}`}
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
            <DecorIcon className="top-1/2 right-6 -rotate-6">
                <Globe size={30} />
            </DecorIcon>

            <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black text-primary">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                    Error 404
                </div>

                <h1 className="mt-6 font-black tracking-tight leading-none text-primary text-[clamp(5rem,18vw,12rem)]">
                    404
                </h1>

                <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-primary">
                    Waduh! Halaman Tidak Ditemukan.
                </h2>

                <p className="mt-3 max-w-2xl text-sm sm:text-base font-medium text-secondary/80">
                    Sepertinya Anda tersesat di perpustakaan digital kami yang luas. Jangan khawatir, mari kita kembali ke jalur.
                </p>

                <div className="mt-8 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
                    >
                        <ArrowLeft size={18} />
                        Kembali ke Beranda
                    </button>
                </div>
            </main>
        </div>
    );
}
