import { Chart, chartInstances, chartTheme, updateChartTheme } from './index.js';


const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
};

export function renderTopDoctorsChart(topDoctorsData, allDoctorsTotal) {
  try {
    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value);
    };

    // Hapus chart sebelumnya jika ada
    if (chartInstances.topDoctorsChart) {
      chartInstances.topDoctorsChart.destroy();
    }

    const ctx = document.getElementById('topDoctorsChart');
    if (!ctx) {
      console.error('Canvas element not found');
      return;
    }

    // Atur fixed height pada container
    const container = ctx.parentElement;
    container.style.height = '400px'; // Atur tinggi tetap
    container.style.position = 'relative'; // Penting untuk responsive chart

    const chartCtx = ctx.getContext('2d');

    // Buat chart
    chartInstances.topDoctorsChart = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels: topDoctorsData.map(d => {
          // Potong nama dokter jika terlalu panjang
          const name = d.Dokter.split(',')[0];
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [{
          label: 'Jasa Dokter (Top 5)',
          data: topDoctorsData.map(d => d.Jasa_DR),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          barThickness: 'flex', // Atur ketebalan bar
          maxBarThickness: 50 // Batas maksimal ketebalan
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Nonaktifkan aspect ratio
        plugins: {
          title: {
            display: true,
            text: '5 Dokter dengan Jasa Tertinggi',
            font: { size: 16 },
            color: chartTheme.textColor.light,
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false // Sembunyikan legend jika tidak perlu
          },
          tooltip: {
            backgroundColor: chartTheme.tooltipBg.light,
            titleColor: chartTheme.tooltipTitleColor.light,
            bodyColor: chartTheme.tooltipBodyColor.light,
            borderColor: chartTheme.tooltipBorderColor.light,
            callbacks: {
              label: (context) => {
                const doctor = topDoctorsData[context.dataIndex];
                return [
                  `Dokter: ${doctor.Dokter}`,
                  `Jasa DR: ${formatCurrency(doctor.Jasa_DR)}`,
                  `Total Bill: ${formatCurrency(doctor.Total_Bill)}`,
                  `Gross: ${formatCurrency(doctor.Gross)}`,
                  `AP Dokter: ${formatCurrency(doctor.AP_Dokter)}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: chartTheme.textColor.light,
              callback: (value) => formatCurrency(value),
              padding: 10
            },
            grid: {
              color: chartTheme.gridColor.light,
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: chartTheme.textColor.light,
              padding: 10
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 20,
            bottom: 10
          }
        }
      }
    });

    // Update tema chart
    updateChartTheme();

    // Tampilkan summary
    renderRevenueSummary(topDoctorsData, allDoctorsTotal);

  } catch (error) {
    console.error('Error:', error);
    const container = document.getElementById('revenueSummary') || createSummaryContainer();
    container.innerHTML = `<p class="error">Gagal memuat data dokter: ${error.message}</p>`;
  }

  function createSummaryContainer() {
    const container = document.createElement('div');
    container.id = 'revenueSummary';
    document.getElementById('topDoctorsChart').parentElement.appendChild(container);
    return container;
  }

  function renderRevenueSummary(topDoctorsData, allDoctorsTotal) {
    const top5Total = topDoctorsData.reduce((sum, d) => sum + d.Jasa_DR, 0);
    const percentage = (top5Total / allDoctorsTotal * 100).toFixed(1);

    const container = document.getElementById('revenueSummary') || createSummaryContainer();

    container.innerHTML = `
      <div class="revenue-summary">
        <div class="summary-row">
          <span>Total Jasa 5 Dokter Teratas:</span>
          <strong>${formatCurrency(top5Total)}</strong>
        </div>
        <div class="summary-row">
          <span>Total Jasa Semua Dokter:</span>
          <strong>${formatCurrency(allDoctorsTotal)}</strong>
        </div>
        <div class="summary-row">
          <span>Kontribusi 5 Teratas:</span>
          <strong>${percentage}%</strong>
        </div>
      </div>
    `;
  }
}
