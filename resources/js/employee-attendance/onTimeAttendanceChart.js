import { Chart, chartInstances } from './index.js';

export function renderOnTimeAttendanceChart(data) {
  try {
    // Proses data dan ambil 10 teratas
    const { employees, onTimeRatios, detailedData } = processOnTimeData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.onTimeAttendanceChart) {
      chartInstances.onTimeAttendanceChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('onTimeAttendanceChart').getContext('2d');
    chartInstances.onTimeAttendanceChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: employees,
    datasets: [{
      label: 'Rasio Tepat Waktu (%)',
      data: onTimeRatios,
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',  // Merah
        'rgba(54, 162, 235, 0.7)',   // Biru
        'rgba(255, 206, 86, 0.7)',   // Kuning
        'rgba(75, 192, 192, 0.7)',   // Teal
        'rgba(153, 102, 255, 0.7)',  // Ungu
        'rgba(255, 159, 64, 0.7)',   // Orange
        'rgba(199, 199, 199, 0.7)',  // Abu-abu
        'rgba(83, 102, 255, 0.7)',   // Biru muda
        'rgba(40, 167, 69, 0.7)',    // Hijau
        'rgba(108, 117, 125, 0.7)'   // Abu-abu gelap
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)',
        'rgba(40, 167, 69, 1)',
        'rgba(108, 117, 125, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    indexAxis: 'y',
    plugins: {
    //   title: {
    //     display: true,
    //     text: '10 Karyawan dengan Rasio Kehadiran Tepat Waktu Tertinggi',
    //     font: {
    //       size: 16,
    //       weight: 'bold'
    //     },
    //     padding: {
    //       top: 20,
    //       bottom: 20
    //     }
    //   },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            return `${context.raw}% tepat waktu`;
          },
          afterLabel: (context) => {
            const emp = detailedData[context.dataIndex];
            return `Hadir: ${emp.totalPresent} hari\nTepat waktu: ${emp.totalOnTime} hari`;
          }
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Persentase Kehadiran Tepat Waktu (%)',
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            weight: 'bold'
          }
        }
      }
    }
  }
});

    renderTop10OnTimeDetails(detailedData);

  } catch (error) {
    console.error('Error:', error);
  }
}

function processOnTimeData(data) {
  // Filter dan hitung rasio
  const processed = data
    .filter(emp => emp.total_present > 0)
    .map(emp => ({
      name: emp.full_name,
      department: emp.organization || 'Unknown',
      ratio: Math.round((emp.total_on_time / emp.total_present) * 100),
      totalPresent: emp.total_present,
      totalOnTime: emp.total_on_time
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 10); // Ambil 10 teratas saja

  return {
    employees: processed.map(e => e.name),
    onTimeRatios: processed.map(e => e.ratio),
    detailedData: processed
  };
}

function renderTop10OnTimeDetails(topEmployees) {
  const container = document.getElementById('onTimeDetails');

  container.innerHTML = `
    <h3>10 Karyawan Paling Tepat Waktu</h3>
    <div class="top-employees-grid">
      ${topEmployees.map((emp, index) => `
        <div class="employee-card">
          <div class="rank">${index + 1}</div>
          <div class="employee-info">
            <div class="name">${emp.name}</div>
            <div class="dept">${emp.department}</div>
          </div>
          <div class="stats">
            <div class="ratio">
              <span class="value">${emp.ratio}%</span>
              <span class="label">Tepat waktu</span>
            </div>
            <div class="details">
              <span>${emp.totalOnTime}/${emp.totalPresent} hari</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
