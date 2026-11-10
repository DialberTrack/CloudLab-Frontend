import { useParams } from 'react-router-dom';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { Loading } from '@/shared/ui/Loading';
import { terminalUrl } from '../desktop/url';
import { useContainerSession } from '../queries';

export function WorkspaceTerminalPage() {
  const { id = '' } = useParams();
  const session = useContainerSession(id, 'terminal');

  if (session.isError) {
    return (
      <section className="desktop-page">
        <Alert message={messageOf(session.error)} />
      </section>
    );
  }

  if (!session.isSuccess) {
    return <Loading label="Preparando la terminal..." />;
  }

  const url = terminalUrl(id);

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
      </div>
      <iframe
        className="desktop-frame"
        src={url}
        title="Terminal del workspace"
        allow="clipboard-read; clipboard-write; fullscreen"
        loading="eager"
      />
    </section>
  );
}
