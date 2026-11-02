export const QUALITY_CONTROLS = [
    {
        name: 'video_quality',
        label: 'Calidad de video',
        type: 'select',
        options: [
            ['0', 'Static'],
            ['1', 'Low'],
            ['2', 'Medium'],
            ['3', 'High'],
            ['4', 'Extreme'],
            ['5', 'Lossless'],
            ['10', 'Custom'],
        ],
    },
    {
        name: 'anti_aliasing',
        label: 'Antialiasing',
        type: 'select',
        options: [
            ['0', 'Auto'],
            ['1', 'On'],
            ['2', 'Off'],
        ],
    },
    { name: 'dynamic_quality_min', label: 'Calidad dinámica mínima', type: 'range', min: 0, max: 9 },
    { name: 'dynamic_quality_max', label: 'Calidad dinámica máxima', type: 'range', min: 0, max: 9 },
    { name: 'treat_lossless', label: 'Tratar como sin pérdida', type: 'range', min: 0, max: 9 },
    { name: 'framerate_image_mode', label: 'FPS modo imagen', type: 'number', min: 1, max: 120 },
    { name: 'jpeg_video_quality', label: 'Calidad JPEG', type: 'range', min: 0, max: 9 },
    { name: 'webp_video_quality', label: 'Calidad WEBP', type: 'range', min: 0, max: 9 },
    { name: 'video_area', label: 'Área de video', type: 'range', min: 0, max: 100 },
    { name: 'video_time', label: 'Tiempo de video', type: 'range', min: 0, max: 60 },
    { name: 'video_out_time', label: 'Tiempo de salida', type: 'range', min: 0, max: 60 },
    {
        name: 'video_scaling',
        label: 'Escalado de video',
        type: 'select',
        options: [
            ['0', 'Nearest'],
            ['1', 'Bilinear'],
            ['2', 'Progressive Bilinear'],
        ],
    },
    { name: 'max_video_resolution_x', label: 'Resolución máxima X', type: 'number', min: 100, max: 3840 },
    { name: 'max_video_resolution_y', label: 'Resolución máxima Y', type: 'number', min: 100, max: 2160 },
] as const;

export type QualityControl = (typeof QUALITY_CONTROLS)[number];
export type QualityControlName = QualityControl['name'];
export type QualityValues = Partial<Record<QualityControlName, string>>;
