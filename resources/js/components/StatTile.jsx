const TONE_CLASSES = {
    brand: 'text-brand',
    success: 'text-success',
    danger: 'text-red-600',
};

export default function StatTile({ label, value, tone = 'brand' }) {
    return (
        <div className="rounded-2xl bg-app p-5">
            <div className={`text-3xl font-semibold ${TONE_CLASSES[tone] ?? TONE_CLASSES.brand}`}>{value}</div>
            <div className="mt-1 text-sm text-muted">{label}</div>
        </div>
    );
}
