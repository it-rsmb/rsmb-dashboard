<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\User;
use App\Models\UserEmployment;


class EmploymentController extends Controller
{
    //
     public function index()
    {



        return view('pages/employment/index');
    }

    public function list()
    {
         $users = User::with(['personal', 'employment'])
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
            'user_employment.employee_id',
            'user_employment.status as employment_status'
        ]);

        return response()->json($users->get());
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
