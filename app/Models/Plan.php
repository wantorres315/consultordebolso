<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'monthly_price',
    'annual_price',
    'monthly_price_usd',
    'annual_price_usd',
    'monthly_price_eur',
    'annual_price_eur',
    'max_members',
    'max_wallet_plans',
    'is_active',
    'is_featured',
])]
class Plan extends Model
{
    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'annual_price' => 'decimal:2',
            'monthly_price_usd' => 'decimal:2',
            'annual_price_usd' => 'decimal:2',
            'monthly_price_eur' => 'decimal:2',
            'annual_price_eur' => 'decimal:2',
            'max_members' => 'integer',
            'max_wallet_plans' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }
}
