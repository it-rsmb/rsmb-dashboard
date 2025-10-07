<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string('period', 7); // Format: YYYY-MM
            $table->string('employee_id', 50);
            $table->string('full_name');
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('total_allowance', 15, 2)->default(0);
            $table->decimal('total_deduction', 15, 2)->default(0);
            $table->decimal('pph_21_payment', 15, 2)->default(0);
            $table->decimal('take_home_pay', 15, 2)->default(0);
            $table->timestamps();

            // Index untuk performa query
            $table->index('period');
            $table->index('employee_id');
            $table->unique(['period', 'employee_id']); // Mencegah duplikasi data untuk periode dan karyawan yang sama
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
