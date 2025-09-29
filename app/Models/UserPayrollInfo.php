<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPayrollInfo extends Model
{
    protected $table = 'user_payroll_info';
    protected $fillable = [
        'user_id',
        'ptkp_status',
        'cost_center_id',
        'cost_center_name',
        'cost_center_category_id',
        'cost_center_category_name',
        'bpjs_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
