@vite(['resources/js/sallary-income/index.js'])

<style>
    .chart-container {
    width: 100%;
    min-height: 300px;
}

.chart-container canvas {
    width: 100% !important;
    height: 100% !important;
}

.revenue-summary {
    font-size: 0.875rem;
}

.revenue-summary .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.dark .revenue-summary .summary-row {
    border-bottom-color: #374151;
}

.revenue-summary .summary-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.revenue-summary strong {
    color: #3b82f6;
    font-weight: 500;
}

.dark .revenue-summary {
    color: #e5e7eb;
}
</style>

<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page Header -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Sallary Income</h1>
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
            <!-- Chart Gaji -->
            <div class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Average Salary by Status</h2>
                </header>
                <div class="p-3">
                    <div class="chart-container" style="height: 400px; position: relative;">
                        <canvas id="salaryByStatusChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Chart Dokter -->
            <div class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Top 5 Doctors by Revenue</h2>
                </header>
                <div class="p-3 flex flex-col gap-4">
                    <div class="chart-container" style="height: 350px; position: relative;">
                        <canvas id="topDoctorsChart"></canvas>
                    </div>
                    <div id="revenueSummary" class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg"></div>
                </div>
            </div>
        </div>

    </div>
</x-app-layout>
