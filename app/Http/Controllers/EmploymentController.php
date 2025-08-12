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



}
