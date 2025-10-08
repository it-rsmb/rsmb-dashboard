import { latestData, currentPeriod } from './index.js';
import { Chart } from 'chart.js/auto';

// Chart instances
let salaryByStatusChart = null;
let organizationSalaryChart = null;
let chartRendered = false;

// Cleanup function
export function cleanupSalaryChart() {
    console.log('🧹 Cleaning up salary charts...', {
        statusChartExists: !!salaryByStatusChart,
        orgChartExists: !!organizationSalaryChart,
        chartRendered
    });

    // Cleanup status chart
    if (salaryByStatusChart) {
        try {
            salaryByStatusChart.destroy();
            console.log('✅ Status chart destroyed successfully');
        } catch (error) {
            console.warn('⚠️ Error destroying status chart:', error);
        }
        salaryByStatusChart = null;
    }

    // Cleanup organization chart
    if (organizationSalaryChart) {
        try {
            organizationSalaryChart.destroy();
            console.log('✅ Organization chart destroyed successfully');
        } catch (error) {
            console.warn('⚠️ Error destroying organization chart:', error);
        }
        organizationSalaryChart = null;
    }

    chartRendered = false;
}

// Main render function untuk status chart
export function renderSalaryByStatusChart(data, period) {
    if (!data || data.length === 0) {
        console.warn('❌ No data available for status chart rendering');
        return;
    }

    if (chartRendered) {
        console.warn('⚠️ Charts already rendered, skipping...');
        return;
    }

    try {
        console.log('🎨 Starting status chart rendering process...');

        const chartData = processStatusChartData(data);
        renderAverageSalaryChart(chartData);

        console.log('✅ Status chart rendering completed');

    } catch (error) {
        console.error('❌ Error rendering status chart:', error);
    }
}

// Main render function untuk organization chart
export function renderOrganizationSalaryChart(data, period) {
    if (!data || data.length === 0) {
        console.warn('❌ No data available for organization chart rendering');
        return;
    }

    try {
        console.log('🎨 Starting organization chart rendering process...');

        const chartData = processOrganizationChartData(data);
        renderOrganizationChart(chartData);

        console.log('✅ Organization chart rendering completed');
        chartRendered = true;

    } catch (error) {
        console.error('❌ Error rendering organization chart:', error);
    }
}

// Process data untuk status chart
function processStatusChartData(data) {
    const statusData = {
        'PEGAWAI TETAP': {
            count: 0,
            totalTakeHomePay: 0,
            totalBasicSalary: 0,
            totalAllowances: 0,
            totalDeductions: 0,
            employees: []
        },
        'KONTRAK': {
            count: 0,
            totalTakeHomePay: 0,
            totalBasicSalary: 0,
            totalAllowances: 0,
            totalDeductions: 0,
            employees: []
        }
    };

    data.forEach(item => {
        const originalStatus = item.employment_status || 'Unknown';
        const status = originalStatus.toLowerCase() === 'permanent' ? 'PEGAWAI TETAP' : 'KONTRAK';

        const takeHomePay = parseFloat(item.take_home_pay) || 0;
        const basicSalary = parseFloat(item.basic_salary) || 0;
        const allowances = parseFloat(item.total_allowance) || 0;
        const deductions = parseFloat(item.total_deduction) || 0;

        statusData[status].count++;
        statusData[status].totalTakeHomePay += takeHomePay;
        statusData[status].totalBasicSalary += basicSalary;
        statusData[status].totalAllowances += allowances;
        statusData[status].totalDeductions += deductions;
        statusData[status].employees.push({
            name: item.full_name,
            takeHomePay: takeHomePay,
            department: item.organization_name,
            position: item.job_position,
            originalStatus: originalStatus
        });
    });

    const result = {
        labels: [],
        averageTakeHomePay: [],
        averageBasicSalary: [],
        averageAllowances: [],
        averageDeductions: [],
        employeeCount: [],
        totalEmployees: data.length,
        totalTakeHomePay: 0,
        totalBasicSalary: 0,
        statusDetails: statusData
    };

    Object.keys(statusData).forEach(status => {
        const data = statusData[status];
        if (data.count > 0) {
            const avgTakeHomePay = data.totalTakeHomePay / data.count;
            const avgBasicSalary = data.totalBasicSalary / data.count;
            const avgAllowances = data.totalAllowances / data.count;
            const avgDeductions = data.totalDeductions / data.count;

            result.labels.push(status);
            result.averageTakeHomePay.push(avgTakeHomePay);
            result.averageBasicSalary.push(avgBasicSalary);
            result.averageAllowances.push(avgAllowances);
            result.averageDeductions.push(avgDeductions);
            result.employeeCount.push(data.count);

            result.totalTakeHomePay += data.totalTakeHomePay;
            result.totalBasicSalary += data.totalBasicSalary;
        }
    });

    return result;
}

