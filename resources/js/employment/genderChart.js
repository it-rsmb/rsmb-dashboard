// resources/js/employment/genderChart.js
import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderGenderChart(data) {
    console.log('renderGenderChart dipanggil dengan data:', data.length, 'records');

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Hitung jumlah berdasarkan gender
    const genderCount = data.reduce((acc, curr) => {
        const gender = curr.personal?.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {});

    console.log('Gender distribution:', genderCount);

    const labels = Object.keys(genderCount);
    const totals = Object.values(genderCount);
    const ctx = document.getElementById('genderChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.genderChart) {
        console.log('Destroying previous gender chart');
        chartInstances.genderChart.destroy();
    }

    // Buat chart baru
    chartInstances.genderChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(248, 113, 113, 0.7)',
                    'rgba(52, 211, 153, 0.7)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(248, 113, 113, 1)',
                    'rgba(52, 211, 153, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
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
    chartInstances.genderChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;

    console.log('Gender chart rendered successfully');
}
