import { renderSalaryByStatusChart, cleanupSalaryChart, renderOrganizationSalaryChart } from './salaryByStatus.js';

// Data terbaru
export let latestData = [];
export let currentPeriod = '';

// ⚠️ CRITICAL: Single source of truth untuk prevent multiple calls
let isFetching = false;
let isInitialized = false;

// 🆕 Default period ke 2025-09
const DEFAULT_PERIOD = '2025-09';

// Fungsi untuk mendapatkan period
function getCurrentPeriod() {
    return DEFAULT_PERIOD;
}

// Enhanced AJAX function dengan better response handling
function fetchDataAjax(url, errorMsg, params = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            data: params,
            timeout: 30000,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                console.log('📥 Raw API Response:', response);

                if (Array.isArray(response)) {
                    resolve(response);
                }
                else if (response && Array.isArray(response.data)) {
                    resolve(response.data);
                }
                else {
                    console.warn('⚠️ Response format tidak dikenali, default ke array kosong');
                    resolve([]);
                }
            },
            error: function(xhr, status, error) {
                let errorMessage = `${errorMsg}: ${xhr.status} - ${error}`;

                if (xhr.status === 0) {
                    errorMessage = 'Koneksi terputus. Periksa koneksi internet Anda.';
                } else if (xhr.status === 404) {
                    errorMessage = 'Endpoint tidak ditemukan.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
                } else if (status === 'timeout') {
                    errorMessage = 'Request timeout. Server terlalu lama merespon.';
                }

                reject(new Error(errorMessage));
            }
        });
    });
}

// 🆕 Fungsi untuk membuat chart containers dynamically
function createChartContainers() {
    const $chartContainer = $('#chartContainer');

    // Hapus konten sebelumnya jika ada
    $chartContainer.empty();

    const chartHtml = `
        <!-- Chart Gaji by Status -->
        <div id="statusChartContainer" class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 class="font-semibold text-gray-800 dark:text-gray-100">Average Salary by Status</h2>
            </header>
            <div class="p-3">
                <div class="chart-container" style="height: 400px; position: relative;">
                    <canvas id="salaryByStatusChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Chart Gaji by Organization -->
        <div id="organizationChartContainer" class="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
            <header class="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 class="font-semibold text-gray-800 dark:text-gray-100">Salary by Department</h2>
            </header>
            <div class="p-3">
                <div class="chart-container" style="height: 400px; position: relative;">
                    <canvas id="organizationSalaryChart"></canvas>
                </div>
            </div>
        </div>
    `;

    $chartContainer.html(chartHtml);
}

// Enhanced main function dengan better data handling
async function fetchAndDisplayData(period = null, isRetry = false) {
    if (isFetching) {
        console.log('⏸️ Already fetching data, skipping...');
        return;
    }

    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        isFetching = true;
        console.log('🚀 Starting fetch process...', { period, isRetry, isInitialized });

        $loading.show();
        $chartContainer.hide();

        const previousPeriod = currentPeriod;
        currentPeriod = period || getCurrentPeriod();

        console.log('📊 Fetching data for period:', currentPeriod);

        const payrollUrl = '/payroll/chart';

        const payrollResponse = await fetchDataAjax(
            payrollUrl,
            'Gagal mengambil data payroll',
            { period: currentPeriod }
        );

        latestData = Array.isArray(payrollResponse) ? payrollResponse : [];

        console.log('✅ Data fetched successfully:', {
            period: currentPeriod,
            recordCount: latestData.length
        });

        updatePeriodDisplay(currentPeriod, latestData.length);

        if (!isRetry) {
            cleanupSalaryChart();
        }

        $loading.hide();

        if (latestData.length === 0) {
            console.warn('⚠️ No data available for period:', currentPeriod);
            showNoDataMessage(currentPeriod, previousPeriod);
            return;
        }

        // 🆕 Create chart containers sebelum render
        createChartContainers();
        $chartContainer.removeClass('hidden').show();

        // 🎯 FIXED: Tunggu DOM update sebelum render chart
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('🎨 Rendering charts...');

        // 🆕 Check jika canvas elements sudah tersedia
        const statusCanvas = document.getElementById('salaryByStatusChart');
        const orgCanvas = document.getElementById('organizationSalaryChart');

        if (!statusCanvas) {
            console.error('❌ Status chart canvas not found after creation');
            return;
        }
        if (!orgCanvas) {
            console.error('❌ Organization chart canvas not found after creation');
            return;
        }

        console.log('✅ Canvas elements found, proceeding with chart rendering');

        renderSalaryByStatusChart(latestData, currentPeriod);
        renderOrganizationSalaryChart(latestData, currentPeriod);

        console.log('✅ Charts rendered successfully');

    } catch (error) {
        console.error('❌ Gagal mengambil data:', error);
        showErrorMessage(error.message);
    } finally {
        isFetching = false;
        console.log('🏁 Fetch process completed');
    }
}

