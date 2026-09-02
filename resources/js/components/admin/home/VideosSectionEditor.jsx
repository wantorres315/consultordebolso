import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../IconButton';
import LocalizedTextField from './LocalizedTextField';

const EMPTY_ITEM = { title: '', url: '' };

export default function VideosSectionEditor({ content, onChange }) {
    const { t } = useTranslation();
    const items = content.items ?? [];

    function updateItem(index, patch) {
        const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        onChange({ ...content, items: next });
    }

    function addItem() {
        onChange({ ...content, items: [...items, { ...EMPTY_ITEM }] });
    }

    function removeItem(index) {
        onChange({ ...content, items: items.filter((_, i) => i !== index) });
    }

    function moveItem(index, direction) {
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange({ ...content, items: next });
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('adminSite.fieldTitle')}</label>
                <LocalizedTextField value={content.title} onChange={(title) => onChange({ ...content, title })} />
            </div>

            {items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-line/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-muted uppercase">
                            {t('adminSite.video')} {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                            <IconButton
                                icon={faArrowUp}
                                label={t('adminQuestionarioBuilder.moveUp')}
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                            />
                            <IconButton
                                icon={faArrowDown}
                                label={t('adminQuestionarioBuilder.moveDown')}
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === items.length - 1}
                            />
                            <IconButton
                                icon={faTrash}
                                label={t('common.delete')}
                                tone="danger"
                                onClick={() => removeItem(index)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <LocalizedTextField
                            value={item.title}
                            onChange={(title) => updateItem(index, { title })}
                            placeholder={t('adminSite.fieldTitle')}
                        />
                        <input
                            type="text"
                            value={item.url ?? ''}
                            onChange={(event) => updateItem(index, { url: event.target.value })}
                            placeholder={t('adminSite.fieldVideoUrl')}
                            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                        />
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="self-start rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
            >
                {t('adminSite.addVideo')}
            </button>
        </div>
    );
}
