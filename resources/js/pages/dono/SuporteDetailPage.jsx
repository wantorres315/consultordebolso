import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SupportTicketThread from '../../components/SupportTicketThread';

export default function SuporteDetailPage() {
    const { t } = useTranslation();
    const { ticketId } = useParams();

    return <SupportTicketThread ticketId={ticketId} backTo="/dono/suporte" backLabel={t('donoSuporte.back')} />;
}
