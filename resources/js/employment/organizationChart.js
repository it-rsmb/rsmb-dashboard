import { Chart, chartTheme, chartInstances } from './index.js';

export function renderOrganizationChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung jumlah karyawan per organisasi
    const orgCount = data.reduce((acc, curr) => {
        const org = curr.organization || 'Unknown';
        acc[org] = (acc[org] || 0) + 1;
        return acc;
    }, {});

    // Urutkan dari yang terbesar
    const sortedOrgs = Object.entries(orgCount)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedOrgs.map(item => item[0]);
    const totals = sortedOrgs.map(item => item[1]);

    // Warna untuk chart (bisa disesuaikan)
    const backgroundColors = [
        'rgba(59, 130, 246, 0.7)',  // Biru
        'rgba(16, 185, 129, 0.7)',  // Hijau
        'rgba(239, 68, 68, 0.7)',   // Merah
        'rgba(249, 115, 22, 0.7)',  // Oranye
        'rgba(139, 92, 246, 0.7)',  // Ungu
        'rgba(20, 184, 166, 0.7)',  // Teal
        'rgba(107, 114, 128, 0.7)'  // Abu-abu
    ];

    const ctx = document.getElementById('organizationChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.organizationChart) {
        chartInstances.organizationChart.destroy();
    }

    // Buat chart baru (gunakan bar chart)
    chartInstances.organizationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',  // Horizontal bar chart
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });

    // Set background canvas
    chartInstances.organizationChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}
