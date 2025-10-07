<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $table = 'payrolls';

    protected $fillable = [
        'period',
        'employee_id',
        'full_name',
        'basic_salary',
        'total_allowance',
        'total_deduction',
        'pph_21_payment',
        'take_home_pay',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'total_allowance' => 'decimal:2',
        'total_deduction' => 'decimal:2',
        'pph_21_payment' => 'decimal:2',
        'take_home_pay' => 'decimal:2',
    ];

    /**
     * Scope untuk filter berdasarkan periode
     */
    public function scopeByPeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    /**
     * Scope untuk filter berdasarkan employee ID
     */
    public function scopeByEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Accessor untuk format periode yang lebih readable
     */
    public function getFormattedPeriodAttribute()
    {
        $date = \Carbon\Carbon::createFromFormat('Y-m', $this->period);
        return $date->format('F Y');
    }

     public function userEmployment()
    {
        return $this->belongsTo(UserEmployment::class, 'employee_id', 'employee_id');
    }
}
