import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderOrganizationChart(data) {
    console.log('renderOrganizationChart dipanggil dengan data:', data.length, 'records');

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung jumlah karyawan per organisasi - akses dari employment.organization_name
    const orgCount = data.reduce((acc, curr) => {
        const org = curr.employment?.organization_name || 'Unknown';
        acc[org] = (acc[org] || 0) + 1;
        return acc;
    }, {});

    console.log('Organization distribution:', orgCount);

    // Urutkan dari yang terbesar dan ambil top 10
    const sortedOrgs = Object.entries(orgCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sortedOrgs.map(item => {
        const orgName = item[0];
        return orgName.length > 30 ? orgName.substring(0, 30) + '...' : orgName;
    });
    const totals = sortedOrgs.map(item => item[1]);

    // Warna untuk chart
    const backgroundColors = [
        'rgba(59, 130, 246, 0.7)',   // Biru
        'rgba(16, 185, 129, 0.7)',   // Hijau
        'rgba(239, 68, 68, 0.7)',    // Merah
        'rgba(249, 115, 22, 0.7)',   // Oranye
        'rgba(139, 92, 246, 0.7)',   // Ungu
        'rgba(20, 184, 166, 0.7)',   // Teal
        'rgba(236, 72, 153, 0.7)',   // Pink
        'rgba(101, 163, 13, 0.7)',   // Lime
        'rgba(180, 83, 9, 0.7)',     // Amber
        'rgba(107, 114, 128, 0.7)'   // Gray
    ];

    const ctx = document.getElementById('organizationChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.organizationChart) {
        chartInstances.organizationChart.destroy();
    }

    // Buat chart baru dengan tinggi seperti sebelumnya
    chartInstances.organizationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, labels.length),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,    // Kembali ke setting sebelumnya
                categoryPercentage: 0.5 // Kembali ke setting sebelumnya
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // KEMBALIKAN KE true untuk tinggi normal
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return sortedOrgs[index][0];
                        },
                        label: function(context) {
                            const value = context.raw;
                            const total = data.length;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} karyawan (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1,
                        font: {
                            size: 12
                        }
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

    console.log('Organization chart rendered successfully dengan tinggi normal');
}
