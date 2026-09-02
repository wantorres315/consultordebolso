import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../IconButton';
import ImageUploadField from './ImageUploadField';
import LocalizedTextField from './LocalizedTextField';

const EMPTY_ITEM = { name: '', role: '', quote: '', avatar_url: '', video_url: '' };

export default function TestimonialsSectionEditor({ content, onChange }) {
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
                            {t('adminSite.testimonial')} {index + 1}
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

                    <div className="flex flex-wrap gap-4">
                        <ImageUploadField
                            label={t('adminSite.fieldAvatar')}
                            value={item.avatar_url}
                            onChange={(url) => updateItem(index, { avatar_url: url })}
                        />

                        <div className="flex min-w-[14rem] flex-1 flex-col gap-2">
                            <input
                                type="text"
                                value={item.name ?? ''}
                                onChange={(event) => updateItem(index, { name: event.target.value })}
                                placeholder={t('adminSite.fieldName')}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                            <LocalizedTextField
                                value={item.role}
                                onChange={(role) => updateItem(index, { role })}
                                placeholder={t('adminSite.fieldRole')}
                            />
                            <LocalizedTextField
                                value={item.quote}
                                onChange={(quote) => updateItem(index, { quote })}
                                placeholder={t('adminSite.fieldQuote')}
                                multiline
                                rows={3}
                            />
                            <input
                                type="text"
                                value={item.video_url ?? ''}
                                onChange={(event) => updateItem(index, { video_url: event.target.value })}
                                placeholder={t('adminSite.fieldTestimonialVideoUrl')}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="self-start rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
            >
                {t('adminSite.addTestimonial')}
            </button>
        </div>
    );
}
