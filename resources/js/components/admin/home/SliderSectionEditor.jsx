import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../IconButton';
import ImageUploadField from './ImageUploadField';
import LocalizedTextField from './LocalizedTextField';

const EMPTY_SLIDE = { image_url: '', image_alt: '', title: '', subtitle: '', link_url: '' };

export default function SliderSectionEditor({ content, onChange }) {
    const { t } = useTranslation();
    const slides = content.slides ?? [];

    function updateSlide(index, patch) {
        const next = slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
        onChange({ ...content, slides: next });
    }

    function addSlide() {
        onChange({ ...content, slides: [...slides, { ...EMPTY_SLIDE }] });
    }

    function removeSlide(index) {
        onChange({ ...content, slides: slides.filter((_, i) => i !== index) });
    }

    function moveSlide(index, direction) {
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= slides.length) return;

        const next = [...slides];
        [next[index], next[target]] = [next[target], next[index]];
        onChange({ ...content, slides: next });
    }

    return (
        <div className="flex flex-col gap-4">
            {slides.map((slide, index) => (
                <div key={index} className="rounded-2xl border border-line/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-muted uppercase">
                            {t('adminSite.slide')} {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                            <IconButton
                                icon={faArrowUp}
                                label={t('adminQuestionarioBuilder.moveUp')}
                                onClick={() => moveSlide(index, 'up')}
                                disabled={index === 0}
                            />
                            <IconButton
                                icon={faArrowDown}
                                label={t('adminQuestionarioBuilder.moveDown')}
                                onClick={() => moveSlide(index, 'down')}
                                disabled={index === slides.length - 1}
                            />
                            <IconButton
                                icon={faTrash}
                                label={t('common.delete')}
                                tone="danger"
                                onClick={() => removeSlide(index)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <ImageUploadField
                            label={t('adminSite.fieldImage')}
                            value={slide.image_url}
                            onChange={(url) => updateSlide(index, { image_url: url })}
                            altValue={slide.image_alt}
                            onAltChange={(alt) => updateSlide(index, { image_alt: alt })}
                        />

                        <div className="flex min-w-[14rem] flex-1 flex-col gap-2">
                            <LocalizedTextField
                                value={slide.title}
                                onChange={(title) => updateSlide(index, { title })}
                                placeholder={t('adminSite.fieldTitle')}
                            />
                            <LocalizedTextField
                                value={slide.subtitle}
                                onChange={(subtitle) => updateSlide(index, { subtitle })}
                                placeholder={t('adminSite.fieldSubtitle')}
                            />
                            <input
                                type="text"
                                value={slide.link_url ?? ''}
                                onChange={(event) => updateSlide(index, { link_url: event.target.value })}
                                placeholder={t('adminSite.fieldLink')}
                                className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addSlide}
                className="self-start rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-app"
            >
                {t('adminSite.addSlide')}
            </button>
        </div>
    );
}