// Process data untuk organization chart
function processOrganizationChartData(data) {
    const organizationData = {};

    data.forEach(item => {
        const organization = item.organization_name || 'Unknown Department';
        const takeHomePay = parseFloat(item.take_home_pay) || 0;
        const basicSalary = parseFloat(item.basic_salary) || 0;
        const allowances = parseFloat(item.total_allowance) || 0;
        const deductions = parseFloat(item.total_deduction) || 0;

        if (!organizationData[organization]) {
            organizationData[organization] = {
                count: 0,
                totalTakeHomePay: 0,
                totalBasicSalary: 0,
                totalAllowances: 0,
                totalDeductions: 0,
                avgTakeHomePay: 0,
                employees: []
            };
        }

        organizationData[organization].count++;
        organizationData[organization].totalTakeHomePay += takeHomePay;
        organizationData[organization].totalBasicSalary += basicSalary;
        organizationData[organization].totalAllowances += allowances;
        organizationData[organization].totalDeductions += deductions;
        organizationData[organization].employees.push({
            name: item.full_name,
            takeHomePay: takeHomePay,
            position: item.job_position,
            employmentStatus: item.employment_status
        });
    });

    // Calculate averages
    Object.keys(organizationData).forEach(org => {
        const data = organizationData[org];
        data.avgTakeHomePay = data.count > 0 ? data.totalTakeHomePay / data.count : 0;
    });

    // Sort by total take home pay (descending) and take top 15
    const sortedOrganizations = Object.entries(organizationData)
        .sort(([,a], [,b]) => b.totalTakeHomePay - a.totalTakeHomePay)
        .slice(0, 15);

    return {
        organizations: sortedOrganizations,
        totalOrganizations: Object.keys(organizationData).length
    };
}

