import { Link } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
    const { user } = useAuth();
    const homePath = user ? '/' : '/login';

    return (
        <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#080b14] px-6 text-slate-100">
            <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
            <section className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
                <div className="mb-8 flex items-center justify-center gap-3">
                    <Logo />
                    <span className="text-lg font-semibold tracking-tight">CloudLab</span>
                </div>
                <p className="text-7xl font-bold tracking-tight text-violet-300 sm:text-8xl">404</p>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight">Página no encontrada</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                    La página que buscas no existe o pudo haber sido movida.
                </p>
                <Link className="primary-button mt-8 inline-flex" to={homePath}>
                    Volver al inicio
                </Link>
            </section>
        </main>
    );
}
