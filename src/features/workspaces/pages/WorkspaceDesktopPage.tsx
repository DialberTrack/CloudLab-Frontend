import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { Loading } from '@/shared/ui/Loading';
import { QualityMenu } from '../desktop/QualityMenu';
import { desktopUrl } from '../desktop/url';
import { useKasmQuality } from '../desktop/useKasmQuality';
import { useDesktopSession } from '../queries';

export function WorkspaceDesktopPage() {
  const { id = '' } = useParams();
  const session = useDesktopSession(id);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const quality = useKasmQuality(iframeRef);

  if (session.isError) {
    return (
      <section className="desktop-page">
        <Alert message={messageOf(session.error)} />
      </section>
    );
  }

  if (!session.isSuccess) {
    return <Loading label="Preparando el escritorio..." />;
  }

  const url = desktopUrl(id);

  return (
    <section className="desktop-page">
      <div className="justify-end gap-2 flex mb-3">
        <a
          className="small-button small-button-primary"
          href={url}
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
        src={url}
        title="Escritorio del workspace"
        allow="autoplay; fullscreen; clipboard-read; clipboard-write; gamepad"
        loading="eager"
      />
    </section>
  );
}