// Enhanced function untuk menampilkan pesan tidak ada data
function showNoDataMessage(period, previousPeriod = null) {
    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    $loading.hide();

    const noDataHtml = `
        <div class="col-span-12">
            <div class="text-center py-12">
                <div class="max-w-md mx-auto">
                    <div class="text-6xl mb-4">📭</div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Data Tidak Ditemukan
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                        Tidak ada data payroll untuk periode <strong>${formatPeriodDisplay(period)}</strong>.
                    </p>
                    <div class="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-4">
                        <p class="font-medium mb-2">💡 Data tersedia untuk periode:</p>
                        <ul class="text-left list-disc list-inside space-y-1">
                            <li>Agustus 2025</li>
                            <li>September 2025</li>
                        </ul>
                    </div>
                    ${previousPeriod ? `
                        <button onclick="reloadDataWithPeriod('${previousPeriod}')"
                                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                            ↩️ Kembali ke ${formatPeriodDisplay(previousPeriod)}
                        </button>
                    ` : `
                        <button onclick="reloadDataWithPeriod('2025-09')"
                                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                            📅 Load Data September 2025
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    $chartContainer.html(noDataHtml).removeClass('hidden').show();
}

// Fungsi untuk menampilkan error
function showErrorMessage(message) {
    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    $loading.hide();

    const errorHtml = `
        <div class="col-span-12">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <span class="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                            Gagal Memuat Data
                        </h3>
                        <div class="mt-2 text-sm text-red-700 dark:text-red-400">
                            <p>${message}</p>
                        </div>
                        <div class="mt-4 flex space-x-3">
                            <button onclick="window.fetchAndDisplayData('${currentPeriod}', true)"
                                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                                🔄 Coba Lagi
                            </button>
                            <button onclick="reloadDataWithPeriod('2025-09')"
                                    class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                                📅 Load September 2025
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $chartContainer.html(errorHtml).removeClass('hidden').show();
}

// Helper function untuk format period display
function formatPeriodDisplay(period) {
    const [year, month] = period.split('-');
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${year}`;
}

// Enhanced period display function
function updatePeriodDisplay(period, recordCount = 0) {
    const periodDisplay = document.getElementById('currentPeriodDisplay');
    const periodInfo = document.getElementById('periodInfo');

    if (periodDisplay) {
        periodDisplay.textContent = formatPeriodDisplay(period);
    }

    if (periodInfo) {
        if (recordCount > 0) {
            periodInfo.textContent = `(Menampilkan ${recordCount} records untuk periode ${formatPeriodDisplay(period)})`;
            periodInfo.className = 'text-green-600 dark:text-green-400 text-sm mt-1';
        } else {
            periodInfo.textContent = `(Tidak ada data untuk periode ${formatPeriodDisplay(period)})`;
            periodInfo.className = 'text-amber-600 dark:text-amber-400 text-sm mt-1';
        }
    }

    const periodSelect = document.getElementById('periodSelect');
    if (periodSelect) {
        periodSelect.value = period;
    }
}

// Fungsi untuk membuat dropdown period
function initializePeriodFilter() {
    const availablePeriods = getAvailablePeriods();
    const periodFilterContainer = document.getElementById('periodFilter');

    if (!periodFilterContainer) return;

    const selectHtml = `
        <select id="periodSelect" class="form-select bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white w-full">
            ${availablePeriods.map(period => `
                <option value="${period.value}" ${period.value === DEFAULT_PERIOD ? 'selected' : ''}>
                    ${period.label} ${period.hasData ? '✅' : '❌'}
                </option>
            `).join('')}
        </select>
    `;

    periodFilterContainer.innerHTML = selectHtml;

    document.getElementById('periodSelect').addEventListener('change', function(e) {
        const selectedPeriod = e.target.value;
        console.log('🔄 Period changed to:', selectedPeriod);
        reloadDataWithPeriod(selectedPeriod);
    });
}

function reloadDataWithPeriod(period) {
    console.log('🔄 Reloading data with new period:', period);

    if (!period || !period.match(/^\d{4}-\d{2}$/)) {
        showErrorMessage('Format periode tidak valid. Gunakan format YYYY-MM');
        return;
    }

    fetchAndDisplayData(period);
}

function getAvailablePeriods() {
    const periodsWithData = ['2025-08', '2025-09'];

    const periods = [];
    const currentYear = 2025;

    for (let month = 1; month <= 12; month++) {
        const year = currentYear;
        const monthFormatted = String(month).padStart(2, '0');
        const periodValue = `${year}-${monthFormatted}`;

        periods.push({
            value: periodValue,
            label: formatPeriodDisplay(periodValue),
            hasData: periodsWithData.includes(periodValue)
        });
    }

    for (let month = 9; month <= 12; month++) {
        const year = 2024;
        const monthFormatted = String(month).padStart(2, '0');
        const periodValue = `${year}-${monthFormatted}`;

        periods.push({
            value: periodValue,
            label: formatPeriodDisplay(periodValue),
            hasData: periodsWithData.includes(periodValue)
        });
    }

    return periods.sort((a, b) => b.value.localeCompare(a.value));
}

function initializeApp() {
    if (isInitialized) {
        console.log('⚠️ App already initialized, skipping...');
        return;
    }

    isInitialized = true;
    console.log('📱 Initializing application...');

    initializePeriodFilter();
    cleanupSalaryChart();

    setTimeout(() => {
        fetchAndDisplayData();
    }, 100);
}

$(document).ready(function() {
    console.log('📄 Document ready, setting up initialization...');
    initializeApp();
});

export { fetchAndDisplayData, getCurrentPeriod, DEFAULT_PERIOD };

window.fetchAndDisplayData = fetchAndDisplayData;
window.reloadDataWithPeriod = reloadDataWithPeriod;
