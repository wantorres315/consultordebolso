<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountInvitationController;
use App\Http\Controllers\AccountMemberController;
use App\Http\Controllers\Admin\AccountController as AdminAccountController;
use App\Http\Controllers\Admin\AccountInvitationController as AdminAccountInvitationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExpenseController as AdminExpenseController;
use App\Http\Controllers\Admin\HomeSectionController as AdminHomeSectionController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Admin\QuestionnaireController as AdminQuestionnaireController;
use App\Http\Controllers\Admin\QuestionnaireQuestionController as AdminQuestionnaireQuestionController;
use App\Http\Controllers\Admin\QuestionnaireSectionController as AdminQuestionnaireSectionController;
use App\Http\Controllers\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeSectionController;
use App\Http\Controllers\MercadoPagoWebhookController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\QuestionnaireAnswerController;
use App\Http\Controllers\QuestionnaireController;
use App\Http\Controllers\QuestionnaireResponseController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [SignupController::class, 'store']);

Route::get('/invitations/{token}', [AccountInvitationController::class, 'show']);
Route::post('/invitations/{token}/accept', [AccountInvitationController::class, 'accept']);

Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{plan}', [PlanController::class, 'show']);

Route::get('/home-sections', [HomeSectionController::class, 'index']);

Route::post('/webhooks/mercadopago', [MercadoPagoWebhookController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/account/checkout', [CheckoutController::class, 'store']);

    Route::middleware('subscription.active')->group(function () {
        Route::get('/account', [AccountController::class, 'show']);
        Route::post('/account/invitations', [AccountInvitationController::class, 'store']);
        Route::delete('/account/invitations/{invitation}', [AccountInvitationController::class, 'destroy']);
        Route::delete('/account/members/{user}', [AccountMemberController::class, 'destroy']);

        Route::get('/questionnaires', [QuestionnaireController::class, 'index']);
        Route::get('/questionnaires/{questionnaire}/responses', [QuestionnaireResponseController::class, 'index']);
        Route::post('/questionnaires/{questionnaire}/responses', [QuestionnaireResponseController::class, 'store']);
        Route::get('/questionnaire-responses/{response}', [QuestionnaireResponseController::class, 'show']);
        Route::put(
            '/questionnaire-responses/{response}/answers/{question}',
            [QuestionnaireAnswerController::class, 'update']
        );
        Route::post('/questionnaire-responses/{response}/finalize', [QuestionnaireResponseController::class, 'finalize']);
        Route::post(
            '/questionnaire-responses/{response}/purchase-checkout',
            [QuestionnaireResponseController::class, 'purchaseCheckout']
        );
    });

    Route::post('/impersonation/stop', [ImpersonationController::class, 'destroy']);

    Route::get('/support-tickets', [SupportTicketController::class, 'index']);
    Route::post('/support-tickets', [SupportTicketController::class, 'store']);
    Route::get('/support-tickets/{ticket}', [SupportTicketController::class, 'show']);
    Route::post('/support-tickets/{ticket}/messages', [SupportTicketController::class, 'storeMessage']);
    Route::patch('/support-tickets/{ticket}/status', [SupportTicketController::class, 'updateStatus']);
    Route::get('/support-ticket-attachments/{attachment}', [SupportTicketController::class, 'downloadAttachment']);

    Route::middleware('platform.admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/support-tickets', [AdminSupportTicketController::class, 'index']);
        Route::get('/accounts', [AdminAccountController::class, 'index']);
        Route::get('/accounts/{account}', [AdminAccountController::class, 'show']);
        Route::patch('/accounts/{account}/approve-payment', [AdminAccountController::class, 'approvePayment']);
        Route::post('/account-invitations', [AdminAccountInvitationController::class, 'store']);
        Route::post('/users/{user}/impersonate', [ImpersonationController::class, 'store']);

        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::post('/payments', [AdminPaymentController::class, 'store']);

        Route::get('/expenses', [AdminExpenseController::class, 'index']);
        Route::post('/expenses', [AdminExpenseController::class, 'store']);
        Route::put('/expenses/{expense}', [AdminExpenseController::class, 'update']);
        Route::delete('/expenses/{expense}', [AdminExpenseController::class, 'destroy']);

        Route::get('/plans', [AdminPlanController::class, 'index']);
        Route::post('/plans', [AdminPlanController::class, 'store']);
        Route::put('/plans/{plan}', [AdminPlanController::class, 'update']);
        Route::delete('/plans/{plan}', [AdminPlanController::class, 'destroy']);

        Route::get('/questionnaires', [AdminQuestionnaireController::class, 'index']);
        Route::post('/questionnaires', [AdminQuestionnaireController::class, 'store']);
        Route::get('/questionnaires/{questionnaire}', [AdminQuestionnaireController::class, 'show']);
        Route::put('/questionnaires/{questionnaire}', [AdminQuestionnaireController::class, 'update']);
        Route::delete('/questionnaires/{questionnaire}', [AdminQuestionnaireController::class, 'destroy']);

        Route::post('/questionnaires/{questionnaire}/sections', [AdminQuestionnaireSectionController::class, 'store']);
        Route::put('/sections/{section}', [AdminQuestionnaireSectionController::class, 'update']);
        Route::delete('/sections/{section}', [AdminQuestionnaireSectionController::class, 'destroy']);
        Route::post('/sections/{section}/move-up', [AdminQuestionnaireSectionController::class, 'moveUp']);
        Route::post('/sections/{section}/move-down', [AdminQuestionnaireSectionController::class, 'moveDown']);

        Route::post('/sections/{section}/questions', [AdminQuestionnaireQuestionController::class, 'store']);
        Route::put('/questions/{question}', [AdminQuestionnaireQuestionController::class, 'update']);
        Route::delete('/questions/{question}', [AdminQuestionnaireQuestionController::class, 'destroy']);
        Route::post('/questions/{question}/move-up', [AdminQuestionnaireQuestionController::class, 'moveUp']);
        Route::post('/questions/{question}/move-down', [AdminQuestionnaireQuestionController::class, 'moveDown']);

        Route::post('/home-sections/upload-image', [AdminHomeSectionController::class, 'uploadImage']);
        Route::get('/home-sections', [AdminHomeSectionController::class, 'index']);
        Route::post('/home-sections', [AdminHomeSectionController::class, 'store']);
        Route::put('/home-sections/{section}', [AdminHomeSectionController::class, 'update']);
        Route::delete('/home-sections/{section}', [AdminHomeSectionController::class, 'destroy']);
        Route::post('/home-sections/{section}/move-up', [AdminHomeSectionController::class, 'moveUp']);
        Route::post('/home-sections/{section}/move-down', [AdminHomeSectionController::class, 'moveDown']);
    });
});
