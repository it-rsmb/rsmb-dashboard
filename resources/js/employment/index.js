import Chart from 'chart.js/auto';

$(document).ready(function () {
    fetchAndDisplayData();
});

const chartTheme = {
    textColor: {
        light: '#1f2937', // dark text
        dark: '#e5e7eb'   // light text
    },
    gridColor: {
        light: '#e5e7eb',
        dark: 'rgba(255,255,255,0.05)'
    },
    tooltipBg: {
        light: '#ffffff',
        dark: '#1f2937'
    },
    tooltipTitleColor: {
        light: '#111827',
        dark: '#f9fafb'
    },
    tooltipBodyColor: {
        light: '#374151',
        dark: '#d1d5db'
    },
    tooltipBorderColor: {
        light: '#d1d5db',
        dark: '#4b5563'
    },
    backgroundCanvas: {
        light: '#ffffff',
        dark: '#1f2937'
    }
};

// Global chart instances
let genderChart, ageChart, statusEmployeeChart;
let latestData = [];

// Check initial dark mode
const darkMode = localStorage.getItem('dark-mode') === 'true';

function updateChartTheme() {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Update all charts if they exist
    [genderChart, ageChart, statusEmployeeChart].forEach(chart => {
        if (!chart) return;

        // Update chart options
        if (chart.options.plugins.legend?.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }

        if (chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light;
            chart.options.plugins.tooltip.titleColor = isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light;
            chart.options.plugins.tooltip.bodyColor = isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light;
            chart.options.plugins.tooltip.borderColor = isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light;
        }

        // Update scales if they exist
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = textColor;
                chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.y.grid.color = gridColor;
            }
        }

        // Update canvas background
        chart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;

        chart.update();
    });
}

document.addEventListener('darkMode', () => {
    updateChartTheme();
});

$(document).ready(function () {
    fetchAndDisplayData();
});


async function fetchAndDisplayData() {
    const $loading = $('#loadingIndicator');
    const $chartContainer = $('#chartContainer');

    try {
        $loading.show();
        $chartContainer.hide();

        const response = await fetch('https://script.google.com/macros/s/AKfycbykwLZNxCF6blJ-16opGLbluqEG3U5ijpUd7tx_5D43v3SIFeqzhzdtYps6xEDQ-WdI/exec');
        latestData = await response.json();

        $loading.hide();
        $chartContainer.removeClass('hidden').fadeIn(100, () => {
            renderGenderChart(latestData);
            renderAgeChart(latestData);
            renderStatusEmployeeChart(latestData);
        });

    } catch (error) {
        console.error('Gagal mengambil data:', error);
        $loading.html('<p class="text-red-600 col-span-12">Gagal mengambil data dari server.</p>');
    }
}

function renderGenderChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    const genderCount = data.reduce((acc, curr) => {
        const gender = curr.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(genderCount);
    const totals = Object.values(genderCount);
    const ctx = document.getElementById('genderChart').getContext('2d');

    // Destroy previous chart if exists
    if (genderChart) genderChart.destroy();

    genderChart = new Chart(ctx, {
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

    genderChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}



// Usia
function renderAgeChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung usia dari birth_date
    const ages = data
        .map(item => {
            if (!item.birth_date) return null;
            const birthDate = new Date(item.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        })
        .filter(age => age !== null && !isNaN(age));

    // Kelompokkan usia ke dalam range 5 tahun
    const ageGroups = {};
    ages.forEach(age => {
        const lower = Math.floor(age / 5) * 5;
        const upper = lower + 4;
        const label = `${lower}-${upper}`;
        ageGroups[label] = (ageGroups[label] || 0) + 1;
    });

    // Sortir label berdasarkan nilai numerik
    const labels = Object.keys(ageGroups).sort((a, b) => {
        return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]);
    });
    const totals = labels.map(label => ageGroups[label]);

    const ctx = document.getElementById('ageChart').getContext('2d');

    // Destroy previous chart if exists
    if (ageChart) ageChart.destroy();

    ageChart = new Chart(ctx, {
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

    // Set canvas background
    ageChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}


// Status
function renderStatusEmployeeChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Hitung jumlah berdasarkan status_employee
    const statusCount = data.reduce((acc, curr) => {
        const status = curr.status_employee || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Tetapkan label dan warnanya secara manual agar konsisten
    const statusLabels = ['Permanent', 'CAPEG', 'KONTRAK 2', 'Unknown'];
    const colors = {
        'Permanent': 'rgba(59, 130, 246, 0.7)',     // Biru
        'CAPEG': 'rgba(16, 185, 129, 0.7)',         // Hijau
        'KONTRAK 2': 'rgba(239, 68, 68, 0.7)',      // Merah
        'Unknown': 'rgba(107, 114, 128, 0.7)'       // Abu-abu
    };
    const borderColors = {
        'Permanent': 'rgba(59, 130, 246, 1)',
        'CAPEG': 'rgba(16, 185, 129, 1)',
        'KONTRAK 2': 'rgba(239, 68, 68, 1)',
        'Unknown': 'rgba(107, 114, 128, 1)'
    };

    const labels = statusLabels.filter(label => statusCount[label]);
    const totals = labels.map(label => statusCount[label]);
    const backgroundColor = labels.map(label => colors[label]);
    const borderColor = labels.map(label => borderColors[label]);

    const ctx = document.getElementById('statusEmployeeChart').getContext('2d');

    // Destroy previous chart if exists
    if (statusEmployeeChart) statusEmployeeChart.destroy();

    statusEmployeeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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

    // Set canvas background
    statusEmployeeChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}
