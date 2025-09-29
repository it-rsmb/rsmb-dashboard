import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderStatusEmployeeChart(data) {
    console.log('renderStatusEmployeeChart dipanggil dengan data:', data.length, 'records');

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Hitung jumlah berdasarkan employment_status dan kelompokkan
    const statusCount = data.reduce((acc, curr) => {
        // Akses dari employment.employment_status
        let status = curr.employment?.employment_status || 'Unknown';

        // Kelompokkan: selain "Permanent" masukkan ke "KONTRAK"
        if (status !== 'Permanent') {
            status = 'KONTRAK';
        }

        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    console.log('Status distribution:', statusCount);

    // Warna dan label yang telah ditentukan
    const statusLabels = ['Permanent', 'KONTRAK'];
    const colors = {
        'Permanent': 'rgba(59, 130, 246, 0.7)',
        'KONTRAK': 'rgba(239, 68, 68, 0.7)'
    };
    const borderColors = {
        'Permanent': 'rgba(59, 130, 246, 1)',
        'KONTRAK': 'rgba(239, 68, 68, 1)'
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
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} karyawan (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '50%'
        }
    });

    // Set background canvas
    chartInstances.statusEmployeeChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;

    console.log('Status Employee chart rendered successfully');
}
