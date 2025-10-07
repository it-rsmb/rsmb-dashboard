@vite(['resources/js/master-data/payroll/index.js'])

<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page Header -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Master Payroll</h1>
            </div>

            <!-- Actions -->
            <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <x-dropdown-filter align="right" />
                {{-- <x-datepicker /> --}}
                <div class="relative">
                    <input type="text" id="period"
                        class="w-full px-4 py-2.5 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:focus:ring-indigo-400 hover:border-gray-400 dark:hover:border-gray-500"
                        placeholder="Pilih periode" readonly>
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                </div>

                <button id="uploadBtn" class="btn bg-indigo-500 text-white hover:bg-indigo-600">
                    <svg class="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                        <path
                            d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span class="ml-2">Upload Data</span>
                </button>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-sm shadow-lg">
            <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Payroll Data</h2>
                <div class="overflow-x-auto">
                    <table class="table table-striped table-hover" id="payrollTable">
                        <thead class="table-dark">
                            <tr>
                                <th>No</th>
                                <th>Periode</th>
                                <th>Employee ID</th>
                                <th>Nama Lengkap</th>
                                <th>Department</th>
                                <th>Jabatan</th>
                                <th>Gaji Pokok</th>
                                <th>Total Tunjangan</th>
                                <th>Total Potongan</th>
                                <th>PPh 21</th>
                                <th>Take Home Pay</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="payrollTableBody">
                            <!-- Data akan diisi via JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <!-- Upload Modal -->
    <div id="uploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 hidden">
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">

            <!-- Modal Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Upload Excel File
                </h3>
                <button id="closeModal"
                    class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-4">
                <form id="uploadForm" action="{{ route('upload.excel') }}" method="POST" enctype="multipart/form-data">
                    @csrf

                    <!-- Month Picker -->
                    <div class="mb-4">
                        <label for="month_picker"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih Bulan <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input type="month" id="month_picker" name="month"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                required value="{{ date('Y-m') }}">
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Pilih bulan untuk data payroll
                        </p>
                    </div>

                    <!-- File Input -->
                    <div class="mb-4">
                        <label for="excel_file" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih File Excel <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input type="file" id="excel_file" name="excel_file" accept=".xlsx,.xls,.csv"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                required>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Format yang didukung: .xlsx, .xls, .csv (Maks: 10MB)
                        </p>
                    </div>

                    <!-- Progress Bar -->
                    <div id="progressContainer" class="hidden mb-4">
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div id="progressBar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style="width: 0%"></div>
                        </div>
                        <p id="progressText" class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                            Mengupload... 0%
                        </p>
                    </div>

                    <!-- Messages -->
                    <div id="messageContainer" class="hidden mb-4 p-3 rounded-lg text-sm"></div>

                </form>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" id="cancelBtn"
                    class="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    Batal
                </button>
                <button type="submit" id="submitBtn" form="uploadForm"
                    class="btn bg-indigo-500 text-white hover:bg-indigo-600 flex items-center">
                    <span>Upload File</span>
                    <svg id="loadingSpinner" class="hidden animate-spin ml-2 h-4 w-4 text-white" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</x-app-layout>
