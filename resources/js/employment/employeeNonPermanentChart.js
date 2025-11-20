import { chartInstances } from './../chartConfig.js';
import { Chart } from 'chart.js/auto';

// Mapping jenis tenaga
const JENIS_TENAGA_MAPPING = {
    '1': 'Non Medis',
    '2': 'Perawat',
    '3': 'Medis',
    '4': 'Bidan',
    '5': 'Penunjang Medis'
};

export function renderEmployeeNonPermanentChart(nonPermanentData) {
    const ctx = document.getElementById('employeeNonPermanentChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.employeeNonPermanentChart) {
        chartInstances.employeeNonPermanentChart.destroy();
    }

    // Proses data non-permanent dengan grouping OUT SOURCING dan kumpulkan data jenis_tenaga
    const { chartData, tenagaData } = processNonPermanentDataWithTenaga(nonPermanentData);

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
                    display: false
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
                        },
                        afterLabel: function(context) {
                            const statusIndex = context.dataIndex;
                            const statusLabel = chartData.labels[statusIndex];
                            const tenagaInfo = tenagaData[statusLabel];

                            if (!tenagaInfo || Object.keys(tenagaInfo).length === 0) {
                                return 'Jenis Tenaga: Tidak ada data';
                            }

                            // Buat string detail jenis tenaga dengan label
                            const tenagaDetails = Object.entries(tenagaInfo)
                                .map(([jenisKey, count]) => {
                                    const jenisLabel = JENIS_TENAGA_MAPPING[jenisKey] || `Tidak Diketahui (${jenisKey})`;
                                    return `${jenisLabel}: ${count} orang`;
                                })
                                .join('\n');

                            return `Jenis Tenaga:\n${tenagaDetails}`;
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

    // Tampilkan detail status
    renderStatusDetail(nonPermanentData);
}

// Fungsi untuk memproses data non-permanent dengan mengumpulkan informasi jenis_tenaga
function processNonPermanentDataWithTenaga(nonPermanentData) {
    const statusCount = {};
    const tenagaByStatus = {};

    if (!nonPermanentData || !Array.isArray(nonPermanentData)) {
        console.warn('Data non-permanent tidak valid atau kosong');
        return {
            chartData: { labels: [], values: [] },
            tenagaData: {}
        };
    }

    nonPermanentData.forEach(employee => {
        let status = employee.nama_status || 'Tidak Diketahui';
        const jenisTenagaKey = employee.jenis_tenaga ? employee.jenis_tenaga.toString() : '0';

        // Grouping semua OUT SOURCING menjadi satu kategori
        if (status.includes('OUT SOURCING')) {
            status = 'OUT SOURCING';
        }

        // Hitung jumlah per status
        statusCount[status] = (statusCount[status] || 0) + 1;

        // Kumpulkan data jenis tenaga per status
        if (!tenagaByStatus[status]) {
            tenagaByStatus[status] = {};
        }
        tenagaByStatus[status][jenisTenagaKey] = (tenagaByStatus[status][jenisTenagaKey] || 0) + 1;
    });

    // Konversi ke format chart dan urutkan berdasarkan jumlah (descending)
    const sortedEntries = Object.entries(statusCount)
        .sort(([,a], [,b]) => b - a);

    const labels = sortedEntries.map(([label]) => label);
    const values = sortedEntries.map(([,value]) => value);

    return {
        chartData: { labels, values },
        tenagaData: tenagaByStatus
    };
}

// Fungsi untuk menampilkan detail status
function renderStatusDetail(nonPermanentData) {
    const container = document.getElementById('statusListContainer');
    if (!container) return;

    const { chartData, tenagaData } = processNonPermanentDataWithTenaga(nonPermanentData);
    const totalEmployees = chartData.values.reduce((sum, val) => sum + val, 0);

    // Update total summary
    document.getElementById('totalNonPermanent').textContent = totalEmployees;

    if (chartData.labels.length === 0 || totalEmployees === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <svg class="mx-auto w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Tidak ada data pegawai non-permanent</p>
            </div>
        `;
        return;
    }

    // Generate HTML untuk setiap status dengan informasi jenis tenaga
    const statusItems = chartData.labels.map((label, index) => {
        const count = chartData.values[index];
        const percentage = totalEmployees > 0 ? ((count / totalEmployees) * 100).toFixed(1) : 0;
        const colors = generateColors(chartData.labels.length);
        const color = colors[index];

        const tenagaInfo = tenagaData[label] || {};

        // Format detail jenis tenaga untuk display
        const tenagaDetails = Object.entries(tenagaInfo)
            .map(([jenisKey, jumlah]) => {
                const jenisLabel = JENIS_TENAGA_MAPPING[jenisKey] || `Tidak Diketahui (${jenisKey})`;
                return `${jenisLabel}: ${jumlah}`;
            })
            .join(', ');

        return `
            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                        <p class="font-medium text-gray-800 dark:text-gray-200 text-sm">${label}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-gray-900 dark:text-white text-lg">${count}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${percentage}%</p>
                    </div>
                </div>
                ${tenagaDetails ? `
                    <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p class="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Jenis Tenaga:</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${tenagaDetails}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = statusItems;
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

// Fungsi untuk update chart dengan data baru
export function updateEmployeeNonPermanentChart(nonPermanentData) {
    if (chartInstances.employeeNonPermanentChart) {
        const { chartData, tenagaData } = processNonPermanentDataWithTenaga(nonPermanentData);

        chartInstances.employeeNonPermanentChart.data.labels = chartData.labels;
        chartInstances.employeeNonPermanentChart.data.datasets[0].data = chartData.values;

        // Update colors jika jumlah data berubah
        if (chartData.labels.length !== chartInstances.employeeNonPermanentChart.data.labels.length) {
            chartInstances.employeeNonPermanentChart.data.datasets[0].backgroundColor = generateColors(chartData.labels.length);
            chartInstances.employeeNonPermanentChart.data.datasets[0].borderColor = generateColors(chartData.labels.length).map(color => color.replace('0.8', '1'));
        }

        chartInstances.employeeNonPermanentChart.update('none');
    }

    // Update detail status
    renderStatusDetail(nonPermanentData);
}

// Fungsi untuk menghancurkan chart
export function destroyEmployeeNonPermanentChart() {
    if (chartInstances.employeeNonPermanentChart) {
        chartInstances.employeeNonPermanentChart.destroy();
        chartInstances.employeeNonPermanentChart = null;
    }
}

// Export fungsi utilitas untuk digunakan di tempat lain
export { processNonPermanentDataWithTenaga as processNonPermanentData, renderStatusDetail, JENIS_TENAGA_MAPPING };
