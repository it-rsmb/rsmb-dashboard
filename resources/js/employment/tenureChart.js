import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';


export function renderTenureChart(data) {

    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;
    const gridColor = isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light;

    // Hitung masa kerja dalam tahun dari join_date
    const tenures = data
        .map(employee => {
            if (!employee.employment?.join_date) {
                return null;
            }

            try {
                const joinDate = new Date(employee.employment.join_date);
                if (isNaN(joinDate.getTime())) {
                    return null;
                }

                const today = new Date();
                let years = today.getFullYear() - joinDate.getFullYear();
                const months = today.getMonth() - joinDate.getMonth();

                // Adjust jika bulan bergabung belum tercapai
                if (months < 0 || (months === 0 && today.getDate() < joinDate.getDate())) {
                    years--;
                }

                return years;
            } catch (e) {
                return null;
            }
        })
        .filter(tenure => tenure !== null && !isNaN(tenure));



    // Kelompokkan sesuai range
    const tenureRanges = {
        '<1 tahun': 0,
        '1-5 tahun': 0,
        '6-10 tahun': 0,
        '11-15 tahun': 0,
        '16-20 tahun': 0,
        '>20 tahun': 0
    };

    tenures.forEach(tenure => {
        if (tenure < 1) tenureRanges['<1 tahun']++;
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
        'rgba(147, 197, 253, 0.7)',  // <1 tahun (biru muda)
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
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            const total = tenures.length;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${value} karyawan (${percentage}%)`;
                        }
                    }
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
                    }
                },
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
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Atur background canvas
    chartInstances.tenureChart.canvas.style.backgroundColor = isDark ? chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;

    console.log('Tenure chart rendered successfully');
}
