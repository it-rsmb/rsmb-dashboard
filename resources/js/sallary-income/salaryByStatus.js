import { Chart, chartTheme, chartInstances } from './index.js';


export function renderSalaryByStatusChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Helper function untuk konversi THP ke angka
    const safeParseTHP = (value) => {
        if (value === null || value === undefined) return 0;
        const str = value.toString().replace(/[^\d]/g, '');
        return parseFloat(str) || 0;
    };

    // Kelompokkan data dengan menggabungkan CAPEG, KONTRAK 2, dan Contract
    const statusGroups = data.reduce((acc, curr) => {
        // Gabungkan status CAPEG, KONTRAK 2, dan Contract menjadi "Non-Permanent"
        let status = curr.status_employee || 'Unknown';
        if (['CAPEG', 'KONTRAK 2', 'Contract'].includes(status)) {
            status = 'Non-Permanent';
        }

        const thp = safeParseTHP(curr.total_thp);

        if (!acc[status]) {
            acc[status] = {
                totalTHP: 0,
                count: 0,
                minTHP: Infinity,
                maxTHP: -Infinity,
                employees: []
            };
        }

        acc[status].totalTHP += thp;
        acc[status].count++;
        acc[status].minTHP = Math.min(acc[status].minTHP, thp);
        acc[status].maxTHP = Math.max(acc[status].maxTHP, thp);
        acc[status].employees.push({
            name: curr.name,
            original_status: curr.status_employee, // Simpan status asli
            gaji_pokok: safeParseTHP(curr.gaji_pokok),
            total_thp: thp
        });
        return acc;
    }, {});

    // Siapkan data untuk chart
    const labels = Object.keys(statusGroups);
    const averages = labels.map(status =>
        Math.round(statusGroups[status].totalTHP / statusGroups[status].count)
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

    // Warna modern (sesuaikan dengan jumlah status setelah digabung)
    const backgroundColors = [
        'rgba(99, 102, 241, 0.8)', // Permanent
        'rgba(244, 63, 94, 0.8)',  // Non-Permanent
        'rgba(16, 185, 129, 0.8)', // Lainnya (jika ada)
    ];

    // Buat chart baru
    chartInstances.salaryByStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata THP',
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
                            const range = group.maxTHP - group.minTHP;

                            // Tampilkan detail status asli dalam tooltip
                            const statusDetails = {};
                            group.employees.forEach(emp => {
                                statusDetails[emp.original_status] = (statusDetails[emp.original_status] || 0) + 1;
                            });
                            const statusDetailText = Object.entries(statusDetails)
                                .map(([s, count]) => `${s}: ${count} orang`)
                                .join('\n');

                            return [
                                `Jumlah Karyawan: ${formatNumber(group.count)}`,
                                `Detail Status:\n${statusDetailText}`,
                                `Total THP: ${formatCurrency(group.totalTHP)}`,
                                `Rata-rata: ${formatCurrency(context.raw)}`,
                                `Min: ${formatCurrency(group.minTHP)}`,
                                `Max: ${formatCurrency(group.maxTHP)}`,
                                `Range: ${formatCurrency(range)}`
                            ];
                        },
                        title: function(context) {
                            return `Kelompok: ${context[0].label}`;
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

    // Hitung dan tampilkan total THP
    showTotalTHP(data);
}

// ... (fungsi showTotalTHP dan addTotalTHPStyles tetap sama seperti sebelumnya)

// Fungsi untuk menampilkan total THP
function showTotalTHP(data) {
    const existingDisplay = document.getElementById('total-thp-display');
    if (existingDisplay) existingDisplay.remove();

    // Hitung total THP semua karyawan
    const total = data.reduce((sum, curr) => {
        return sum + parseFloat(curr.total_thp.toString().replace(/[^\d]/g, '')) || 0;
    }, 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Buat container untuk total THP
    const totalContainer = document.createElement('div');
    totalContainer.id = 'total-thp-display';
    totalContainer.className = 'total-thp-container';
    totalContainer.innerHTML = `
        <div class="total-thp-content">
            <h3 class="total-title">Total Take Home Pay (THP)</h3>
            <div class="total-amount">${formatCurrency(total)}</div>
            <div class="total-karyawan">${data.length} karyawan</div>
        </div>
    `;

    // Tempatkan setelah chart container
    const chartContainer = document.querySelector('#salaryByStatusChart').parentElement;
    chartContainer.parentNode.insertBefore(totalContainer, chartContainer.nextSibling);

    // Tambahkan CSS
    addTotalTHPStyles();
}

// Fungsi untuk menambahkan CSS khusus THP
function addTotalTHPStyles() {
    const styleId = 'total-thp-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .total-thp-container {
            margin-top: 20px;
            padding: 16px;
            background: #f0fdf4;
            border-radius: 12px;
            border: 1px solid #dcfce7;
            transition: all 0.3s ease;
        }

        .dark .total-thp-container {
            background: #1a2e22;
            border-color: #2e4b3b;
        }

        .total-thp-content {
            text-align: center;
        }

        .total-title {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #3f6212;
        }

        .dark .total-title {
            color: #84cc16;
        }

        .total-amount {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 4px;
        }

        .dark .total-amount {
            color: #4ade80;
        }

        .total-karyawan {
            font-size: 14px;
            color: #65a30d;
        }

        .dark .total-karyawan {
            color: #86efac;
        }
    `;
    document.head.appendChild(style);
}
