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
         Schema::create('user_payroll_info', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('ptkp_status')->nullable();
            $table->unsignedBigInteger('cost_center_id')->nullable();
            $table->string('cost_center_name')->nullable();
            $table->unsignedBigInteger('cost_center_category_id')->nullable();
            $table->string('cost_center_category_name')->nullable();
            $table->date('bpjs_date')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_payroll_info');
    }
};
