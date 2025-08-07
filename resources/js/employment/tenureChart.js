import { Chart, chartTheme, chartInstances } from './index.js';

export function renderTenureChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung masa kerja dalam tahun
    const tenures = data
        .map(employee => {
            if (!employee.join_date) return null;

            try {
                const joinDate = new Date(employee.join_date);
                if (isNaN(joinDate.getTime())) return null;

                const today = new Date();
                const diffTime = today - joinDate;
                const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
                return Math.floor(diffYears); // Bulatkan ke bawah ke tahun penuh
            } catch (e) {
                console.warn(`Invalid join_date: ${employee.join_date}`);
                return null;
            }
        })
        .filter(tenure => tenure !== null);

    // Kelompokkan sesuai range yang diminta
    const tenureRanges = {
        '0 tahun': 0,
        '1-5 tahun': 0,
        '6-10 tahun': 0,
        '11-15 tahun': 0,
        '16-20 tahun': 0,
        '>20 tahun': 0
    };

    tenures.forEach(tenure => {
        if (tenure === 0) tenureRanges['0 tahun']++;
        else if (tenure >= 1 && tenure <= 5) tenureRanges['1-5 tahun']++;
        else if (tenure >= 6 && tenure <= 10) tenureRanges['6-10 tahun']++;
        else if (tenure >= 11 && tenure <= 15) tenureRanges['11-15 tahun']++;
        else if (tenure >= 16 && tenure <= 20) tenureRanges['16-20 tahun']++;
        else if (tenure > 20) tenureRanges['>20 tahun']++;
    });

    const labels = Object.keys(tenureRanges);
    const counts = Object.values(tenureRanges);

    // Warna gradient untuk tiap range
    const backgroundColors = [
        'rgba(147, 197, 253, 0.7)',  // 0 tahun (biru muda)
        'rgba(59, 130, 246, 0.7)',   // 1-5 tahun (biru)
        'rgba(29, 78, 216, 0.7)',    // 6-10 tahun (biru tua)
        'rgba(234, 88, 12, 0.7)',    // 11-15 tahun (oranye)
        'rgba(194, 65, 12, 0.7)',    // 16-20 tahun (oranye tua)
        'rgba(154, 52, 18, 0.7)'     // >20 tahun (merah bata)
    ];

    const ctx = document.getElementById('tenureChart').getContext('2d');

    // Hapus chart sebelumnya jika ada
    if (chartInstances.tenureChart) {
        chartInstances.tenureChart.destroy();
    }

    // Buat chart baru
    chartInstances.tenureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.label}: ${context.raw} karyawan`;
                        }
                    },
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1,
                        precision: 0
                    },
                    grid: {
                        color: gridColor
                    },
                    title: {
                        display: true,
                        text: 'Jumlah Karyawan',
                        color: textColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    },
                    title: {
                        display: true,
                        text: 'Masa Kerja',
                        color: textColor
                    }
                }
            }
        }
    });

    // Atur background canvas
    chartInstances.tenureChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}
