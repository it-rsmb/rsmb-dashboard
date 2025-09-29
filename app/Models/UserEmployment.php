<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEmployment extends Model
{
    protected $table = 'user_employment';
    protected $fillable = [
        'user_id',
        'employee_id',
        'company_id',
        'organization_id',
        'organization_name',
        'job_position_id',
        'job_position',
        'job_level_id',
        'job_level',
        'employment_status_id',
        'employment_status',
        'branch_id',
        'branch',
        'join_date',
        'resign_date',
        'status',
        'length_of_service',
        'grade',
        'class',
        'approval_line',
        'approval_line_employee_id',
        'branch_code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
