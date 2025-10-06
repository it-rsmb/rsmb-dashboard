<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\TalentaService;

use App\Models\User;
use App\Models\UserPersonal;
use App\Models\UserEmployment;
use App\Models\UserPayrollInfo;
use App\Models\UserFamily;
use App\Models\UserEmergencyContact;
use App\Models\UserEducationFormal;
use App\Models\UserCustomField;
use App\Models\UserAccessRole;
use App\Models\UserEducationInformal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Yajra\DataTables\Facades\DataTables;

class EmployeeController extends Controller
{
    public function index()
    {


        return view('pages/master-data/employees/index');
    }

public function list()
{
    if (request()->ajax()) {
        try {
            $users = User::with('personal')
                ->join('user_employment', 'users.id', '=', 'user_employment.user_id')
                ->whereNotNull('users.user_id')
                ->where('user_employment.status', 'Active')
                ->select([
                    'users.id',
                    'users.user_id',
                    'users.name',
                    'users.email',
                    'users.created_at',
                    'users.updated_at',
                    'user_employment.employee_id'
                ])
                ->orderBy('users.created_at', 'desc')
                ->get();

            // Format data untuk client-side processing
            $formattedData = [];
            foreach ($users as $user) {
                $formattedData[] = [
                    'name' => $user->name ?? 'No Name',
                    'email' => $user->email ?? 'No Email',
                    'employee_id' => $user->employee_id ?? 'No ID',
                    'created_at' => $user->created_at ? $user->created_at->format('d/m/Y H:i') : '-',
                    'updated_at' => $user->updated_at ? $user->updated_at->format('d/m/Y H:i') : '-',
                ];
            }

            // Return hanya data array untuk client-side
            return response()->json([
                'data' => $formattedData
            ]);

        } catch (\Exception $e) {
            \Log::error('DataTables Error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'data' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    return response()->json(['error' => 'Not AJAX request'], 400);
}


    private function cleanValue($value)
    {
        if ($value === "" || $value === " " || $value === null) {
            return null;
        }
        return $value;
    }



    private function cleanDate($dateValue)
    {
        if (empty($dateValue) || $dateValue === "" || $dateValue === "0000-00-00") {
            return null;
        }
        return $dateValue;
    }

    public function generateData(TalentaService $talenta)
    {
        $allEmployees = [];
        $page = 1;

        // Ambil semua halaman sampai selesai
        do {
            $response = $talenta->get("/v2/talenta/v2/employee?limit=100&page={$page}");

            if (isset($response['data']['employees']) && is_array($response['data']['employees'])) {
                $allEmployees = array_merge($allEmployees, $response['data']['employees']);
            }

            $pagination = $response['data']['pagination'] ?? null;
            $page++;
        } while ($pagination && $page <= $pagination['last_page']);

        // return response()->json($allEmployees); // Uncomment untuk test

        DB::beginTransaction();
        try {
            foreach ($allEmployees as $emp) {
                // Buat data default untuk field required
                $firstName = $emp['personal']['first_name'] ?? 'Unknown';
                $lastName = $emp['personal']['last_name'] ?? 'User';
                $email = $emp['personal']['email'] ?? 'user-' . $emp['user_id'] . '@example.com';

                // employees - ISI FIELD REQUIRED
                $employee = User::updateOrCreate(
                    ['user_id' => $emp['user_id']],
                    [
                        'name' => $firstName . ' ' . $lastName,
                        'email' => $email,
                        'password' => bcrypt(Str::random(16)), // GUNAKAN Str::random()
                        'sso_id' => $emp['sso_id'] ?? null,
                        'created_at' => $emp['created_at'] ?? now(),
                        'updated_at' => $emp['updated_at'] ?? now(),
                    ]
                );

                // personal - PERBAIKAN: data langsung dari $emp['personal']
                if (!empty($emp['personal'])) {
                    UserPersonal::updateOrCreate(
                        ['user_id' => $employee->id],
                        [
                            'first_name'    => $emp['personal']['first_name'] ?? null,
                            'last_name'     => $emp['personal']['last_name'] ?? null,
                            'barcode'       => $emp['personal']['barcode'] ?? null,
                            'email'         => $emp['personal']['email'] ?? null,
                            'identity_type' => $emp['personal']['identity_type'] ?? null,
                            'identity_number' => $emp['personal']['identity_number'] ?? null,
                            'nik'           => $emp['personal']['nik'] ?? null,
                            'passport'      => $emp['personal']['passport'] ?? null,
                            'postal_code'   => $emp['personal']['postal_code'] ?? null,
                            'address'       => $emp['personal']['address'] ?? null,
                            'current_address' => $emp['personal']['current_address'] ?? null,
                            'birth_place'   => $emp['personal']['birth_place'] ?? null,
                            'birth_date' => $this->cleanDate($emp['personal']['birth_date'] ?? null),
                            'phone'         => $emp['personal']['phone'] ?? null,
                            'mobile_phone'  => $emp['personal']['mobile_phone'] ?? null,
                            'gender'        => $emp['personal']['gender'] ?? null,
                            'marital_status'=> $emp['personal']['marital_status'] ?? null,
                            'blood_type'    => $emp['personal']['blood_type'] ?? null,
                            'religion'      => $emp['personal']['religion'] ?? null,
                            'avatar'        => $emp['personal']['avatar'] ?? null,
                        ]
                    );
                }

                // employment - PERBAIKAN: data langsung dari $emp['employment']
                if (!empty($emp['employment'])) {
                    UserEmployment::updateOrCreate(
                        ['user_id' => $employee->id],
                        [
                            'employee_id'          => $emp['employment']['employee_id'] ?? null,
                            'company_id'           => $emp['employment']['company_id'] ?? null,
                            'organization_id'      => $emp['employment']['organization_id'] ?? null,
                            'organization_name'    => $emp['employment']['organization_name'] ?? null,
                            'job_position_id'      => $emp['employment']['job_position_id'] ?? null,
                            'job_position'         => $emp['employment']['job_position'] ?? null,
                            'job_level_id'         => $emp['employment']['job_level_id'] ?? null,
                            'job_level'            => $emp['employment']['job_level'] ?? null,
                            'employment_status_id' => $emp['employment']['employment_status_id'] ?? null,
                            'employment_status'    => $emp['employment']['employment_status'] ?? null,
                            'branch_id'            => $emp['employment']['branch_id'] ?? null,
                            'branch'               => $emp['employment']['branch'] ?? null,
                            'join_date' => $this->cleanDate($emp['employment']['join_date'] ?? null),
                            'resign_date' => $this->cleanDate($emp['employment']['resign_date'] ?? null),
                            'status'               => $emp['employment']['status'] ?? null,
                            'grade'                => $emp['employment']['grade'] ?? null,
                            'class'                => $emp['employment']['class'] ?? null,
                            'approval_line'        => $emp['employment']['approval_line'] ?? null,
                            'approval_line_employee_id' => $emp['employment']['approval_line_employee_id'] ?? null,
                            'branch_code'          => $emp['employment']['branch_code'] ?? null,
                        ]
                    );
                }

                // payroll_info - PERBAIKAN: data langsung dari $emp['payroll_info']
                if (!empty($emp['payroll_info'])) {
                    UserPayrollInfo::updateOrCreate(
                        ['user_id' => $employee->id],
                        [
                            'ptkp_status'   => $this->cleanValue($emp['payroll_info']['ptkp_status'] ?? null),
                            'cost_center_id'=> $this->cleanValue($emp['payroll_info']['cost_center_id'] ?? null),
                            'cost_center_name' => $this->cleanValue($emp['payroll_info']['cost_center_name'] ?? null),
                            'cost_center_category_id' => $this->cleanValue($emp['payroll_info']['cost_center_category_id'] ?? null),
                            'cost_center_category_name' => $this->cleanValue($emp['payroll_info']['cost_center_category_name'] ?? null),
                            'bpjs_date'     => $this->cleanDate($emp['payroll_info']['bpjs_date'] ?? null),
                        ]
                    );
                }

                // family - PERBAIKAN: data dari $emp['family']
                if (!empty($emp['family'])) {
                    // family members
                    if (!empty($emp['family']['members']) && is_array($emp['family']['members'])) {
                        foreach ($emp['family']['members'] as $member) {
                            // PERBAIKAN: Skip jika name kosong
                            if (empty($member['name'])) {
                                continue; // Skip family member tanpa name
                            }

                            UserFamily::updateOrCreate(
                                [
                                    'user_id' => $employee->id,
                                    'name' => $member['name'] // Pastikan tidak null
                                ],
                                [
                                    'relation_type' => $member['relation'] ?? null,
                                    'birth_date' => !empty($member['birth_date']) ? $member['birth_date'] : null,
                                    'gender' => $member['gender'] ?? null,
                                ]
                            );
                        }
                    }
                    // emergency contacts
                   if (!empty($emp['family']['emergency_contacts']) && is_array($emp['family']['emergency_contacts'])) {
                        foreach ($emp['family']['emergency_contacts'] as $contact) {
                            // PERBAIKAN: Skip jika name kosong
                            if (empty($contact['name'])) {
                                continue; // Skip emergency contact tanpa name
                            }

                            UserEmergencyContact::updateOrCreate(
                                [
                                    'user_id' => $employee->id,
                                    'name' => $contact['name'] // Pastikan tidak null
                                ],
                                [
                                    'phone' => $contact['phone'] ?? null,
                                    'relation' => $contact['relation'] ?? null,
                                ]
                            );
                        }
                    }
                }

                // education - PERBAIKAN: data dari $emp['education']
                if (!empty($emp['education'])) {
                    // formal education
                    if (!empty($emp['education']['formal_education_history']) && is_array($emp['education']['formal_education_history'])) {
                        foreach ($emp['education']['formal_education_history'] as $education) {
                            UserEducationFormal::updateOrCreate(
                                [
                                    'user_id' => $employee->id,
                                    'institution_name' => $education['institution'] ?? null,
                                    'degree' => $education['degree'] ?? null
                                ],
                                [
                                    'major' => $education['major'] ?? null,
                                    'start_date' => $this->cleanDate($education['start_date'] ?? null),
                                    'end_date' => $this->cleanDate($education['end_date'] ?? null),
                                ]
                            );
                        }
                    }

                    // informal education
                    if (!empty($emp['education']['informal_education_history']) && is_array($emp['education']['informal_education_history'])) {
                        foreach ($emp['education']['informal_education_history'] as $training) {
                            UserEducationInformal::updateOrCreate(
                                [
                                    'user_id' => $employee->id,
                                    'training_name' => $training['training_name'] ?? null,
                                    'organizer' => $training['organizer'] ?? null
                                ],
                                [
                                    'start_date' => $training['start_date'] ?? null,
                                    'end_date' => $training['end_date'] ?? null,
                                ]
                            );
                        }
                    }
                }

                // custom_field - PERBAIKAN: data langsung dari $emp['custom_field']
                if (!empty($emp['custom_field']) && is_array($emp['custom_field'])) {
                    foreach ($emp['custom_field'] as $field) {
                        UserCustomField::updateOrCreate(
                            [
                                'user_id' => $employee->id,
                                'field_name' => $field['field_name'],
                            ],
                            [
                                'value' => $field['value'] ?? null,
                            ]
                        );
                    }
                }

                // access_role - PERBAIKAN: data langsung dari $emp['access_role']
                if (!empty($emp['access_role'])) {
                    UserAccessRole::updateOrCreate(
                        ['user_id' => $employee->id],
                        [
                            'role_id'   => $emp['access_role']['role_id'] ?? null,
                            'role_name' => $emp['access_role']['role_name'] ?? null,
                            'role_type' => $emp['access_role']['role_type'] ?? null,
                        ]
                    );
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json([
            'total' => count($allEmployees),
            'message' => 'Semua data berhasil disimpan ke database!'
        ]);
    }



}
