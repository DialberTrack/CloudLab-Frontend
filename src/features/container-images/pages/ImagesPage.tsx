import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { CreateWorkspaceModal } from '@/features/workspaces/components/CreateWorkspaceModal';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { QueryContent } from '@/shared/ui/QueryContent';
import { ImageCard } from '../components/ImageCard';
import { useContainerImages } from '../queries';
import type { ContainerImage } from '../types';

export function ImagesPage() {
  const { user } = useAuth();
  const imagesQuery = useContainerImages();
  const [selected, setSelected] = useState<ContainerImage | null>(null);

  return (
    <>
      <PageHeader title="Imágenes" subtitle="Imágenes disponibles para tus entornos." />
      <QueryContent
        query={imagesQuery}
        isEmpty={(images) => images.length === 0}
        empty={<EmptyState text="No hay imágenes disponibles." />}
      >
        {(images) => (
          <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isAdmin={user?.role === 'admin'}
                onUse={() => setSelected(image)}
              />
            ))}
          </div>
        )}
      </QueryContent>
      {selected && <CreateWorkspaceModal image={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
