@vite(['resources/js/master-data/employees/index.js'])



<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

        <!-- Page Header -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Empoyees</h1>
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

        <button id="generateBtn" class="btn btn-primary" data-url="{{ route('generateData') }}">
            Generate Data
        </button>

        <div class="container mx-auto p-6">
            <h2 class="text-2xl font-bold mb-4">Daftar Employee</h2>
            <div class="overflow-x-auto">
                <table id="employeeTable" class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-2 text-left">No</th>
                            <th class="px-4 py-2 text-left">Name</th> <!-- Ganti dari Full Name ke Name -->
                            <th class="px-4 py-2 text-left">Email</th>
                            <th class="px-4 py-2 text-left">ID Pegawai</th>
                            <th class="px-4 py-2 text-left">Created At</th>
                            <th class="px-4 py-2 text-left">Updated At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <!-- Data akan diisi otomatis oleh DataTables -->
                    </tbody>
                </table>
            </div>
        </div>



    </div>
</x-app-layout>
