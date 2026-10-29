import type { ReactNode } from 'react';

export function PageHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>
                <p className="mt-2 text-slate-500">{subtitle}</p>
            </div>
            {action}
        </div>
    );
}
