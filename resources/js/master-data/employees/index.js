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
        serverSide: false,
        autoWidth: false,
        destroy: true,
        ajax: {
            url: "/employment/list",
            type: "GET",
            dataSrc: "", // KOSONG = response langsung array
            error: function(xhr, error, thrown) {
                console.error('=== AJAX ERROR ===');
                console.error('Status:', xhr.status);
                console.error('Response:', xhr.responseText);
                console.error('Error:', error);
                alert('Error loading data. Check console for details.');
            }
        },
        columns: [
            {
                data: null,
                className: "px-4 py-2 text-center",
                orderable: false,
                searchable: false,
                width: "50px",
                render: function(data, type, row, meta) {
                    // Nomor urut berdasarkan baris tabel
                    return '<span class="font-medium">' + (meta.row + 1) + '</span>';
                }
            },
            {
                data: 'name',
                className: "px-4 py-2",
                defaultContent: 'No Name'
            },
            {
                data: 'email',
                className: "px-4 py-2",
                defaultContent: 'No Email'
            },
            {
                data: 'employee_id',
                className: "px-4 py-2",
                defaultContent: 'No ID'
            },
            {
                data: 'created_at',
                className: "px-4 py-2",
                defaultContent: '-'
            },
            {
                data: 'updated_at',
                className: "px-4 py-2",
                defaultContent: '-'
            }
        ],
        order: [[4, 'asc']],
        pageLength: 10,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Semua"]],
        responsive: true,
        language: {
            processing: "Memuat data...",
            search: "Cari:",
            lengthMenu: "Tampilkan _MENU_ data",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
            infoEmpty: "Tidak ada data tersedia",
            infoFiltered: "(disaring dari _MAX_ total data)",
            zeroRecords: "Data tidak ditemukan",
            emptyTable: "Tidak ada data tersedia dalam tabel",
            paginate: {
                first: "Awal",
                last: "Akhir",
                next: "→",
                previous: "←"
            }
        },
        initComplete: function(settings, json) {
            console.log('=== DATATABLE INIT COMPLETE ===');
            console.log('Total rows loaded:', this.api().rows().count());
            console.log('Response data:', json);
        }
    });
});
