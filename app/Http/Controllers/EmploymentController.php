<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;

class EmploymentController extends Controller
{
    //
     public function index()
    {
        $dataFeed = new DataFeed();

        return view('pages/employment/index');
    }

     public function getDataEmp(Request $request)
    {
        $df = new DataFeed();

        $labels = $df->getDataFeed($request->datatype, 'label', $request->limit);
        $data = $df->getDataFeed($request->datatype, 'data', $request->limit);

        return response()->json([
            'labels' => $labels,
            'data' => $data
        ]);
    }

    public function getSheetData()
    {
        $googleSheetUrl = 'https://script.google.com/macros/s/AKfycbwYyh30wVbDW1YazmvTGgXdHFIAshqBxMXgJ-UpmOj_Txh0G7qiWujky4oE9PIRqaxX/exec';

        // Ambil data dari Google Sheet
        $response = Http::get($googleSheetUrl);

        // Cek status
        if ($response->successful()) {
            return response()->json($response->json()); // balikin data ke frontend
        } else {
            return response()->json([
                'error' => 'Gagal mengambil data dari Google Sheet'
            ], $response->status());
        }
    }

}
