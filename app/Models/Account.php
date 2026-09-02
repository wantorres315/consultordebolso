<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable(['name', 'owner_id', 'plan_id', 'billing_period', 'subscription_status'])]
class Account extends Model
{
    use HasFactory;

    /**
     * Fallback limit for accounts with no plan attached (e.g. accounts
     * created via the platform-admin invite flow, which predates plans).
     */
    public const DEFAULT_MAX_MEMBERS = 3;

    protected function casts(): array
    {
        return [
            'plan_period_started_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function members(): HasMany
    {
        return $this->users()->where('role', 'member');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(AccountInvitation::class);
    }

    public function questionnaireResponses(): HasMany
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function pendingInvitations(): HasMany
    {
        return $this->invitations()->whereNull('accepted_at')->where('expires_at', '>', now());
    }

    public function occupiedSeats(): int
    {
        return 1 + $this->members()->count() + $this->pendingInvitations()->count();
    }

    /**
     * Maximum number of people (owner + members + pending invitations) this
     * account may have, based on its contracted plan.
     */
    public function maxMembers(): int
    {
        return $this->plan?->max_members ?? self::DEFAULT_MAX_MEMBERS;
    }

    public function canInviteMore(): bool
    {
        return $this->occupiedSeats() < $this->maxMembers();
    }

    /**
     * Start of the account's current billing cycle for wallet-plan credit
     * purposes. Lazily anchored the first time it's needed (e.g. when a
     * subscription is approved/activated), then walked forward in
     * monthly/annual increments to find the cycle containing "now".
     */
    public function currentPlanPeriodStart(): Carbon
    {
        if (! $this->plan_period_started_at) {
            $this->plan_period_started_at = now();
            $this->save();
        }

        $months = $this->billing_period === 'annual' ? 12 : 1;
        $start = $this->plan_period_started_at->copy();

        while ($start->copy()->addMonths($months)->lte(now())) {
            $start->addMonths($months);
        }

        return $start;
    }

    /**
     * End of the account's current billing cycle (i.e. when it renews and
     * wallet-plan credits reset), derived from currentPlanPeriodStart().
     */
    public function currentPlanPeriodEnd(): Carbon
    {
        $months = $this->billing_period === 'annual' ? 12 : 1;

        return $this->currentPlanPeriodStart()->copy()->addMonths($months);
    }

    /**
     * Current billing cycle bounds, for display purposes (e.g. "renews on
     * DD/MM"). Null for accounts with no plan attached.
     */
    public function billingCycleSummary(): ?array
    {
        if (! $this->plan) {
            return null;
        }

        return [
            'started_at' => $this->currentPlanPeriodStart()->toIso8601String(),
            'ends_at' => $this->currentPlanPeriodEnd()->toIso8601String(),
            'billing_period' => $this->billing_period,
        ];
    }

    /**
     * How many "planos de bolso" (questionnaire submissions to the
     * consultant) this account's plan allows per billing cycle. Accounts
     * with no plan attached (the legacy admin-invite flow) aren't subject
     * to this limit.
     */
    public function walletPlanCreditsLimit(): ?int
    {
        return $this->plan?->max_wallet_plans;
    }

    public function walletPlanCreditsUsed(): int
    {
        return $this->questionnaireResponses()
            ->where('status', 'finalized')
            ->where('finalized_at', '>=', $this->currentPlanPeriodStart())
            ->count();
    }

    public function hasWalletPlanCredits(): bool
    {
        $limit = $this->walletPlanCreditsLimit();

        return $limit === null || $this->walletPlanCreditsUsed() < $limit;
    }

    public function walletPlanCreditsSummary(): array
    {
        $limit = $this->walletPlanCreditsLimit();
        $used = $this->walletPlanCreditsUsed();

        return [
            'used' => $used,
            'limit' => $limit,
            'remaining' => $limit === null ? null : max(0, $limit - $used),
        ];
    }

    /**
     * Wallet-plan submissions per calendar month, oldest first, for the
     * last $months months (including the current one). Owner/admin-only
     * usage history — distinct from the rolling billing-cycle window used
     * to enforce the current limit.
     */
    public function walletPlanCreditsHistory(int $months = 6): array
    {
        $start = now()->copy()->subMonths($months - 1)->startOfMonth();

        $counts = $this->questionnaireResponses()
            ->where('status', 'finalized')
            ->where('finalized_at', '>=', $start)
            ->get(['finalized_at'])
            ->groupBy(fn ($response) => $response->finalized_at->format('Y-m'))
            ->map->count();

        $history = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $key = now()->copy()->subMonths($i)->format('Y-m');
            $history[] = [
                'period' => $key,
                'used' => $counts->get($key, 0),
            ];
        }

        return $history;
    }
}
