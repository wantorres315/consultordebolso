import axios from 'axios';
import { LOCALE_TO_BACKEND } from '../i18n/config';

const api = axios.create({
    baseURL: '/',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const locale = localStorage.getItem('locale');
    config.headers['X-Locale'] = LOCALE_TO_BACKEND[locale] ?? LOCALE_TO_BACKEND['pt-BR'];

    return config;
});

export async function ensureCsrfCookie() {
    await api.get('/sanctum/csrf-cookie');
}

export async function login(data) {
    await ensureCsrfCookie();

    return api.post('/api/login', data);
}

export async function logout() {
    return api.post('/api/logout');
}

export async function fetchUser() {
    return api.get('/api/user');
}

export async function fetchAdminAccounts(page = 1) {
    return api.get('/api/admin/accounts', { params: { page } });
}

export async function fetchAdminAccount(accountId) {
    return api.get(`/api/admin/accounts/${accountId}`);
}

export async function fetchAdminDashboard() {
    return api.get('/api/admin/dashboard');
}

export async function fetchAccount() {
    return api.get('/api/account');
}

export async function createAccountInvitation(name, email) {
    return api.post('/api/account/invitations', { name, email });
}

export async function deleteAccountInvitation(invitationId) {
    return api.delete(`/api/account/invitations/${invitationId}`);
}

export async function impersonate(userId) {
    return api.post(`/api/admin/users/${userId}/impersonate`);
}

export async function stopImpersonating() {
    return api.post('/api/impersonation/stop');
}

export async function fetchAdminPayments(params) {
    return api.get('/api/admin/payments', { params });
}

export async function createManualPayment(data) {
    return api.post('/api/admin/payments', data);
}

export async function fetchAdminExpenses(params) {
    return api.get('/api/admin/expenses', { params });
}

export async function createExpense(data) {
    return api.post('/api/admin/expenses', data);
}

export async function updateExpense(id, data) {
    return api.put(`/api/admin/expenses/${id}`, data);
}

export async function deleteExpense(id) {
    return api.delete(`/api/admin/expenses/${id}`);
}

export async function fetchPlans() {
    return api.get('/api/admin/plans');
}

export async function createPlan(data) {
    return api.post('/api/admin/plans', data);
}

export async function updatePlan(id, data) {
    return api.put(`/api/admin/plans/${id}`, data);
}

export async function deletePlan(id) {
    return api.delete(`/api/admin/plans/${id}`);
}

export async function fetchPublicPlans() {
    return api.get('/api/plans');
}

export async function fetchPublicPlan(id) {
    return api.get(`/api/plans/${id}`);
}

export async function fetchInvitation(token) {
    return api.get(`/api/invitations/${token}`);
}

export async function acceptInvitation(token, data) {
    await ensureCsrfCookie();

    return api.post(`/api/invitations/${token}/accept`, data);
}

export async function signup(data) {
    await ensureCsrfCookie();

    return api.post('/api/signup', data);
}

export async function createCheckout() {
    return api.post('/api/account/checkout');
}

export async function approvePayment(accountId) {
    return api.patch(`/api/admin/accounts/${accountId}/approve-payment`);
}

// Admin questionnaire authoring
export async function fetchAdminQuestionnaires() {
    return api.get('/api/admin/questionnaires');
}

export async function fetchAdminQuestionnaire(id) {
    return api.get(`/api/admin/questionnaires/${id}`);
}

export async function createAdminQuestionnaire(data) {
    return api.post('/api/admin/questionnaires', data);
}

export async function updateAdminQuestionnaire(id, data) {
    return api.put(`/api/admin/questionnaires/${id}`, data);
}

export async function deleteAdminQuestionnaire(id) {
    return api.delete(`/api/admin/questionnaires/${id}`);
}

export async function createAdminSection(questionnaireId, data) {
    return api.post(`/api/admin/questionnaires/${questionnaireId}/sections`, data);
}

export async function updateAdminSection(sectionId, data) {
    return api.put(`/api/admin/sections/${sectionId}`, data);
}

