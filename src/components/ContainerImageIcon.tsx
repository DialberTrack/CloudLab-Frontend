import { useState } from 'react';

export function ContainerImageIcon({ name, icon }: { name: string; icon?: string | null }) {
  const [failed, setFailed] = useState(false);
  const source = icon?.trim();
  const isImageUrl = source?.startsWith('http://') || source?.startsWith('https://');

  if (isImageUrl && !failed) {
    return <img className="container-image" src={source} alt="" onError={() => setFailed(true)} />;
  }

  return (
    <span className="container-image-icon" title={source || name} aria-hidden="true">
      {source && !isImageUrl ? source.slice(0, 2).toUpperCase() : name.slice(0, 1).toUpperCase()}
    </span>
  );
}
