<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFamily extends Model
{
    protected $table = 'user_family';
    protected $fillable = [
        'user_id',
        'relation_type',
        'name',
        'birth_date',
        'gender',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