export async function deleteAdminSection(sectionId) {
    return api.delete(`/api/admin/sections/${sectionId}`);
}

export async function moveAdminSectionUp(sectionId) {
    return api.post(`/api/admin/sections/${sectionId}/move-up`);
}

export async function moveAdminSectionDown(sectionId) {
    return api.post(`/api/admin/sections/${sectionId}/move-down`);
}

export async function createAdminQuestion(sectionId, data) {
    return api.post(`/api/admin/sections/${sectionId}/questions`, data);
}

export async function updateAdminQuestion(questionId, data) {
    return api.put(`/api/admin/questions/${questionId}`, data);
}

export async function deleteAdminQuestion(questionId) {
    return api.delete(`/api/admin/questions/${questionId}`);
}

export async function moveAdminQuestionUp(questionId) {
    return api.post(`/api/admin/questions/${questionId}/move-up`);
}

export async function moveAdminQuestionDown(questionId) {
    return api.post(`/api/admin/questions/${questionId}/move-down`);
}

// Respondent-facing questionnaires
export async function fetchQuestionnaires() {
    return api.get('/api/questionnaires');
}

export async function fetchQuestionnaireResponses(questionnaireId) {
    return api.get(`/api/questionnaires/${questionnaireId}/responses`);
}

export async function startOrResumeQuestionnaireResponse(questionnaireId) {
    return api.post(`/api/questionnaires/${questionnaireId}/responses`);
}

export async function fetchQuestionnaireResponse(responseId) {
    return api.get(`/api/questionnaire-responses/${responseId}`);
}

export async function saveQuestionnaireAnswer(responseId, questionId, value) {
    return api.put(`/api/questionnaire-responses/${responseId}/answers/${questionId}`, { value });
}

export async function finalizeQuestionnaireResponse(responseId) {
    return api.post(`/api/questionnaire-responses/${responseId}/finalize`);
}

export async function createQuestionnaireResponsePurchase(responseId) {
    return api.post(`/api/questionnaire-responses/${responseId}/purchase-checkout`);
}

// Support tickets
export async function fetchSupportTickets(page = 1) {
    return api.get('/api/support-tickets', { params: { page } });
}

export async function createSupportTicket({ subject, message, attachments = [] }) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('message', message);
    attachments.forEach((file) => formData.append('attachments[]', file));

    return api.post('/api/support-tickets', formData);
}

export async function fetchSupportTicket(ticketId) {
    return api.get(`/api/support-tickets/${ticketId}`);
}

export async function sendSupportTicketMessage(ticketId, body, attachments = []) {
    const formData = new FormData();
    if (body) formData.append('body', body);
    attachments.forEach((file) => formData.append('attachments[]', file));

    return api.post(`/api/support-tickets/${ticketId}/messages`, formData);
}

export async function updateSupportTicketStatus(ticketId, status) {
    return api.patch(`/api/support-tickets/${ticketId}/status`, { status });
}

export function supportTicketAttachmentUrl(attachmentId) {
    return `/api/support-ticket-attachments/${attachmentId}`;
}

export async function fetchAdminSupportTickets(page = 1, status) {
    return api.get('/api/admin/support-tickets', { params: { page, status } });
}

// Home page builder
export async function fetchHomeSections() {
    return api.get('/api/home-sections');
}

export async function fetchAdminHomeSections() {
    return api.get('/api/admin/home-sections');
}

export async function createAdminHomeSection(data) {
    return api.post('/api/admin/home-sections', data);
}

export async function updateAdminHomeSection(id, data) {
    return api.put(`/api/admin/home-sections/${id}`, data);
}

export async function deleteAdminHomeSection(id) {
    return api.delete(`/api/admin/home-sections/${id}`);
}

export async function moveAdminHomeSectionUp(id) {
    return api.post(`/api/admin/home-sections/${id}/move-up`);
}

export async function moveAdminHomeSectionDown(id) {
    return api.post(`/api/admin/home-sections/${id}/move-down`);
}

export async function uploadAdminHomeSectionImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return api.post('/api/admin/home-sections/upload-image', formData);
}

export default api;
