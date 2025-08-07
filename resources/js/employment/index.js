import Chart from 'chart.js/auto';
import { renderGenderChart } from './genderChart.js';
import { renderAgeChart } from './ageChart.js';
import { renderStatusEmployeeChart } from './statusEmployeeChart.js';
import { renderOrganizationChart } from './organizationChart.js';
import { renderTenureChart } from './tenureChart.js';

// Objek untuk menyimpan semua instance chart
export const chartInstances = {
  genderChart: null,
  ageChart: null,
  statusEmployeeChart: null,
  organizationChart: null,
  tenureChart: null
};

export { Chart };
// Konfigurasi tema chart
export const chartTheme = {
    textColor: {
        light: '#1f2937',
        dark: '#e5e7eb'
    },
    gridColor: {
        light: '#e5e7eb',
        dark: 'rgba(255,255,255,0.05)'
    },
    tooltipBg: {
        light: '#ffffff',
        dark: '#1f2937'
    },
    tooltipTitleColor: {
        light: '#111827',
        dark: '#f9fafb'
    },
    tooltipBodyColor: {
        light: '#374151',
        dark: '#d1d5db'
    },
    tooltipBorderColor: {
        light: '#d1d5db',
        dark: '#4b5563'
    },
    backgroundCanvas: {
        light: '#ffffff',
        dark: '#1f2937'
    }
};

// Data terbaru
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

// Fungsi untuk mengambil dan menampilkan data
async function fetchAndDisplayData() {
    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        $loading.show();
        $chartContainer.hide();

        const response = await fetch('https://script.google.com/macros/s/AKfycbykwLZNxCF6blJ-16opGLbluqEG3U5ijpUd7tx_5D43v3SIFeqzhzdtYps6xEDQ-WdI/exec');
        latestData = await response.json();

        console.log('Data terbaru:', latestData);


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
        $loading.html('<p class="text-red-600 col-span-12">Gagal mengambil data dari server.</p>');
    }
}

// Inisialisasi saat dokumen siap
$(document).ready(fetchAndDisplayData);
