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
            <x-employment.gender />
            <x-employment.age />
            <x-employment.status />



            <div class="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Distribution by Organization</h2>
                </header>
                <div class="p-3">


                    <div class="overflow-x-auto">
                        <canvas id="organizationChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>


            <div
                class="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                    <h2 class="font-semibold text-gray-800 dark:text-gray-100">Employment Status</h2>
                </header>
                <div class="grow flex flex-col justify-center mt-1">
                    <div>
                        <canvas id="tenureChart" width="389" height="350"></canvas>
                    </div>
                    <div class="px-5 pt-2 pb-6">
                        <ul id="tenureChart" class="flex flex-wrap justify-center -m-1"></ul>
                    </div>
                </div>
            </div>




        </div>

    </div>
</x-app-layout>
