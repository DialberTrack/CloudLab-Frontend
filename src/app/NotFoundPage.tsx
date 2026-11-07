import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/shared/config/routes';
import { Logo } from '@/shared/ui/Logo';

export function NotFoundPage() {
  const { user } = useAuth();
  const homePath = user ? paths.dashboard : paths.login;

  return (
    <main className="not-found-page">
      <div className="background-orb background-orb-violet" />
      <div className="background-orb background-orb-cyan" />
      <section className="not-found-card">
        <div className="not-found-brand">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">CloudLab</span>
        </div>
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Página no encontrada</h1>
        <p className="not-found-description">
          La página que buscas no existe o pudo haber sido movida.
        </p>
        <Link className="primary-button inline-flex mt-8" to={homePath}>
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
