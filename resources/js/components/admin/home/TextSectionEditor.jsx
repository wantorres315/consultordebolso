import { useTranslation } from 'react-i18next';
import LocalizedTextField from './LocalizedTextField';

export default function TextSectionEditor({ content, onChange }) {
    const { t } = useTranslation();

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
                    rows={5}
                />
            </div>
        </div>
    );
}
