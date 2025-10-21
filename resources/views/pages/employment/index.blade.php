@vite(['resources/js/employment/index.js'])

<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page Header -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Employment</h1>
            </div>

            <!-- Actions -->
            <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <x-dropdown-filter align="right" />
                <x-datepicker />
                <button
                    class="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg class="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                        <path
                            d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span class="max-xs:sr-only">Add View</span>
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div id="loadingIndicator"><x-loading /></div>

        <div id="chartContainer" class="grid grid-cols-12 gap-6 hidden">
            <!-- Charts Utama -->
            <x-employment.gender />
            <x-employment.age />
            <x-employment.status />

            <!-- Organization Chart -->
            <div class="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Distribusi Karyawan Berdasarkan Unit</h2>
                </header>
                <div class="p-3">
                    <div class="overflow-x-auto">
                        <canvas id="organizationChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Tenure Chart -->
            <div class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Masa Kerja</h2>
                </header>
                <div class="p-3">
                    <div class="overflow-x-auto">
                        <canvas id="tenureChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Tenaga Type Chart -->
            <div class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Jenis Tenaga</h2>
                </header>
                <div class="p-3">
                    <div class="overflow-x-auto">
                        <canvas id="tenagaTypeChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Pegawai Non-Permanent Section -->
           <!-- Pegawai Non-Permanent Section -->
<div class="col-span-full bg-white dark:bg-gray-800 shadow-xs rounded-xl">
    <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 class="font-semibold text-gray-800 dark:text-gray-100">Pegawai Non-Permanent</h2>
    </header>
    <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Bar Chart -->
            <div>
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
                    Distribusi Berdasarkan Status
                </h3>
                <div class="h-80">
                    <canvas id="employeeNonPermanentChart"></canvas>
                </div>
            </div>

            <!-- Pie Chart -->
            <div>
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
                    Persentase Pegawai Non-Permanent
                </h3>
                <div class="h-80">
                    <canvas id="employeeNonPermanentPieChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Summary Stats -->
        {{-- <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Non-Permanent</div>
                <div id="totalNonPermanent" class="text-2xl font-bold text-blue-700 dark:text-blue-300">0</div>
                <div class="text-blue-600 dark:text-blue-400 text-xs">Jumlah Pegawai</div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div class="text-green-600 dark:text-green-400 text-sm font-medium">Status OUTSOURCING</div>
                <div id="totalOutsourcing" class="text-2xl font-bold text-green-700 dark:text-green-300">0</div>
                <div class="text-green-600 dark:text-green-400 text-xs">Pegawai Outsourcing</div>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <div class="text-purple-600 dark:text-purple-400 text-sm font-medium">Status Lainnya</div>
                <div id="totalOtherStatus" class="text-2xl font-bold text-purple-700 dark:text-purple-300">0</div>
                <div class="text-purple-600 dark:text-purple-400 text-xs">Status Lain</div>
            </div>
        </div> --}}
    </div>
</div>

        </div>

    </div>

    <!-- Script untuk update summary stats -->
    <script>
        function updateNonPermanentSummary(nonPermanentData) {
            if (!nonPermanentData || !Array.isArray(nonPermanentData)) {
                return;
            }

            const totalNonPermanent = nonPermanentData.length;
            let totalOutsourcing = 0;
            let totalOtherStatus = 0;

            nonPermanentData.forEach(employee => {
                const status = employee.nama_status || 'Tidak Diketahui';
                if (status.includes('OUT SOURCING')) {
                    totalOutsourcing++;
                } else {
                    totalOtherStatus++;
                }
            });

            // Update DOM elements
            document.getElementById('totalNonPermanent').textContent = totalNonPermanent;
            document.getElementById('totalOutsourcing').textContent = totalOutsourcing;
            document.getElementById('totalOtherStatus').textContent = totalOtherStatus;
        }

        // Event listener untuk update summary ketika chart di-render
        document.addEventListener('DOMContentLoaded', function() {
            // Ini akan dipanggil dari parent script setelah data di-load
            window.updateNonPermanentSummary = updateNonPermanentSummary;
        });
    </script>
</x-app-layout>
