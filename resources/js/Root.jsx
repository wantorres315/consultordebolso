import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './context/LocaleContext';
import RequireRole from './router/RequireRole';
import LandingPage from './pages/LandingPage';
import PlanosPublicPage from './pages/PlanosPublicPage';
import AssinarPage from './pages/AssinarPage';
import PagamentoPendentePage from './pages/PagamentoPendentePage';
import PagamentoRetornoPage from './pages/PagamentoRetornoPage';
import AceitarConvitePage from './pages/AceitarConvitePage';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ClientesPage from './pages/admin/ClientesPage';
import ClienteDetailPage from './pages/admin/ClienteDetailPage';
import FinanceiroLayout from './layouts/FinanceiroLayout';
import DespesasPage from './pages/admin/financeiro/DespesasPage';
import FaturasPage from './pages/admin/financeiro/FaturasPage';
import PagamentosPage from './pages/admin/financeiro/PagamentosPage';
import AdminQuestionariosPage from './pages/admin/QuestionariosPage';
import QuestionarioBuilderPage from './pages/admin/QuestionarioBuilderPage';
import PlanosPage from './pages/admin/PlanosPage';
import AdminSuportePage from './pages/admin/SuportePage';
import AdminSuporteDetailPage from './pages/admin/SuporteDetailPage';
import SitePage from './pages/admin/SitePage';

import DonoLayout from './layouts/DonoLayout';
import DonoDashboardPage from './pages/dono/DashboardPage';
import UsuariosPage from './pages/dono/UsuariosPage';
import PerguntasPage from './pages/dono/PerguntasPage';
import DonoSuportePage from './pages/dono/SuportePage';
import DonoSuporteDetailPage from './pages/dono/SuporteDetailPage';
import DonoQuestionnairePurchaseReturnPage from './pages/dono/QuestionnairePurchaseReturnPage';

import MembroLayout from './layouts/MembroLayout';
import ResponderQuestionariosPage from './pages/membro/ResponderQuestionariosPage';
import QuestionnairePurchaseReturnPage from './pages/membro/QuestionnairePurchaseReturnPage';

export default function Root() {
    return (
        <LocaleProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/planos" element={<PlanosPublicPage />} />
                            <Route path="/assinar/:planId" element={<AssinarPage />} />
                            <Route path="/pagamento-pendente" element={<PagamentoPendentePage />} />
                            <Route path="/pagamento/retorno" element={<PagamentoRetornoPage />} />
                            <Route path="/convite/:token" element={<AceitarConvitePage />} />

                            <Route
                                path="/admin"
                                element={
                                    <RequireRole role="admin">
                                        <AdminLayout />
                                    </RequireRole>
                                }
                            >
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminDashboardPage />} />
                                <Route path="clientes" element={<ClientesPage />} />
                                <Route path="clientes/:accountId" element={<ClienteDetailPage />} />
                                <Route path="financeiro" element={<FinanceiroLayout />}>
                                    <Route index element={<Navigate to="despesas" replace />} />
                                    <Route path="despesas" element={<DespesasPage />} />
                                    <Route path="faturas" element={<FaturasPage />} />
                                    <Route path="pagamentos" element={<PagamentosPage />} />
                                </Route>
                                <Route path="planos" element={<PlanosPage />} />
                                <Route path="questionarios" element={<AdminQuestionariosPage />} />
                                <Route path="questionarios/:questionnaireId" element={<QuestionarioBuilderPage />} />
                                <Route path="suporte" element={<AdminSuportePage />} />
                                <Route path="suporte/:ticketId" element={<AdminSuporteDetailPage />} />
                                <Route path="site" element={<SitePage />} />
                            </Route>

                            <Route
                                path="/dono"
                                element={
                                    <RequireRole role="owner">
                                        <DonoLayout />
                                    </RequireRole>
                                }
                            >
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<DonoDashboardPage />} />
                                <Route path="usuarios" element={<UsuariosPage />} />
                                <Route path="perguntas" element={<PerguntasPage />} />
                                <Route
                                    path="perguntas/pagamento-retorno/:responseId"
                                    element={<DonoQuestionnairePurchaseReturnPage />}
                                />
                                <Route path="suporte" element={<DonoSuportePage />} />
                                <Route path="suporte/:ticketId" element={<DonoSuporteDetailPage />} />
                            </Route>

                            <Route
                                path="/questionarios"
                                element={
                                    <RequireRole role="member">
                                        <MembroLayout />
                                    </RequireRole>
                                }
                            >
                                <Route index element={<ResponderQuestionariosPage />} />
                                <Route
                                    path="pagamento-retorno/:responseId"
                                    element={<QuestionnairePurchaseReturnPage />}
                                />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </LocaleProvider>
    );
}
