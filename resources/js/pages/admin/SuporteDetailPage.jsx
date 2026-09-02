import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupportTicketThread from '../../components/SupportTicketThread';

export default function SuporteDetailPage() {
    const { t } = useTranslation();
    const { ticketId } = useParams();

    return (
        <SupportTicketThread
            ticketId={ticketId}
            backTo="/admin/suporte"
            backLabel={t('adminSuporte.back')}
            showAccount
        />
    );
}
