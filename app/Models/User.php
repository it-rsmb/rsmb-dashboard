<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    public function personal()
    {
        return $this->hasOne(UserPersonal::class, 'user_id');
    }

    public function family()
    {
        return $this->hasMany(UserFamily::class, 'user_id');
    }

    public function emergencyContacts()
    {
        return $this->hasMany(UserEmergencyContact::class, 'user_id');
    }

    public function educationFormal()
    {
        return $this->hasMany(UserEducationFormal::class, 'user_id');
    }

    public function educationInformal()
    {
        return $this->hasMany(UserEducationInformal::class, 'user_id');
    }

    public function employment()
    {
        return $this->hasOne(UserEmployment::class, 'user_id');
    }

    public function payrollInfo()
    {
        return $this->hasOne(UserPayrollInfo::class, 'user_id');
    }

    public function customFields()
    {
        return $this->hasMany(UserCustomField::class, 'user_id');
    }

    public function accessRole()
    {
        return $this->hasOne(UserAccessRole::class, 'user_id');
    }
}
