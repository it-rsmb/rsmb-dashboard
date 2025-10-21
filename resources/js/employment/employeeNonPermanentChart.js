import { chartInstances } from './../chartConfig.js';
import { Chart } from 'chart.js/auto';

export function renderEmployeeNonPermanentChart(nonPermanentData) {
    const ctx = document.getElementById('employeeNonPermanentChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.employeeNonPermanentChart) {
        chartInstances.employeeNonPermanentChart.destroy();
    }

    // Proses data non-permanent dengan grouping OUT SOURCING
    const chartData = processNonPermanentData(nonPermanentData);

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? '#E5E7EB' : '#374151';
    const gridColor = isDark ? '#4B5563' : '#E5E7EB';

    // Warna untuk chart
    const backgroundColors = generateColors(chartData.labels.length);

    chartInstances.employeeNonPermanentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Jumlah Pegawai Non-Permanent',
                data: chartData.values,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Sembunyikan legend karena kita pakai label langsung
                },
                title: {
                    display: true,
                    text: 'Distribusi Pegawai Non-Permanent Berdasarkan Status',
                    color: textColor,
                    font: {
                        size: 16,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#E5E7EB' : '#374151',
                    bodyColor: isDark ? '#E5E7EB' : '#374151',
                    borderColor: isDark ? '#4B5563' : '#D1D5DB',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const total = chartData.values.reduce((sum, val) => sum + val, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `Jumlah: ${value} orang (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        maxRotation: 45
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        precision: 0,
                        callback: function(value) {
                            if (value % 1 === 0) {
                                return value;
                            }
                        }
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Jumlah Pegawai',
                        color: textColor,
                        font: {
                            size: 12,
                            weight: 'bold',
                            family: "'Inter', sans-serif"
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            elements: {
                bar: {
                    borderRadius: 6
                }
            }
        }
    });

    // Tambahkan juga pie chart untuk alternatif view
    renderPieChart(nonPermanentData);
}

// Fungsi untuk memproses data non-permanent dengan grouping OUT SOURCING
function processNonPermanentData(nonPermanentData) {
    const statusCount = {};

    if (!nonPermanentData || !Array.isArray(nonPermanentData)) {
        console.warn('Data non-permanent tidak valid atau kosong');
        return { labels: ['Tidak ada data'], values: [0] };
    }

    nonPermanentData.forEach(employee => {
        let status = employee.nama_status || 'Tidak Diketahui';

        // Grouping semua OUT SOURCING menjadi satu kategori
        if (status.includes('OUT SOURCING')) {
            status = 'OUT SOURCING';
        }

        statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Konversi ke format chart dan urutkan berdasarkan jumlah (descending)
    const sortedEntries = Object.entries(statusCount)
        .sort(([,a], [,b]) => b - a);

    const labels = sortedEntries.map(([label]) => label);
    const values = sortedEntries.map(([,value]) => value);

    return { labels, values, rawData: statusCount };
}

// Fungsi untuk generate warna yang konsisten
function generateColors(count) {
    const colorPalettes = [
        'rgba(54, 162, 235, 0.8)',    // Blue
        'rgba(255, 99, 132, 0.8)',    // Red
        'rgba(75, 192, 192, 0.8)',    // Green
        'rgba(255, 159, 64, 0.8)',    // Orange
        'rgba(153, 102, 255, 0.8)',   // Purple
        'rgba(255, 205, 86, 0.8)',    // Yellow
        'rgba(201, 203, 207, 0.8)',   // Gray
        'rgba(83, 102, 255, 0.8)',    // Indigo
        'rgba(40, 159, 64, 0.8)',     // Dark Green
        'rgba(210, 105, 30, 0.8)'     // Chocolate
    ];

    // Jika butuh lebih banyak warna, generate secara dinamis
    if (count > colorPalettes.length) {
        const additionalColors = [];
        for (let i = colorPalettes.length; i < count; i++) {
            const r = Math.floor(Math.random() * 130) + 100;
            const g = Math.floor(Math.random() * 130) + 100;
            const b = Math.floor(Math.random() * 130) + 100;
            additionalColors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
        }
        return [...colorPalettes, ...additionalColors].slice(0, count);
    }

    return colorPalettes.slice(0, count);
}

// Fungsi untuk membuat pie chart (alternatif view)
function renderPieChart(nonPermanentData) {
    const pieCtx = document.getElementById('employeeNonPermanentPieChart');
    if (!pieCtx) return;

    if (chartInstances.employeeNonPermanentPieChart) {
        chartInstances.employeeNonPermanentPieChart.destroy();
    }

    const chartData = processNonPermanentData(nonPermanentData);
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? '#E5E7EB' : '#374151';

    const backgroundColors = generateColors(chartData.labels.length);

    chartInstances.employeeNonPermanentPieChart = new Chart(pieCtx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Persentase Pegawai Non-Permanent',
                    color: textColor,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} orang (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Fungsi untuk mendapatkan detail data OUT SOURCING
export function getOutsourcingDetail(nonPermanentData) {
    if (!nonPermanentData || !Array.isArray(nonPermanentData)) {
        return {};
    }

    const outsourcingDetail = {};

    nonPermanentData.forEach(employee => {
        const status = employee.nama_status;
        if (status && status.includes('OUT SOURCING')) {
            outsourcingDetail[status] = (outsourcingDetail[status] || 0) + 1;
        }
    });

    return outsourcingDetail;
}

// Fungsi untuk update chart dengan data baru
export function updateEmployeeNonPermanentChart(nonPermanentData) {
    if (chartInstances.employeeNonPermanentChart) {
        const chartData = processNonPermanentData(nonPermanentData);

        chartInstances.employeeNonPermanentChart.data.labels = chartData.labels;
        chartInstances.employeeNonPermanentChart.data.datasets[0].data = chartData.values;

        // Update colors jika jumlah data berubah
        if (chartData.labels.length !== chartInstances.employeeNonPermanentChart.data.labels.length) {
            chartInstances.employeeNonPermanentChart.data.datasets[0].backgroundColor = generateColors(chartData.labels.length);
            chartInstances.employeeNonPermanentChart.data.datasets[0].borderColor = generateColors(chartData.labels.length).map(color => color.replace('0.8', '1'));
        }

        chartInstances.employeeNonPermanentChart.update('none');
    }

    // Update pie chart juga jika ada
    if (chartInstances.employeeNonPermanentPieChart) {
        renderPieChart(nonPermanentData);
    }
}

// Fungsi untuk menghancurkan chart
export function destroyEmployeeNonPermanentChart() {
    if (chartInstances.employeeNonPermanentChart) {
        chartInstances.employeeNonPermanentChart.destroy();
        chartInstances.employeeNonPermanentChart = null;
    }
    if (chartInstances.employeeNonPermanentPieChart) {
        chartInstances.employeeNonPermanentPieChart.destroy();
        chartInstances.employeeNonPermanentPieChart = null;
    }
}

// Export fungsi utilitas untuk digunakan di tempat lain
export { processNonPermanentData };
