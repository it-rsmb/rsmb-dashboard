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
        Schema::create('user_employment', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('employee_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('organization_id')->nullable();
            $table->string('organization_name')->nullable();
            $table->unsignedBigInteger('job_position_id')->nullable();
            $table->string('job_position')->nullable();
            $table->unsignedBigInteger('job_level_id')->nullable();
            $table->string('job_level')->nullable();
            $table->unsignedBigInteger('employment_status_id')->nullable();
            $table->string('employment_status')->nullable();
            $table->string('branch_id')->nullable();
            $table->string('branch')->nullable();
            $table->date('join_date')->nullable();
            $table->date('resign_date')->nullable();
            $table->string('status')->nullable();
            $table->string('length_of_service')->nullable();
            $table->string('grade')->nullable();
            $table->string('class')->nullable();
            $table->integer('approval_line')->default(0);
            $table->string('approval_line_employee_id')->nullable();
            $table->string('branch_code')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_employment');
    }
};
