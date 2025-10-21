import Chart from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';
import { renderGenderChart } from './genderChart.js';
import { renderAgeChart } from './ageChart.js';
import { renderStatusEmployeeChart } from './statusEmployeeChart.js';
import { renderOrganizationChart } from './organizationChart.js';
import { renderTenureChart } from './tenureChart.js';
import { renderTenagaTypeChart } from './tenagaTypeChart.js';
import { renderEmployeeNonPermanentChart } from './employeeNonPermanentChart.js';

// Objek untuk menyimpan semua instance chart
export let latestData = [];
export let latestNonPermanentData = []; // Tambahkan untuk data non-permanent

// Fungsi untuk update tema chart
export function updateChartTheme() {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Loop melalui semua chart instance
    Object.values(chartInstances).forEach(chart => {
        if (!chart) return;

        // Update legenda
        if (chart.options.plugins?.legend?.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }

        // Update tooltip
        if (chart.options.plugins?.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light;
            chart.options.plugins.tooltip.titleColor = isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light;
            chart.options.plugins.tooltip.bodyColor = isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light;
            chart.options.plugins.tooltip.borderColor = isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light;
        }

        // Update scales
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
                if (chart.options.scales.x.grid) {
                    chart.options.scales.x.grid.color = gridColor;
                }
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                if (chart.options.scales.y.grid) {
                    chart.options.scales.y.grid.color = gridColor;
                }
            }
        }

        // Update background canvas
        if (chart.canvas) {
            chart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
        }

        chart.update();
    });
}

// Event listener untuk dark mode
document.addEventListener('darkMode', updateChartTheme);

let isFetching = false;
let initialized = false;

// Fungsi untuk mengambil data dari API
async function fetchData(url, endpointName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                console.log(`Success fetching ${endpointName}:`, response.length || response);
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error(`Request API ${endpointName} gagal:`, error);
                reject(new Error(`AJAX Error ${endpointName}: ${xhr.status} - ${xhr.statusText}`));
            }
        });
    });
}

// Fungsi untuk mengambil dan menampilkan data
async function fetchAndDisplayData() {
    // Prevent double request
    if (isFetching) {
        console.log('Request already in progress, skipping...');
        return;
    }

    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        isFetching = true;
        console.log('Starting data fetch...');

        $loading.show();
        $chartContainer.hide();

        // Fetch data dari kedua endpoint secara parallel
        const [employmentData, nonPermanentData] = await Promise.all([
            fetchData('/employment/list', 'employment'),
            fetchData('/master-data/list-non-permanent', 'non-permanent')
        ]);

        latestData = employmentData || [];
        latestNonPermanentData = nonPermanentData || [];

        console.log('Data fetched successfully:', {
            employment: latestData.length,
            nonPermanent: latestNonPermanentData.length
        });

        $loading.hide();

        // Pastikan chart container visible sebelum render
        $chartContainer.removeClass('hidden').show();

        // Render semua chart secara sequential untuk menghindari race condition
        await renderAllCharts();

    } catch (error) {
        console.error('Gagal mengambil data:', error);
        $loading.html(`<p class="text-red-600 col-span-12">Error: ${error.message}</p>`);
        $chartContainer.hide();
    } finally {
        isFetching = false;
        console.log('Fetch process completed');
    }
}

// Fungsi untuk render semua chart
async function renderAllCharts() {
    try {
        // Tunggu sedikit untuk memastikan DOM siap
        await new Promise(resolve => setTimeout(resolve, 100));

        // Cek elemen canvas tersedia sebelum render
        const chartsToRender = [
            { name: 'Gender Chart', render: () => renderGenderChart(latestData), element: 'genderChart' },
            { name: 'Age Chart', render: () => renderAgeChart(latestData), element: 'ageChart' },
            { name: 'Non Permanent Chart', render: () => renderEmployeeNonPermanentChart(latestNonPermanentData), element: 'employeeNonPermanentChart' },
            { name: 'Status Employee Chart', render: () => renderStatusEmployeeChart(latestData), element: 'statusEmployeeChart' },
            { name: 'Organization Chart', render: () => renderOrganizationChart(latestData), element: 'organizationChart' },
            { name: 'Tenure Chart', render: () => renderTenureChart(latestData), element: 'tenureChart' },
            { name: 'Tenaga Type Chart', render: () => renderTenagaTypeChart(latestData), element: 'tenagaTypeChart' }
        ];

        for (const chart of chartsToRender) {
            const element = document.getElementById(chart.element);
            if (element) {
                console.log(`Rendering ${chart.name}...`);
                chart.render();
            } else {
                console.warn(`Canvas element for ${chart.name} not found`);
            }
        }

        console.log('All charts rendered successfully');

    } catch (error) {
        console.error('Error rendering charts:', error);
    }
}

// Fungsi untuk refresh data manual
export async function refreshData() {
    console.log('Manual refresh triggered');
    await fetchAndDisplayData();
}

// Error handling global untuk chart
window.addEventListener('error', function(e) {
    if (e.message.includes('Chart') || e.filename.includes('chart')) {
        console.error('Chart error detected:', e.error);
    }
});

// Inisialisasi saat dokumen siap dengan flag
$(document).ready(function() {
    if (!initialized) {
        initialized = true;
        console.log('Document ready, initializing charts...');

        // Tunggu sedikit untuk memastikan semua resource loaded
        setTimeout(() => {
            fetchAndDisplayData();
        }, 100);

    } else {
        console.log('Already initialized, skipping...');
    }
});




// Export fungsi untuk akses external jika needed
export { fetchAndDisplayData };



// Di parent script, tambahkan fungsi:
export function updateNonPermanentSummary(nonPermanentData) {
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
    const totalNonPermanentElem = document.getElementById('totalNonPermanent');
    const totalOutsourcingElem = document.getElementById('totalOutsourcing');
    const totalOtherStatusElem = document.getElementById('totalOtherStatus');

    if (totalNonPermanentElem) totalNonPermanentElem.textContent = totalNonPermanent;
    if (totalOutsourcingElem) totalOutsourcingElem.textContent = totalOutsourcing;
    if (totalOtherStatusElem) totalOtherStatusElem.textContent = totalOtherStatus;

    console.log('Summary updated:', { totalNonPermanent, totalOutsourcing, totalOtherStatus });
}

// Kemudian panggil setelah render chart
$chartContainer.removeClass('hidden').fadeIn(100, () => {
    renderGenderChart(latestData);
    renderAgeChart(latestData);
    renderEmployeeNonPermanentChart(latestNonPermanentData);
    renderStatusEmployeeChart(latestData);
    renderOrganizationChart(latestData);
    renderTenureChart(latestData);
    renderTenagaTypeChart(latestData);

    // Panggil fungsi summary
    updateNonPermanentSummary(latestNonPermanentData);
});
