<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['message_id', 'disk_path', 'original_name', 'mime_type', 'size'])]
class SupportTicketAttachment extends Model
{
    use HasFactory;

    protected $hidden = ['disk_path'];

    public function message(): BelongsTo
    {
        return $this->belongsTo(SupportTicketMessage::class, 'message_id');
    }
}
