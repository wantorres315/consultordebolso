import { useTranslation } from 'react-i18next';
import ImageUploadField from './ImageUploadField';
import LocalizedTextField from './LocalizedTextField';

export default function TextImageSectionEditor({ content, onChange }) {
    const { t } = useTranslation();
    const imagePosition = content.image_position === 'right' ? 'right' : 'left';

    return (
        <div className="flex flex-col gap-3">
            <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('adminSite.fieldTitle')}</label>
                <LocalizedTextField value={content.title} onChange={(title) => onChange({ ...content, title })} />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('adminSite.fieldBody')}</label>
                <LocalizedTextField
                    value={content.body}
                    onChange={(body) => onChange({ ...content, body })}
                    multiline
                    rows={4}
                />
            </div>

            <ImageUploadField
                label={t('adminSite.fieldImage')}
                value={content.image_url}
                onChange={(url) => onChange({ ...content, image_url: url })}
                altValue={content.image_alt}
                onAltChange={(alt) => onChange({ ...content, image_alt: alt })}
            />

            <div>
                <label className="mb-1 block text-sm font-medium text-ink">{t('adminSite.fieldImagePosition')}</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input
                            type="radio"
                            checked={imagePosition === 'left'}
                            onChange={() => onChange({ ...content, image_position: 'left' })}
                        />
                        {t('adminSite.imagePositionLeft')}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input
                            type="radio"
                            checked={imagePosition === 'right'}
                            onChange={() => onChange({ ...content, image_position: 'right' })}
                        />
                        {t('adminSite.imagePositionRight')}
                    </label>
                </div>
            </div>
        </div>
    );
}
