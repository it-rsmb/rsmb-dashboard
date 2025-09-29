$('#generateBtn').on('click', function() {
    let url = $(this).data('url');
    $.ajax({
        url: url,
        method: "GET",
        success: function(res) {
          console.log(res);

        },
        error: function(err) {
            alert("Error generating data");
        }
    });





});

document.addEventListener('DOMContentLoaded', () => {
    $('#employeeTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: "/master-data/list",
            type: "GET",
            error: function(xhr, error, thrown) {
                console.log('Ajax Error:', xhr.responseText);
                alert('Error loading data: ' + xhr.responseText);
            }
        },
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', className: "px-4 py-2", orderable: false, searchable: false }, // Aktifkan kembali
            { data: 'full_name', name: 'full_name', className: "px-4 py-2" },
            { data: 'email', name: 'email', className: "px-4 py-2" },
            { data: 'employee_id', name: 'employee_id', className: "px-4 py-2" },
            { data: 'created_at', name: 'created_at', className: "px-4 py-2" },
            { data: 'updated_at', name: 'updated_at', className: "px-4 py-2" },
            // { data: 'action', name: 'action', orderable: false, searchable: false, className: "px-4 py-2 text-center" },
        ],
        responsive: true,
        language: {
            processing: "Loading...",
            search: "Cari:",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
            infoEmpty: "Tidak ada data tersedia",
            zeroRecords: "Data tidak ditemukan",
            paginate: {
                first: "Awal",
                last: "Akhir",
                next: "→",
                previous: "←"
            }
        }
    });
});
