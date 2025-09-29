<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCustomField extends Model
{
    protected $table = 'user_custom_fields';
    protected $fillable = [
        'user_id',
        'field_name',
        'value',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
