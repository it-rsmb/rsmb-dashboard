<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEmergencyContact extends Model
{
    protected $table = 'user_emergency_contacts';
    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'relation',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
