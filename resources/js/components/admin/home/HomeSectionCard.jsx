import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
    deleteAdminHomeSection,
    moveAdminHomeSectionDown,
    moveAdminHomeSectionUp,
    updateAdminHomeSection,
} from '../../../lib/api';
import IconButton from '../../IconButton';
import SliderSectionEditor from './SliderSectionEditor';
import TestimonialsSectionEditor from './TestimonialsSectionEditor';
import VideosSectionEditor from './VideosSectionEditor';
import TextSectionEditor from './TextSectionEditor';
import TextImageSectionEditor from './TextImageSectionEditor';
import PlansSectionEditor from './PlansSectionEditor';

const EDITORS = {
    slider: SliderSectionEditor,
    testimonials: TestimonialsSectionEditor,
    videos: VideosSectionEditor,
    text: TextSectionEditor,
    text_image: TextImageSectionEditor,
    plans: PlansSectionEditor,
};

export default function HomeSectionCard({ section, isFirst, isLast, onChanged }) {
    const { t } = useTranslation();
    const [content, setContent] = useState(section.content);
    const [isActive, setIsActive] = useState(section.is_active);
    const [submitting, setSubmitting] = useState(false);

    const Editor = EDITORS[section.type];

    async function handleSave() {
        setSubmitting(true);

        try {
            await updateAdminHomeSection(section.id, { content, is_active: isActive });
            onChanged();
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleActive() {
        const next = !isActive;
        setIsActive(next);
        await updateAdminHomeSection(section.id, { content, is_active: next });
        onChanged();
    }

    async function handleDelete() {
        if (!window.confirm(t('adminSite.confirmDelete'))) return;

        await deleteAdminHomeSection(section.id);
        onChanged();
    }

    async function handleMoveUp() {
        await moveAdminHomeSectionUp(section.id);
        onChanged();
    }

    async function handleMoveDown() {
        await moveAdminHomeSectionDown(section.id);
        onChanged();
    }

    return (
        <div className="rounded-3xl bg-surface p-6 shadow-sm shadow-black/5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-app px-3 py-1 text-xs font-medium text-muted">
                        {t(`adminSite.type.${section.type}`)}
                    </span>
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" checked={isActive} onChange={handleToggleActive} />
                        {t('adminSite.active')}
                    </label>
                </div>

                <div className="flex items-center gap-1">
                    <IconButton
                        icon={faArrowUp}
                        label={t('adminQuestionarioBuilder.moveUp')}
                        onClick={handleMoveUp}
                        disabled={isFirst}
                    />
                    <IconButton
                        icon={faArrowDown}
                        label={t('adminQuestionarioBuilder.moveDown')}
                        onClick={handleMoveDown}
                        disabled={isLast}
                    />
                    <IconButton icon={faTrash} label={t('common.delete')} tone="danger" onClick={handleDelete} />
                </div>
            </div>

            {Editor && <Editor content={content} onChange={setContent} />}

            <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="mt-4 rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? t('common.saving') : t('common.save')}
            </button>
        </div>
    );
}
