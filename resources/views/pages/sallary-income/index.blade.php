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

    .form-select {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
</style>

<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page Header -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Sallary Income</h1>
                <div id="currentPeriodDisplay" class="text-lg text-gray-600 dark:text-gray-400 mt-1"></div>
                <div id="periodInfo" class="text-sm mt-1"></div>
            </div>

            <!-- Actions -->
            <div class="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <!-- Period Filter -->
                <div class="flex items-center space-x-2">
                    <label for="periodSelect" class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Pilih Periode:
                    </label>
                    <div id="periodFilter" class="w-48">
                        <!-- Dropdown akan diisi oleh JavaScript -->
                    </div>
                </div>

                <x-dropdown-filter align="right" />
                {{-- <x-datepicker /> --}}

                <button class="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg class="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span class="max-xs:sr-only">Add View</span>
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div id="loadingIndicator"><x-loading /></div>

        <!-- 🆕 Chart Container akan diisi secara dynamic oleh JavaScript -->
        <div id="chartContainer" class="grid grid-cols-12 gap-6 hidden">
            <!-- Chart containers akan dibuat secara dynamic -->
        </div>

    </div>
</x-app-layout>
