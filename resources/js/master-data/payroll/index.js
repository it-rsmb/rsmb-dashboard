document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const uploadForm = document.getElementById('uploadForm');
    const excelFileInput = document.getElementById('excel_file');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const messageContainer = document.getElementById('messageContainer');
    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    // Initialize DataTable
    let payrollTable;
    const tableElement = document.getElementById('payrollTable');

    if (tableElement) {
        payrollTable = $('#payrollTable').DataTable({
            processing: true,
            serverSide: false,
            autoWidth: false,
            destroy: true,
            ajax: {
                url: "/payroll/list",
                type: "GET",
                dataSrc: "", // Response langsung array
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
                        return '<span class="font-medium">' + (meta.row + 1) + '</span>';
                    }
                },
                {
                    data: 'period',
                    className: "px-4 py-2",
                    defaultContent: '-'
                },
                {
                    data: 'employee_id',
                    className: "px-4 py-2",
                    defaultContent: '-'
                },
                {
                    data: 'full_name',
                    className: "px-4 py-2",
                    defaultContent: '-',
                },
                {
                    data: 'organization_name',
                    className: "px-4 py-2",
                    defaultContent: '-'
                },
                {
                    data: 'employment_job_position',
                    className: "px-4 py-2",
                    defaultContent: '-',
                    render: function(data, type, row) {
                        return data || row.job_position || '-';
                    }
                },
                {
                    data: 'basic_salary',
                    className: "px-4 py-2 text-right",
                    defaultContent: '0',
                    render: function(data) {
                        return formatCurrency(data);
                    }
                },
                {
                    data: 'total_allowance',
                    className: "px-4 py-2 text-right",
                    defaultContent: '0',
                    render: function(data) {
                        return formatCurrency(data);
                    }
                },
                {
                    data: 'total_deduction',
                    className: "px-4 py-2 text-right",
                    defaultContent: '0',
                    render: function(data) {
                        return formatCurrency(data);
                    }
                },
                {
                    data: 'pph_21_payment',
                    className: "px-4 py-2 text-right",
                    defaultContent: '0',
                    render: function(data) {
                        return formatCurrency(data);
                    }
                },
                {
                    data: 'take_home_pay',
                    className: "px-4 py-2 text-right",
                    defaultContent: '0',
                    render: function(data) {
                        return '<span class="font-semibold text-emerald-600 dark:text-emerald-400">' + formatCurrency(data) + '</span>';
                    }
                },
                {
                    data: null,
                    className: "px-4 py-2 text-center",
                    orderable: false,
                    searchable: false,
                    width: "100px",
                    render: function(data, type, row) {
                        return `
                            <div class="flex justify-center space-x-2">
                                <button onclick="viewDetail(${row.id})"
                                        class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                                        title="View Detail">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </button>
                                <button onclick="deletePayroll(${row.id})"
                                        class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded transition-colors"
                                        title="Delete">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            order: [[1, 'desc']], // Order by period descending
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
                console.log('DataTable initialized with', json.length, 'records');
            }
        });
    }


    // Global function untuk delete payroll


    // Function to show detail modal

    // Global function to close detail modal
    window.closeDetailModal = function() {
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.remove();
        }
    };

    // Open Modal
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            uploadModal.classList.remove('hidden');
            resetForm();
        });
    }

    // Close Modal
    function closeUploadModal() {
        uploadModal.classList.add('hidden');
        resetForm();
    }

    // Close modal events
    if (closeModal) closeModal.addEventListener('click', closeUploadModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeUploadModal);

    // Close modal when clicking outside
    if (uploadModal) {
        uploadModal.addEventListener('click', function(e) {
            if (e.target === uploadModal) {
                closeUploadModal();
            }
        });
    }

    // Reset form function
    function resetForm() {
        if (uploadForm) uploadForm.reset();
        if (progressContainer) progressContainer.classList.add('hidden');
        if (messageContainer) {
            messageContainer.classList.add('hidden');
            messageContainer.innerHTML = '';
        }
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = 'Uploading... 0%';
        if (submitBtn) submitBtn.disabled = false;
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }

    // File input change event
    if (excelFileInput) {
        excelFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const allowedTypes = [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv'
                ];

                if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
                    showMessage('Format file tidak valid. Pilih file Excel (.xlsx, .xls) atau CSV.', 'error');
                    excelFileInput.value = '';
                    return;
                }

                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    showMessage('File terlalu besar. Maksimal 10MB.', 'error');
                    excelFileInput.value = '';
                    return;
                }

                showMessage('File siap: ' + file.name, 'success');
            }
        });
    }

    // Show message function
    function showMessage(message, type) {
        if (!messageContainer) return;

        messageContainer.classList.remove('hidden');
        messageContainer.innerHTML = message;

        const styles = {
            error: 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
            success: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
            info: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        };

        messageContainer.className = `p-3 rounded-lg text-sm ${styles[type] || styles.info}`;
    }

    // Form submit event
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const file = excelFileInput?.files[0];

            if (!file) {
                showMessage('Pilih file terlebih dahulu.', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Uploading...</span>';
            }
            if (loadingSpinner) loadingSpinner.classList.remove('hidden');
            if (progressContainer) progressContainer.classList.remove('hidden');

            $.ajax({
                url: uploadForm.action,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            if (progressBar) progressBar.style.width = percentComplete + '%';
                            if (progressText) progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
                        }
                    });
                    return xhr;
                },
                success: function(response) {
                    showMessage(response.message || 'File berhasil diupload!', 'success');
                    if (progressBar) progressBar.style.width = '100%';
                    if (progressText) progressText.textContent = 'Upload selesai!';

                    setTimeout(() => {
                        closeUploadModal();
                        if (payrollTable) {
                            payrollTable.ajax.reload();
                        }
                    }, 2000);
                },
                error: function(xhr) {
                    const errorMessage = xhr.responseJSON?.message || 'Terjadi kesalahan saat upload.';
                    showMessage(errorMessage, 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Upload File</span>';
                    }
                    if (loadingSpinner) loadingSpinner.classList.add('hidden');
                }
            });
        });
    }



    flatpickr("#period", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d F Y",
        allowInput: true,
    });
});
