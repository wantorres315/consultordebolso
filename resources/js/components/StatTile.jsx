export default function StatTile({ label, value }) {
    return (
        <div className="rounded-2xl bg-app p-5">
            <div className="text-3xl font-semibold text-brand">{value}</div>
            <div className="mt-1 text-sm text-muted">{label}</div>
        </div>
    );
}
