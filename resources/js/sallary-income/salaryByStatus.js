import { Chart, chartTheme, chartInstances } from './index.js';

export function renderSalaryByStatusChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Helper function untuk konversi gaji_pokok ke angka
    const safeParseSalary = (value) => {
        if (value === null || value === undefined) return 0;
        const str = value.toString().replace(/[^\d]/g, '');
        return parseFloat(str) || 0;
    };

    // Kelompokkan data berdasarkan status_employee
    const statusGroups = data.reduce((acc, curr) => {
        const status = curr.status_employee || 'Unknown';
        const gaji = safeParseSalary(curr.gaji_pokok);

        if (!acc[status]) {
            acc[status] = {
                totalGaji: 0,
                count: 0,
                minGaji: Infinity,
                maxGaji: -Infinity,
                employees: []
            };
        }

        acc[status].totalGaji += gaji;
        acc[status].count++;
        acc[status].minGaji = Math.min(acc[status].minGaji, gaji);
        acc[status].maxGaji = Math.max(acc[status].maxGaji, gaji);
        acc[status].employees.push({
            name: curr.name,
            gaji_pokok: gaji,
            total_thp: safeParseSalary(curr.total_thp)
        });
        return acc;
    }, {});

    // Siapkan data untuk chart
    const labels = Object.keys(statusGroups);
    const averages = labels.map(status =>
        Math.round(statusGroups[status].totalGaji / statusGroups[status].count)
    );

    const ctx = document.getElementById('salaryByStatusChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.salaryByStatusChart) {
        chartInstances.salaryByStatusChart.destroy();
    }

    // Format mata uang
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Format angka biasa
    const formatNumber = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    // Warna modern
    const backgroundColors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
    ];

    // Buat chart baru
    chartInstances.salaryByStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata Gaji Pokok',
                data: averages,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
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
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const status = context.label;
                            const group = statusGroups[status];
                            const range = group.maxGaji - group.minGaji;
                            const avgTHP = group.employees.reduce((sum, emp) => sum + emp.total_thp, 0) / group.count;

                            return [
                                `Jumlah Karyawan: ${formatNumber(group.count)}`,
                                `Total Gaji Pokok: ${formatCurrency(group.totalGaji)}`, // Baris baru yang ditambahkan
                                `Rata-rata: ${formatCurrency(context.raw)}`,
                                `Min: ${formatCurrency(group.minGaji)}`,
                                `Max: ${formatCurrency(group.maxGaji)}`,
                                `Range: ${formatCurrency(range)}`,
                                `THP Terkait: ${formatCurrency(avgTHP)} (rata-rata)`
                            ];
                        },
                        title: function(context) {
                            return `Status: ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                }
            }
        }
    });

    // Styling tambahan untuk chart
    const chartCanvas = chartInstances.salaryByStatusChart.canvas;
    chartCanvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
    chartCanvas.style.borderRadius = '12px';
    chartCanvas.style.boxShadow = isDark
        ? '0 4px 6px rgba(0, 0, 0, 0.1)'
        : '0 4px 6px rgba(0, 0, 0, 0.05)';

    // Hitung dan tampilkan total gaji pokok
    showTotalGajiPokok(data);
}

// Fungsi untuk menampilkan total gaji pokok
function showTotalGajiPokok(data) {
    // Hapus tampilan sebelumnya jika ada
    const existingDisplay = document.getElementById('total-gaji-display');
    if (existingDisplay) existingDisplay.remove();

    // Hitung total gaji pokok semua karyawan
    const total = data.reduce((sum, curr) => {
        return sum + parseFloat(curr.gaji_pokok.toString().replace(/[^\d]/g, '')) || 0;
    }, 0);

    // Format mata uang
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Buat container khusus untuk total gaji
    const totalContainer = document.createElement('div');
    totalContainer.id = 'total-gaji-display';
    totalContainer.className = 'total-gaji-container';
    totalContainer.innerHTML = `
        <div class="total-gaji-content">
            <h3 class="total-title">Total Gaji Pokok</h3>
            <div class="total-amount">${formatCurrency(total)}</div>
            <div class="total-karyawan">${data.length} karyawan</div>
        </div>
    `;

    // Tempatkan setelah chart container
    const chartContainer = document.querySelector('#salaryByStatusChart').parentElement;
    chartContainer.parentNode.insertBefore(totalContainer, chartContainer.nextSibling);

    // Tambahkan CSS
    addTotalGajiStyles();
}

// Fungsi untuk menambahkan CSS khusus
function addTotalGajiStyles() {
    const styleId = 'total-gaji-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .total-gaji-container {
            margin-top: 20px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }

        .dark .total-gaji-container {
            background: #1e293b;
            border-color: #334155;
        }

        .total-gaji-content {
            text-align: center;
        }

        .total-title {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #64748b;
        }

        .dark .total-title {
            color: #94a3b8;
        }

        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 4px;
        }

        .dark .total-amount {
            color: #60a5fa;
        }

        .total-karyawan {
            font-size: 14px;
            color: #94a3b8;
        }

        /* Layout fix untuk chart container */
        .chart-container-wrapper {
            position: relative;
        }

        .chart-container {
            height: 400px !important;
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);
}
