<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\User;
use App\Models\UserEmployment;
use Illuminate\Support\Facades\DB;


class EmploymentController extends Controller
{
    //
     public function index()
    {



        return view('pages/employment/index');
    }

    public function viewEmployeeNonPermanent()
    {

        return view('pages/master-data/employee-non-permanent/index');
    }

    public function listNonPermanent(){
        $pegawai = DB::connection('simrs')
    ->table('hrd_pegawai as a')
    ->selectRaw("
        a.id as pegawai_id,
        a.id,
        a.fid,
        a.nik,
        a.nik_ktp,
        a.nama,
        a.jenkel,
        a.tempat_lahir,
        a.tgl_lahir,
        a.agama,
        a.status_kawin,
        a.pendidikan,
        a.alamat_dom,
        a.rt_dom,
        a.rw_dom,
        a.kel_dom,
        a.kec_dom,
        a.kab_dom,
        a.prov_dom,
        a.alamat_ktp,
        a.rt_ktp,
        a.rw_ktp,
        a.kel_ktp,
        a.kec_ktp,
        a.kab_ktp,
        a.prov_ktp,
        a.no_telp,
        a.no_hp,
        a.no_wa,
        a.email,
        a.unit_kerja,
        a.sk,
        a.nomor_sk,
        a.tgl_sk,
        a.jabatan,
        a.golongan,
        a.tahun,
        a.tgl_pensiun,
        a.fasilitas_perawatan,
        a.ptkp,
        a.status,
        c.name as nama_unit_kerja,
        d.nama as nama_jabatan,
        e.deskripsi as nama_golongan,
        b.agama_name as nama_agama,
        f.status_kawin as nama_status_kawin,
        g.deskripsi as nama_pendidikan,
        h.jenis_sk,
        i.status as nama_status,
        a.gol_darah,
        a.no_rek,
        a.no_bpjs_kesehatan,
        a.no_bpjs_ketenagakerjaan,
        a.id_lama,
        a.tgl_masuk,
        a.pegawai_foto,
        j1.kab_name as kab_ktp_name,
        k1.kec_name as kec_ktp_name,
        l1.klr_name as kel_ktp_name,
        j.kab_name as kab_dom_name,
        k.kec_name as kec_dom_name,
        l.klr_name as kel_dom_name,
        m.prov_name as provinsi_ktp,
        o.prov_name as provinsi_dom,
        n.nama_instansi,
        n.tahun_lulus,
        c.ketenagaan,
        c.kategori,
        p2.tipe as tipe_unit_kerja,
        p.jabatan_tipe,
        p2.name as nama_unit_kerja_gaji,
        p2.ketenagaan as ketenagaan_unit_kerja,
        q.ketenagaan_reff,
        q.bidang_reff,
        hk.nama_hubker,
        a.fakta_integritas,
        q.jenis_unit,
        a.jenis_tenaga,
        a.jenis_dokter
    ")
    ->leftJoin('hrd_unit_kerja as c', 'c.id', '=', 'a.unit_kerja')
    ->leftJoin('hrd_jabatan as d', 'd.id', '=', 'a.jabatan')
    ->leftJoin('hrd_jabatan_tipe as p', 'p.id', '=', 'd.tipe')
    ->leftJoin('hrd_golongan as e', 'e.id', '=', 'a.golongan')
    ->leftJoin('rs_agama as b', 'a.agama', '=', 'b.agama_id')
    ->leftJoin('hrd_status_kawin as f', 'f.id', '=', 'a.status_kawin')
    ->leftJoin('hrd_pendidikan as g', 'g.id', '=', 'a.pendidikan')
    ->leftJoin('hrd_jenis_sk as h', 'h.id', '=', 'a.sk')
    ->leftJoin('hrd_status as i', 'i.id', '=', 'a.status')
    ->leftJoin('rs_kabupaten as j', 'j.kab_id', '=', 'a.kab_dom')
    ->leftJoin('rs_kecamatan as k', 'k.kec_id', '=', 'a.kec_dom')
    ->leftJoin('rs_kelurahan as l', 'l.klr_id', '=', 'a.kel_dom')
    ->leftJoin('rs_provinsi as o', 'o.prov_id', '=', 'a.prov_dom')
    ->leftJoin('rs_kabupaten as j1', 'j1.kab_id', '=', 'a.kab_ktp')
    ->leftJoin('rs_kecamatan as k1', 'k1.kec_id', '=', 'a.kec_ktp')
    ->leftJoin('rs_kelurahan as l1', 'l1.klr_id', '=', 'a.kel_ktp')
    ->leftJoin('rs_provinsi as m', 'm.prov_id', '=', 'a.prov_ktp')
    ->leftJoin('hrd_pendidikan_hist as n', function($join) {
        $join->on('n.pegawai', '=', 'a.id')
             ->where('n.is_last', '=', true);
    })
    ->leftJoin('hrd_unit_kerja_gaji as p2', function($join) {
        $join->on('p2.id', '=', 'a.unit_kerja_gaji')
             ->where('p2.is_deleted', '=', 2);
    })
    ->leftJoin('hrd_unit_kerja_hist as q', function($join) {
        $join->on('q.pegawai', '=', 'a.id')
             ->where('q.is_last', '=', true);
    })
    ->leftJoin('hrd_hub_kerja as hk', 'a.hrd_hub_kerja_id', '=', 'hk.hrd_hubker_id')
    ->whereIn('a.status', ['9', '10', '2', '15', '14', '16'])
    ->where('a.is_deleted', 2)
    ->orderBy('a.nama', 'asc')
    ->get();

    return response()->json($pegawai);
    }

    public function list()
    {
         $users = User::with(['personal', 'employment', 'customFields'])
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
