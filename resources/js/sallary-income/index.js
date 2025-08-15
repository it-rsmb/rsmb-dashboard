import Chart from 'chart.js/auto';
import { renderSalaryByStatusChart } from './salaryByStatus.js';
import { renderTopDoctorsChart } from './doctorRevenueChart.js';
// Objek untuk menyimpan semua instance chart
export const chartInstances = {
  salaryByStatusChart: null,
  topDoctorsChart: null,

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
export let jasmedData = [];
export let allDoctorsTotal = 0;

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

async function fetchData(url, errorMsg) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${errorMsg}: ${response.status}`);
  }
  return response.json();
}

// Fungsi untuk mengambil dan menampilkan data
async function fetchAndDisplayData() {
    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        $loading.show();
        $chartContainer.hide();

        const apiUrl = import.meta.env.VITE_API_PAYROLL;
        const jasmedUrl = import.meta.env.VITE_API_JASMED;

        if (!apiUrl || !jasmedUrl) {
            throw new Error('API URL tidak ditemukan di environment variables');
        }

        const [payrollResponse, jasmedResponse] = await Promise.all([
            fetchData(apiUrl, 'Gagal mengambil data payroll'),
            fetchData(jasmedUrl, 'Gagal mengambil data attendance')
        ]);

        latestData = payrollResponse.data;
        jasmedData = jasmedResponse;

        console.log('Data payroll:', latestData);
        console.log('Data attendance:', jasmedData);

        $loading.hide();
        $chartContainer.removeClass('hidden').fadeIn(100, () => {
            renderSalaryByStatusChart(latestData);
            renderDoctorCharts(jasmedData); // Pindahkan logika dokter ke fungsi terpisah
        });

    } catch (error) {
        console.error('Gagal mengambil data:', error);
        $loading.html(`<p class="text-red-600 col-span-12">Error: ${error.message}</p>`);
    }
}


function renderDoctorCharts(jasmedData) {
    // Filter dan proses data dokter
    const validData = jasmedData
        .filter(item => item.Dokter && item.Dokter.trim() !== '')
        .map(item => ({
            ...item,
            Jasa_DR: Number(item.Jasa_DR) || 0,
            Total_Bill: Number(item.Total_Bill) || 0,
            Gross: Number(item.Gross) || 0,
            AP_Dokter: Number(item.AP_Dokter) || 0
        }));

    // Hitung total semua dokter
    allDoctorsTotal = validData.reduce((sum, doctor) => sum + doctor.Jasa_DR, 0);

    // Ambil 5 dokter teratas
    const topDoctors = validData
        .sort((a, b) => b.Jasa_DR - a.Jasa_DR)
        .slice(0, 5);

    renderTopDoctorsChart(topDoctors, allDoctorsTotal);
}

// Inisialisasi saat dokumen siap
$(document).ready(fetchAndDisplayData);
