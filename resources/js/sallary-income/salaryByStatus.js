import { Chart, chartTheme, chartInstances } from './index.js';

export function renderSalaryByStatusChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Helper function untuk memastikan nilai number
    const safeParseNumber = (value) => {
        if (value === null || value === undefined) return 0;
        return Number(value) || 0;
    };

    console.log("TEST", data);


    // Kelompokkan data berdasarkan status
    const statusGroups = data.reduce((acc, curr) => {
        let status = curr.status_employee || 'Unknown';
        if (['CAPEG', 'KONTRAK 2', 'Contract'].includes(status)) {
            status = 'Non-Permanent';
        }

        const gajiBruto = safeParseNumber(curr.gaji_bruto);

        if (!acc[status]) {
            acc[status] = {
                totalGajiBruto: 0,
                count: 0,
                minGaji: Infinity,
                maxGaji: -Infinity,
                employees: []
            };
        }

        acc[status].totalGajiBruto += gajiBruto;
        acc[status].count++;
        acc[status].minGaji = Math.min(acc[status].minGaji, gajiBruto);
        acc[status].maxGaji = Math.max(acc[status].maxGaji, gajiBruto);
        acc[status].employees.push({
            name: curr.full_name,
            original_status: curr.status_employee,
            basic_salary: safeParseNumber(curr.basic_salary),
            total_allowance: safeParseNumber(curr.total_allowance),
            gaji_bruto: gajiBruto
        });
        return acc;
    }, {});

    // Siapkan data untuk chart
    const labels = Object.keys(statusGroups);
    const averages = labels.map(status =>
        Math.round(statusGroups[status].totalGajiBruto / statusGroups[status].count)
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

    // Warna chart
    const backgroundColors = [
        'rgba(99, 102, 241, 0.8)', // Permanent
        'rgba(244, 63, 94, 0.8)',  // Non-Permanent
        'rgba(16, 185, 129, 0.8)', // Lainnya
    ];

    // Buat chart baru
    chartInstances.salaryByStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata Gaji Bruto',
                data: averages,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    callbacks: {
                        label: function(context) {
                            const status = context.label;
                            const group = statusGroups[status];
                            const range = group.maxGaji - group.minGaji;

                            const statusDetails = {};
                            group.employees.forEach(emp => {
                                statusDetails[emp.original_status] = (statusDetails[emp.original_status] || 0) + 1;
                            });

                            const statusDetailText = Object.entries(statusDetails)
                                .map(([s, count]) => `${s}: ${count} orang`)
                                .join('\n');

                            return [
                                `Jumlah Karyawan: ${group.count}`,
                                `Detail Status:\n${statusDetailText}`,
                                `Total Gaji Bruto: ${formatCurrency(group.totalGajiBruto)}`,
                                `Rata-rata: ${formatCurrency(context.raw)}`,
                                `Min: ${formatCurrency(group.minGaji)}`,
                                `Max: ${formatCurrency(group.maxGaji)}`,
                                `Range: ${formatCurrency(range)}`,
                                `Rasio Basic/Allowance: ${calculateBasicAllowanceRatio(group)}`
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
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        callback: formatCurrency
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });

    // Styling chart
    ctx.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
    ctx.canvas.style.borderRadius = '12px';

    // Tampilkan total gaji bruto
    showTotalGajiBruto(data);
}

// Fungsi untuk menghitung rasio basic salary vs allowance
function calculateBasicAllowanceRatio(group) {
    const totalBasic = group.employees.reduce((sum, emp) => sum + emp.basic_salary, 0);
    const totalAllowance = group.employees.reduce((sum, emp) => sum + emp.total_allowance, 0);

    if (totalAllowance === 0) return 'Tidak ada allowance';

    const ratio = (totalBasic / totalAllowance).toFixed(2);
    return `${ratio}:1 (Basic:Allowance)`;
}

// Fungsi untuk menampilkan total gaji bruto
function showTotalGajiBruto(data) {
    const existingDisplay = document.getElementById('total-gaji-display');
    if (existingDisplay) existingDisplay.remove();

    const total = data.reduce((sum, curr) => sum + (curr.gaji_bruto || 0), 0);
    const totalBasic = data.reduce((sum, curr) => sum + (curr.basic_salary || 0), 0);
    const totalAllowance = data.reduce((sum, curr) => sum + (curr.total_allowance || 0), 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const container = document.createElement('div');
    container.id = 'total-gaji-display';
    container.className = 'total-gaji-container';
    container.innerHTML = `
        <div class="total-gaji-content">
            <h3 class="total-title">Ringkasan Gaji</h3>
            <div class="total-amount">Total Bruto: ${formatCurrency(total)}</div>
            <div class="breakdown">
                <span>Basic: ${formatCurrency(totalBasic)}</span>
                <span>Allowance: ${formatCurrency(totalAllowance)}</span>
            </div>
            <div class="total-karyawan">${data.length} karyawan</div>
        </div>
    `;

    const chartContainer = document.querySelector('#salaryByStatusChart').parentElement;
    chartContainer.parentNode.insertBefore(container, chartContainer.nextSibling);

    addGajiStyles();
}

// CSS untuk komponen gaji
function addGajiStyles() {
    const styleId = 'total-gaji-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .total-gaji-container {
            margin-top: 20px;
            padding: 16px;
            background: #f0f5ff;
            border-radius: 12px;
            border: 1px solid #dbeafe;
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
            color: #1e40af;
        }

        .dark .total-title {
            color: #93c5fd;
        }

        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 6px;
        }

        .breakdown {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 6px;
            font-size: 14px;
            color: #4b5563;
        }

        .dark .breakdown {
            color: #9ca3af;
        }

        .total-karyawan {
            font-size: 14px;
            color: #64748b;
        }
    `;
    document.head.appendChild(style);
}
