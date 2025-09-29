<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPersonal extends Model
{
    protected $table = 'user_personal';
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'barcode',
        'email',
        'identity_type',
        'identity_number',
        'nik',
        'passport',
        'expired_date_identity_id',
        'postal_code',
        'address',
        'current_address',
        'birth_place',
        'birth_date',
        'phone',
        'mobile_phone',
        'gender',
        'marital_status',
        'blood_type',
        'religion',
        'avatar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
