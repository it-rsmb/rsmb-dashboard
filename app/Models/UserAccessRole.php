<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAccessRole extends Model
{
    protected $table = 'user_access_roles';
    protected $fillable = [
        'user_id',
        'role_id',
        'role_name',
        'role_type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
