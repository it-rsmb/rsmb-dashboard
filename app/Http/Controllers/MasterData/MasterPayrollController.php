<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Payroll;
use App\Models\UserEmployment;

class MasterPayrollController extends Controller
{
    //
     public function index()
    {


        return view('pages/master-data/payroll/index');
    }

public function uploadExcel(Request $request)
{
    $validator = Validator::make($request->all(), [
        'excel_file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        'month' => 'required|string'
    ], [
        'excel_file.required' => 'File Excel harus diisi.',
        'excel_file.file' => 'File harus berupa file yang valid.',
        'excel_file.mimes' => 'Format file harus: xlsx, xls, atau csv.',
        'excel_file.max' => 'Ukuran file maksimal 10MB.',
        'month.required' => 'Periode bulan harus diisi.'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first()
        ], 422);
    }

    try {
        $period = $request->month;
        $file = $request->file('excel_file');
        $data = Excel::toArray([], $file);

        $firstSheet = $data[0] ?? [];

        $mainHeaders = $firstSheet[2] ?? [];
        $subHeaders = $firstSheet[3] ?? [];

        // Gabungkan header dengan sub-header
        $headers = [];
        foreach ($mainHeaders as $index => $header) {
            if (!empty($header) && $header !== null) {
                $headers[$index] = $header;
            } elseif (!empty($subHeaders[$index]) && $subHeaders[$index] !== null) {
                $headers[$index] = $subHeaders[$index];
            } else {
                $headers[$index] = "column_" . $index;
            }
        }

        // Convert headers ke lowercase dan replace spasi dengan underscore
        $headers = array_map(function($header) {
            $header = strtolower($header);
            $header = str_replace(' ', '_', $header);
            $header = preg_replace('/[^a-z0-9_]/', '', $header);
            return $header;
        }, $headers);

        // Ambil data mulai dari baris ke-5 (index 4)
        $rows = array_slice($firstSheet, 4);

        // Format data dan simpan ke database
        $savedCount = 0;
        $errors = [];

        foreach ($rows as $rowIndex => $row) {
            // Skip baris kosong
            if (empty(array_filter($row))) {
                continue;
            }

            $rowData = [];
            foreach ($headers as $index => $header) {
                $rowData[$header] = $row[$index] ?? null;
            }

            // Validasi data yang akan disimpan
            if (empty($rowData['employee_id']) || empty($rowData['full_name'])) {
                $errors[] = "Baris " . ($rowIndex + 5) . ": Employee ID atau Full Name kosong";
                continue;
            }

            try {
                // Simpan atau update jika sudah ada
                Payroll::updateOrCreate(
                    [
                        'period' => $period,
                        'employee_id' => $rowData['employee_id']
                    ],
                    [
                        'full_name' => $rowData['full_name'],
                        'basic_salary' => $rowData['basic_salary'] ?? 0,
                        'total_allowance' => $rowData['total_allowance'] ?? 0,
                        'total_deduction' => $rowData['total_deduction'] ?? 0,
                        'pph_21_payment' => $rowData['pph_21_payment'] ?? 0,
                        'take_home_pay' => $rowData['take_home_pay'] ?? 0,
                    ]
                );

                $savedCount++;
            } catch (\Exception $e) {
                $errors[] = "Baris " . ($rowIndex + 5) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil disimpan!',
            'period' => $period,
            'total_saved' => $savedCount,
            'errors' => $errors
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}

    public function getPayrollData(Request $request)
{
    try {
        $period = $request->input('period');
        $search = $request->input('search');

        $query = Payroll::query()
            ->leftJoin('user_employment', 'payrolls.employee_id', '=', 'user_employment.employee_id')
            ->leftJoin('users', 'user_employment.user_id', '=', 'users.id')
            ->select(
                'payrolls.*',
                // 'user_employment.job_position as employment_job_position',
                'user_employment.organization_name',
                'user_employment.join_date',
                'user_employment.employment_status',
                'users.id as user_id',
                'users.name as user_name',
                'users.email as user_email'
            );

        // Filter by period
        if ($period) {
            $query->where('payrolls.period', $period);
        }

        // Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('payrolls.employee_id', 'like', "%{$search}%")
                  ->orWhere('payrolls.full_name', 'like', "%{$search}%")
                  ->orWhere('user_employment.department', 'like', "%{$search}%")
                  ->orWhere('user_employment.job_position', 'like', "%{$search}%")
                  ->orWhere('users.name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        // Order by
        $query->orderBy('payrolls.period', 'desc')
              ->orderBy('payrolls.full_name', 'asc');

        $payrolls = $query->get();

        // Return array langsung (bukan wrapped dalam 'data')
        return response()->json($payrolls);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}
}
