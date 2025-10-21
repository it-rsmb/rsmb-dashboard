$(document).ready(function() {
    // Elements
    const uploadModal = $('#uploadModalEmployee');
    const uploadBtn = $('#uploadEmployeeBtn');
    const closeModalBtn = $('#closeModal');
    const cancelBtn = $('#cancelBtn');
    const uploadForm = $('#uploadForm');
    const submitBtn = $('#submitBtn');
    const progressContainer = $('#progressContainer');
    const progressBar = $('#progressBar');
    const progressText = $('#progressText');
    const messageContainer = $('#messageContainer');
    const loadingSpinner = $('#loadingSpinner');

    // Open Modal
    uploadBtn.on('click', function() {
        uploadModal.removeClass('hidden');
        resetForm();
    });

    // Close Modal
    function closeModal() {
        uploadModal.addClass('hidden');
        resetForm();
    }

    closeModalBtn.on('click', closeModal);
    cancelBtn.on('click', closeModal);

    // Close modal when clicking outside
    uploadModal.on('click', function(e) {
        if (e.target === uploadModal[0]) {
            closeModal();
        }
    });

    // Close modal with ESC key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && !uploadModal.hasClass('hidden')) {
            closeModal();
        }
    });

    // Reset Form
    function resetForm() {
        uploadForm[0].reset();
        progressContainer.addClass('hidden');
        messageContainer.addClass('hidden');
        progressBar.css('width', '0%');
        progressText.text('Mengupload... 0%');
        submitBtn.prop('disabled', false);
        loadingSpinner.addClass('hidden');
    }

    // Show Message
    function showMessage(message, type = 'success') {
        messageContainer.removeClass('hidden bg-red-100 bg-green-100 text-red-700 text-green-700');

        if (type === 'error') {
            messageContainer.addClass('bg-red-100 text-red-700');
        } else {
            messageContainer.addClass('bg-green-100 text-green-700');
        }

        messageContainer.html(message);
    }

    // Handle Form Submit
    uploadForm.on('submit', function(e) {
        e.preventDefault();

        const fileInput = $('#excel_file')[0];
        const monthInput = $('#month_picker').val();

        // Validation
        if (!fileInput.files.length) {
            showMessage('Silakan pilih file Excel terlebih dahulu!', 'error');
            return;
        }

        if (!monthInput) {
            showMessage('Silakan pilih bulan terlebih dahulu!', 'error');
            return;
        }

        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB

        // Check file size
        if (file.size > maxSize) {
            showMessage('Ukuran file melebihi 10MB!', 'error');
            return;
        }

        // Check file extension
        const allowedExtensions = ['xlsx', 'xls', 'csv'];
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            showMessage('Format file tidak didukung! Gunakan .xlsx, .xls, atau .csv', 'error');
            return;
        }

        // Prepare form data
        const formData = new FormData(this);

        // Show loading state
        submitBtn.prop('disabled', true);
        loadingSpinner.removeClass('hidden');
        progressContainer.removeClass('hidden');
        messageContainer.addClass('hidden');

        // AJAX Upload
        $.ajax({
            url: uploadForm.attr('action'),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();

                // Upload progress
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        progressBar.css('width', percentComplete + '%');
                        progressText.text('Mengupload... ' + percentComplete + '%');
                    }
                }, false);

                return xhr;
            },
            success: function(response) {
                progressBar.css('width', '100%');
                progressText.text('Upload selesai! 100%');

                showMessage(response.message || 'File berhasil diupload!', 'success');

                // Reload DataTable if exists
                if ($.fn.DataTable.isDataTable('#employeeTable')) {
                    $('#employeeTable').DataTable().ajax.reload();
                }

                // Close modal after 2 seconds
                setTimeout(function() {
                    closeModal();
                }, 2000);
            },
            error: function(xhr) {
                let errorMessage = 'Terjadi kesalahan saat mengupload file!';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }

                showMessage(errorMessage, 'error');
                progressContainer.addClass('hidden');
            },
            complete: function() {
                submitBtn.prop('disabled', false);
                loadingSpinner.addClass('hidden');
            }
        });
    });

    // File input change handler - show selected filename
    $('#excel_file').on('change', function() {
        const fileName = this.files[0]?.name;
        if (fileName) {
            console.log('File dipilih:', fileName);
        }
    });
});
