// resources/js/employment/tenagaTypeChart.js
import { Chart } from 'chart.js/auto';
import { chartTheme, chartInstances } from './../chartConfig.js';

export function renderTenagaTypeChart(data) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    const textColor = isDark ? chartTheme.textColor.dark : chartTheme.textColor.light;

    // Struktur data baru untuk menyimpan breakdown per employment_status, gender, dan jenis dokter
    const tenagaTypeData = data.reduce((acc, curr) => {
        // Cari field "Jenis Tenaga" dalam custom_fields
        const jenisTenagaField = curr.custom_fields?.find(field =>
            field.field_name === 'Jenis Tenaga'
        );

        const jenisTenaga = jenisTenagaField?.value || 'Tidak Terdefinisi';
        const normalizedType = jenisTenaga.trim() === '' ? 'Tidak Terdefinisi' : jenisTenaga;

        // Ambil employment_status dari objek employment dan normalisasi
        let employmentStatus = curr.employment?.employment_status || 'Tidak Diketahui';

        // Normalisasi nilai status untuk konsistensi
        if (employmentStatus.includes('CAPEG') || employmentStatus.includes('Capeg')) {
            employmentStatus = 'CAPEG';
        } else if (employmentStatus.includes('KONTRAK') || employmentStatus.includes('Kontrak')) {
            employmentStatus = 'KONTRAK 2';
        } else if (employmentStatus.includes('Permanent') || employmentStatus.includes('PERMANENT')) {
            employmentStatus = 'Permanent';
        }

        // Ambil gender dari personal data
        const gender = curr.personal?.gender || 'Tidak Diketahui';
        const normalizedGender = gender === 'Male' ? 'Laki-laki' :
                               gender === 'Female' ? 'Perempuan' :
                               gender;

        // Ambil Jenis Dokter dari custom_fields (khusus untuk tenaga medis)
        const jenisDokterField = curr.custom_fields?.find(field =>
            field.field_name === 'Jenis Dokter'
        );
        const jenisDokter = jenisDokterField?.value || '';

        // Inisialisasi jika belum ada
        if (!acc[normalizedType]) {
            acc[normalizedType] = {
                total: 0,
                breakdown: {
                    'Permanent': 0,
                    'CAPEG': 0,
                    'KONTRAK 2': 0
                },
                gender: {
                    'Laki-laki': 0,
                    'Perempuan': 0
                },
                jenisDokter: {} // Untuk menyimpan breakdown jenis dokter
            };
        }

        // Update total dan breakdown
        acc[normalizedType].total++;

        // Update employment status breakdown
        if (['Permanent', 'CAPEG', 'KONTRAK 2'].includes(employmentStatus)) {
            acc[normalizedType].breakdown[employmentStatus]++;
        } else {
            if (!acc[normalizedType].breakdown['Lainnya']) {
                acc[normalizedType].breakdown['Lainnya'] = 0;
            }
            acc[normalizedType].breakdown['Lainnya']++;
        }

        // Update gender breakdown
        if (['Laki-laki', 'Perempuan'].includes(normalizedGender)) {
            acc[normalizedType].gender[normalizedGender]++;
        } else {
            if (!acc[normalizedType].gender['Lainnya']) {
                acc[normalizedType].gender['Lainnya'] = 0;
            }
            acc[normalizedType].gender['Lainnya']++;
        }

        // Update jenis dokter breakdown (hanya untuk jenis tenaga medis)
        if (isTenagaMedis(normalizedType) && jenisDokter && jenisDokter.trim() !== '') {
            const normalizedJenisDokter = jenisDokter.trim();
            acc[normalizedType].jenisDokter[normalizedJenisDokter] =
                (acc[normalizedType].jenisDokter[normalizedJenisDokter] || 0) + 1;
        }

        return acc;
    }, {});

    const labels = Object.keys(tenagaTypeData);
    const totals = labels.map(label => tenagaTypeData[label].total);
    const breakdowns = labels.map(label => tenagaTypeData[label].breakdown);
    const genderBreakdowns = labels.map(label => tenagaTypeData[label].gender);
    const jenisDokterBreakdowns = labels.map(label => tenagaTypeData[label].jenisDokter);

    const ctx = document.getElementById('tenagaTypeChart').getContext('2d');

    // Hancurkan chart sebelumnya jika ada
    if (chartInstances.tenagaTypeChart) {
        chartInstances.tenagaTypeChart.destroy();
    }

    // Warna untuk chart
    const backgroundColors = [
        'rgba(99, 102, 241, 0.7)',    // Indigo
        'rgba(248, 113, 113, 0.7)',   // Red
        'rgba(52, 211, 153, 0.7)',    // Green
        'rgba(251, 191, 36, 0.7)',    // Yellow
        'rgba(139, 92, 246, 0.7)',    // Purple
        'rgba(45, 212, 191, 0.7)',    // Teal
        'rgba(148, 163, 184, 0.7)',   // Gray
    ];

    // Buat chart baru
    chartInstances.tenagaTypeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Karyawan',
                data: totals,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: isDark ? chartTheme.tooltipBg.dark : chartTheme.tooltipBg.light,
                    titleColor: isDark ? chartTheme.tooltipTitleColor.dark : chartTheme.tooltipTitleColor.light,
                    bodyColor: isDark ? chartTheme.tooltipBodyColor.dark : chartTheme.tooltipBodyColor.light,
                    borderColor: isDark ? chartTheme.tooltipBorderColor.dark : chartTheme.tooltipBorderColor.light,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);

                            // Ambil breakdown data untuk bar ini
                            const labelIndex = context.dataIndex;
                            const currentLabel = labels[labelIndex];
                            const breakdown = breakdowns[labelIndex];
                            const genderBreakdown = genderBreakdowns[labelIndex];
                            const jenisDokterBreakdown = jenisDokterBreakdowns[labelIndex];

                            // Buat array untuk tooltip lines
                            const tooltipLines = [
                                `Total: ${context.parsed.y} karyawan (${percentage}%)`,
                                '',
                                '📊 Status Karyawan:'
                            ];

                            // Urutkan status: Permanent, CAPEG, KONTRAK 2, Lainnya
                            const orderedStatuses = ['Permanent', 'CAPEG', 'KONTRAK 2', 'Lainnya'];

                            orderedStatuses.forEach(status => {
                                if (breakdown[status] > 0) {
                                    const statusPercentage = ((breakdown[status] / context.parsed.y) * 100).toFixed(1);
                                    tooltipLines.push(`  • ${status}: ${breakdown[status]} (${statusPercentage}%)`);
                                }
                            });

                            tooltipLines.push('', '👥 Jenis Kelamin:');

                            // Tampilkan breakdown gender
                            const orderedGenders = ['Laki-laki', 'Perempuan', 'Lainnya'];

                            orderedGenders.forEach(gender => {
                                if (genderBreakdown[gender] > 0) {
                                    const genderPercentage = ((genderBreakdown[gender] / context.parsed.y) * 100).toFixed(1);
                                    tooltipLines.push(`  • ${gender}: ${genderBreakdown[gender]} (${genderPercentage}%)`);
                                }
                            });

                            // Tampilkan breakdown Jenis Dokter khusus untuk tenaga medis
                            if (isTenagaMedis(currentLabel) && Object.keys(jenisDokterBreakdown).length > 0) {
                                tooltipLines.push('', '🏥 Jenis Dokter:');

                                Object.entries(jenisDokterBreakdown)
                                    .sort(([,a], [,b]) => b - a) // Urutkan berdasarkan jumlah tertinggi
                                    .forEach(([jenisDokter, count]) => {
                                        const dokterPercentage = ((count / context.parsed.y) * 100).toFixed(1);
                                        tooltipLines.push(`  • ${jenisDokter}: ${count} (${dokterPercentage}%)`);
                                    });
                            } else if (isTenagaMedis(currentLabel)) {
                                tooltipLines.push('', '🏥 Jenis Dokter: Tidak ada data');
                            }

                            return tooltipLines;
                        },
                        title: function(tooltipItems) {
                            return `Jenis Tenaga: ${tooltipItems[0].label}`;
                        }
                    }
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
                        color: isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        font: {
                            size: 12
                        },
                        precision: 0
                    },
                    grid: {
                        color: isDark ? chartTheme.gridColor.dark : chartTheme.gridColor.light
                    }
                }
            }
        }
    });

    // Set background canvas
    chartInstances.tenagaTypeChart.canvas.style.backgroundColor = isDark ?
        chartTheme.backgroundCanvas.dark : chartTheme.backgroundCanvas.light;
}

// Fungsi untuk menentukan apakah jenis tenaga termasuk tenaga medis
function isTenagaMedis(jenisTenaga) {
    const tenagaMedisKeywords = [
        'dokter', 'Dokter', 'medis', 'Medis', 'perawat', 'Perawat',
        'bidan', 'Bidan', 'nakes', 'Nakes', 'kesehatan', 'Kesehatan',
        'Dokter', 'Perawat', 'Bidan', 'Apoteker', 'Farmasi', 'Medis'
    ];

    return tenagaMedisKeywords.some(keyword =>
        jenisTenaga.toLowerCase().includes(keyword.toLowerCase())
    );
}