// Render average salary by status chart
function renderAverageSalaryChart(chartData) {
    const ctx = document.getElementById('salaryByStatusChart');
    if (!ctx) {
        console.error('❌ Status chart canvas not found');
        return;
    }

    if (salaryByStatusChart) {
        console.warn('⚠️ Status chart instance already exists, destroying first...');
        cleanupSalaryChart();
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    console.log('📊 Creating new status chart instance...');

    try {
        salaryByStatusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Rata-rata Take Home Pay',
                        data: chartData.averageTakeHomePay,
                        backgroundColor: chartData.labels.map(label =>
                            label === 'PEGAWAI TETAP' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(59, 130, 246, 0.8)'
                        ),
                        borderColor: chartData.labels.map(label =>
                            label === 'PEGAWAI TETAP' ? 'rgba(34, 197, 94, 1)' : 'rgba(59, 130, 246, 1)'
                        ),
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    // title: {
                    //     display: true,
                    //     text: `Rata-rata Take Home Pay by Status - ${formatPeriodDisplay(currentPeriod)}`,
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw || 0;
                                return `THP: ${formatCurrency(value)}`;
                            },
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const status = chartData.labels[index];
                                const count = chartData.employeeCount[index];
                                return `Jumlah Karyawan: ${count}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
                                }
                                return 'Rp ' + value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rupiah'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Status Karyawan'
                        }
                    }
                }
            }
        });

        console.log('✅ Status chart created successfully');
        updateStatusChartTitle(chartData);

    } catch (error) {
        console.error('❌ Error creating status chart:', error);
        salaryByStatusChart = null;
    }
}

// Render organization salary chart
function renderOrganizationChart(chartData) {
    const ctx = document.getElementById('organizationSalaryChart');
    if (!ctx) {
        console.error('❌ Organization chart canvas not found');
        return;
    }

    if (organizationSalaryChart) {
        console.warn('⚠️ Organization chart instance already exists, destroying first...');
        try {
            organizationSalaryChart.destroy();
        } catch (error) {
            console.warn('⚠️ Error destroying organization chart:', error);
        }
        organizationSalaryChart = null;
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    console.log('📊 Creating new organization chart instance...');

    try {
        const labels = chartData.organizations.map(([orgName]) => orgName);
        const totalSalaryData = chartData.organizations.map(([, data]) => data.totalTakeHomePay);
        const employeeCountData = chartData.organizations.map(([, data]) => data.count);

        organizationSalaryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Take Home Pay',
                        data: totalSalaryData,
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Jumlah Karyawan',
                        data: employeeCountData,
                        backgroundColor: 'rgba(245, 158, 11, 0.6)',
                        borderColor: 'rgba(245, 158, 11, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    // title: {
                    //     display: true,
                    //     text: `Total Gaji by Department - ${formatPeriodDisplay(currentPeriod)}`,
                    //     font: {
                    //         size: 16,
                    //         weight: 'bold'
                    //     }
                    // },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const datasetLabel = context.dataset.label || '';
                                const value = context.raw || 0;

                                if (datasetLabel === 'Total Take Home Pay') {
                                    return `${datasetLabel}: ${formatCurrency(value)}`;
                                } else {
                                    return `${datasetLabel}: ${value} orang`;
                                }
                            },
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                const orgName = labels[index];
                                const orgData = chartData.organizations[index][1];

                                return [
                                    `Rata-rata THP: ${formatCurrency(orgData.avgTakeHomePay)}`,
                                    `Total Gaji Pokok: ${formatCurrency(orgData.totalBasicSalary)}`,
                                    `Total Tunjangan: ${formatCurrency(orgData.totalAllowances)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000000) {
                                    return 'Rp ' + (value / 1000000000).toFixed(1) + 'M';
                                }
                                if (value >= 1000000) {
                                    return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
                                }
                                return 'Rp ' + value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Total Take Home Pay'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Jumlah Karyawan'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        console.log('✅ Organization chart created successfully');
        updateOrganizationChartTitle(chartData);

    } catch (error) {
        console.error('❌ Error creating organization chart:', error);
        organizationSalaryChart = null;
    }
}

// Update status chart title
function updateStatusChartTitle(chartData) {
    const chartHeader = document.querySelector('#statusChartContainer header h2');
    if (chartHeader) {
        const tetapCount = chartData.statusDetails['PEGAWAI TETAP']?.count || 0;
        const kontrakCount = chartData.statusDetails['KONTRAK']?.count || 0;

        chartHeader.innerHTML = `
            Average Salary by Status
            <div class="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                Total ${chartData.totalEmployees} karyawan
                (Pegawai Tetap: ${tetapCount}, Kontrak: ${kontrakCount})
            </div>
        `;
    }
}

// Update organization chart title
function updateOrganizationChartTitle(chartData) {
    const chartHeader = document.querySelector('#organizationChartContainer header h2');
    if (chartHeader) {
        const totalDepartments = chartData.totalOrganizations;
        const displayedDepartments = chartData.organizations.length;

        chartHeader.innerHTML = `
            Salary by Department
            <div class="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                Menampilkan ${displayedDepartments} dari ${totalDepartments} department
            </div>
        `;
    }
}

// Helper function untuk format period display
function formatPeriodDisplay(period) {
    const [year, month] = period.split('-');
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${year}`;
}

// Export utility functions
export function getChartData() {
    return {
        salaryByStatusChart: salaryByStatusChart,
        organizationSalaryChart: organizationSalaryChart,
        chartRendered: chartRendered
    };
}

// Auto cleanup ketika page unload
window.addEventListener('beforeunload', cleanupSalaryChart);
