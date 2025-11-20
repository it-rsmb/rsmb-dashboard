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

            <!-- Detail Status (Menggantikan Pie Chart) -->
            <div>
                <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">
                    Detail Jumlah Pegawai per Status
                </h3>
                <div class="h-80 overflow-y-auto">
                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 gap-4 mb-6">
                        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Total Non-Permanent
                                    </p>
                                    <p class="text-2xl font-bold text-blue-900 dark:text-blue-100" id="totalNonPermanent">
                                        0
                                    </p>
                                </div>
                                <div class="text-blue-600 dark:text-blue-400">
                                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status List -->
                    <div class="space-y-3" id="statusListContainer">
                        <!-- Data akan diisi oleh JavaScript -->
                        <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                            <svg class="mx-auto w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <p>Loading data...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
