// resources/js/employment/tenagaTypeChart.js
import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderTenagaTypeChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Hitung jumlah berdasarkan Jenis Tenaga
    const tenagaTypeCount = data.reduce((acc, curr) => {
        // Cari field "Jenis Tenaga" dalam custom_fields
        const jenisTenagaField = curr.custom_fields?.find(field =>
            field.field_name === 'Jenis Tenaga'
        );

        const jenisTenaga = jenisTenagaField?.value || 'Tidak Terdefinisi';

        // Normalisasi nilai kosong
        const normalizedType = jenisTenaga.trim() === '' ? 'Tidak Terdefinisi' : jenisTenaga;

        acc[normalizedType] = (acc[normalizedType] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(tenagaTypeCount);
    const totals = Object.values(tenagaTypeCount);
    const ctx = document.getElementById('tenagaTypeChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.tenagaTypeChart) {
        chartInstances.tenagaTypeChart.destroy();
    }

    // Warna untuk chart (bisa disesuaikan)
    const backgroundColors = [
        'rgba(99, 102, 241, 0.7)',    // Indigo
        'rgba(248, 113, 113, 0.7)',   // Red
        'rgba(52, 211, 153, 0.7)',    // Green
        'rgba(251, 191, 36, 0.7)',    // Yellow
        'rgba(139, 92, 246, 0.7)',    // Purple
        'rgba(45, 212, 191, 0.7)',    // Teal
        'rgba(148, 163, 184, 0.7)',   // Gray
    ];

    // Buat chart baru
    chartInstances.tenagaTypeChart = new Chart(ctx, {
        type: 'bar', // Bisa diganti 'pie', 'doughnut', dll sesuai preferensi
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false, // Sembunyikan legend untuk bar chart
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.parsed.y} karyawan (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        },
                        precision: 0
                    },
                    grid: {
                        color: isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light
                    }
                }
            }
        }
    });

    // Set background canvas
    chartInstances.tenagaTypeChart.canvas.style.backgroundColor = isDark ?
        chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}
