import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderAgeChart(data) {

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung usia dari personal.birth_date
    const ages = data
        .map(item => {
            if (!item.personal?.birth_date) return null;

            try {
                const birthDate = new Date(item.personal.birth_date);
                if (isNaN(birthDate.getTime())) return null;

                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();

                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18 || age > 70) return null;

                return age;
            } catch (error) {
                console.warn('Error parsing birth date:', item.personal.birth_date, error);
                return null;
            }
        })
        .filter(age => age !== null && !isNaN(age));


    // Jika tidak ada data usia yang valid
    if (ages.length === 0) {
        const ctx = document.getElementById('ageChart').getContext('2d');

        if (chartInstances.ageChart) {
            chartInstances.ageChart.destroy();
        }

        chartInstances.ageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Tidak ada data usia',
                    data: [0],
                    backgroundColor: 'rgba(156, 163, 175, 0.6)',
                    borderColor: 'rgba(156, 163, 175, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Tambahkan ini
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    title: {
                        display: true,
                        text: 'Tidak ada data usia yang tersedia',
                        color: textColor
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
        return;
    }

    // Kelompokkan usia ke range 5 tahun
    const ageGroups = {};
    ages.forEach(age => {
        const lower = Math.floor(age / 5) * 5;
        const upper = lower + 4;
        const label = `${lower}-${upper}`;
        ageGroups[label] = (ageGroups[label] || 0) + 1;
    });

    // Urutkan label
    const labels = Object.keys(ageGroups).sort((a, b) => {
        return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]);
    });
    const totals = labels.map(label => ageGroups[label]);


    const ctx = document.getElementById('ageChart').getContext('2d');

    if (chartInstances.ageChart) {
        chartInstances.ageChart.destroy();
    }

    // Kembalikan ke konfigurasi tinggi chart seperti sebelumnya
    chartInstances.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: 'rgba(96, 165, 250, 0.6)',
                borderColor: 'rgba(96, 165, 250, 1)',
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
                categoryPercentage: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Kembalikan ke true seperti sebelumnya
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
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });

    // Set background canvas
    chartInstances.ageChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;

    console.log('Age chart rendered successfully');
}
