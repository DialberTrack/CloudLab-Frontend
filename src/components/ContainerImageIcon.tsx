import { useState } from 'react';

export function ContainerImageIcon({
    name,
    icon,
}: {
    name: string;
    icon?: string | null;
}) {
    const [failed, setFailed] = useState(false);
    const source = icon?.trim();
    const isImageUrl = source?.startsWith('http://') || source?.startsWith('https://');

    if (isImageUrl && !failed) {
        return (
            <img
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                src={source}
                alt=""
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-sm font-semibold text-violet-300"
            title={source || name}
            aria-hidden="true"
        >
            {source && !isImageUrl ? source.slice(0, 2).toUpperCase() : name.slice(0, 1).toUpperCase()}
        </span>
    );
}
