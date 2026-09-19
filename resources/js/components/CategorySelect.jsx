import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createAdminCategory, fetchAdminCategories } from '../lib/api';

export default function CategorySelect({ type, label, value, onChange, error }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchAdminCategories(type)
            .then(({ data }) => setCategories(data))
            .catch(() => {});
    }, [type]);

    async function handleCreate() {
        const name = newName.trim();
        if (!name) return;

        setCreating(true);
        try {
            const { data } = await createAdminCategory({ name, type });
            setCategories((previous) => [...previous, data].sort((a, b) => a.name.localeCompare(b.name)));
            onChange(String(data.id));
            setNewName('');
            setAdding(false);
        } catch {
            // ignore: category might already exist, user can pick it from the list
        } finally {
            setCreating(false);
        }
    }

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-ink">{label}</label>

            {!adding ? (
                <div className="flex gap-2">
                    <select
                        value={value ?? ''}
                        onChange={(event) => onChange(event.target.value)}
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    >
                        <option value="">{t('categorySelect.none')}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm text-ink hover:bg-app"
                    >
                        {t('categorySelect.new')}
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        autoFocus
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        placeholder={t('categorySelect.newPlaceholder')}
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={creating}
                        className="shrink-0 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-brand-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t('common.save')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAdding(false);
                            setNewName('');
                        }}
                        className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm text-ink hover:bg-app"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error[0]}</p>}
        </div>
    );
}
