import { Chart, chartTheme, chartInstances } from './index.js';

export function renderStatusEmployeeChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Hitung jumlah berdasarkan status karyawan
    const statusCount = data.reduce((acc, curr) => {
        const status = curr.status_employee || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Warna dan label yang telah ditentukan
    const statusLabels = ['Permanent', 'CAPEG', 'KONTRAK 2', 'Unknown'];
    const colors = {
        'Permanent': 'rgba(59, 130, 246, 0.7)',
        'CAPEG': 'rgba(16, 185, 129, 0.7)',
        'KONTRAK 2': 'rgba(239, 68, 68, 0.7)',
        'Unknown': 'rgba(107, 114, 128, 0.7)'
    };
    const borderColors = {
        'Permanent': 'rgba(59, 130, 246, 1)',
        'CAPEG': 'rgba(16, 185, 129, 1)',
        'KONTRAK 2': 'rgba(239, 68, 68, 1)',
        'Unknown': 'rgba(107, 114, 128, 1)'
    };

    // Filter hanya label yang ada datanya
    const labels = statusLabels.filter(label => statusCount[label]);
    const totals = labels.map(label => statusCount[label]);
    const backgroundColor = labels.map(label => colors[label]);
    const borderColor = labels.map(label => borderColors[label]);

    const ctx = document.getElementById('statusEmployeeChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.statusEmployeeChart) {
        chartInstances.statusEmployeeChart.destroy();
    }

    // Buat chart baru
    chartInstances.statusEmployeeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1
                }
            }
        }
    });

    // Set background canvas
    chartInstances.statusEmployeeChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}
