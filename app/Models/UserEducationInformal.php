<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEducationInformal extends Model
{
    protected $table = 'user_education_informal';
    protected $fillable = [
        'user_id',
        'training_name',
        'organizer',
        'start_date',
        'end_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
