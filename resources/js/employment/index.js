import Chart from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';
import { renderGenderChart } from './genderChart.js';
import { renderAgeChart } from './ageChart.js';
import { renderStatusEmployeeChart } from './statusEmployeeChart.js';
import { renderOrganizationChart } from './organizationChart.js';
import { renderTenureChart } from './tenureChart.js';

// Objek untuk menyimpan semua instance chart
export let latestData = [];

// Fungsi untuk update tema chart
export function updateChartTheme() {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Loop melalui semua chart instance
    Object.values(chartInstances).forEach(chart => {
        if (!chart) return;

        // Update legenda
        if (chart.options.plugins.legend?.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }

        // Update tooltip
        if (chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light;
            chart.options.plugins.tooltip.titleColor = isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light;
            chart.options.plugins.tooltip.bodyColor = isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light;
            chart.options.plugins.tooltip.borderColor = isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light;
        }

        // Update scales
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.y.grid.color = gridColor;
            }
        }

        // Update background canvas
        chart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
        chart.update();
    });
}

// Event listener untuk dark mode
document.addEventListener('darkMode', updateChartTheme);

let isFetching = false;
let initialized = false; // Tambahkan flag untuk prevent double initialization

// Fungsi untuk mengambil dan menampilkan data
async function fetchAndDisplayData() {
    // Prevent double request
    if (isFetching) {
        return;
    }

    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        isFetching = true;
        $loading.show();
        $chartContainer.hide();


        // Menggunakan AJAX untuk request ke route Laravel
        const response = await new Promise((resolve, reject) => {
            $.ajax({
                url: '/employment/list',
                method: 'GET',
                dataType: 'json',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    console.log('Request API gagal');
                    reject(new Error(`AJAX Error: ${xhr.status} - ${xhr.statusText}`));
                }
            });
        });

        latestData = response;

        $loading.hide();
        $chartContainer.removeClass('hidden').fadeIn(100, () => {
            renderGenderChart(latestData);
            renderAgeChart(latestData);
            renderStatusEmployeeChart(latestData);
            renderOrganizationChart(latestData);
            renderTenureChart(latestData);
        });

    } catch (error) {
        console.error('Gagal mengambil data:', error);
        $loading.html(`<p class="text-red-600 col-span-12">Error: ${error.message}</p>`);
    } finally {
        isFetching = false;
        console.log('Fetch process completed');
    }
}

// Inisialisasi saat dokumen siap dengan flag
$(document).ready(function() {
    if (!initialized) {
        initialized = true;
        console.log('Document ready, initializing...');
        fetchAndDisplayData();
    } else {
        console.log('Already initialized, skipping...');
    }
});
