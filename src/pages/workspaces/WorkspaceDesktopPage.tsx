import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { QualityMenu } from '../../features/workspaces/QualityMenu';
import { useKasmQuality } from '../../features/workspaces/useKasmQuality';
import { workspaceApi } from '../../lib/api';

export function WorkspaceDesktopPage() {
  const { id } = useParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const quality = useKasmQuality(iframeRef);

  useEffect(() => {
    if (!id) {
      setError('Workspace inválido.');
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    workspaceApi
      .createContainerSession(id)
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'No se pudo abrir el workspace.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <section className="desktop-page">{error}</section>;
  }

  if (!ready || !id) {
    return <Loading label="Preparando el escritorio..." />;
  }

  const containerUrl = `/workspace/${id}/?path=workspace/${id}/websockify&resize=remote`;

  return (
    <section className="desktop-page">
      <div className="justify-end gap-2 flex mb-3">
        <a
          className="small-button small-button-primary"
          href={containerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ Abrir en navegador
        </a>
        <QualityMenu {...quality} />
      </div>
      <iframe
        ref={iframeRef}
        className="desktop-frame"
        src={containerUrl}
        title="Escritorio del workspace"
        allow="autoplay; fullscreen; clipboard-read; clipboard-write; gamepad"
        loading="eager"
      />
    </section>
  );
}
