import { Chart, chartInstances } from './index.js';

export function renderTopLateEmployees(data) {
  try {
    // Proses data untuk mendapatkan 10 karyawan terlambat terbanyak
    const { employees, lateInCounts, departments } = processLateEmployeeData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.lateEmployeesChart) {
      chartInstances.lateEmployeesChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('lateEmployeesChart').getContext('2d');
    chartInstances.lateEmployeesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: employees,
        datasets: [{
          label: 'Jumlah Keterlambatan',
          data: lateInCounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(201, 203, 207, 0.7)',
            'rgba(255, 89, 94, 0.7)',
            'rgba(50, 168, 82, 0.7)',
            'rgba(253, 126, 20, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(201, 203, 207, 1)',
            'rgba(255, 89, 94, 1)',
            'rgba(50, 168, 82, 1)',
            'rgba(253, 126, 20, 1)'
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
        //     text: '10 Karyawan dengan Keterlambatan Terbanyak',
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
                return `${context.raw} kali terlambat`;
              },
              afterLabel: (context) => {
                const emp = data.find(e => e.full_name === employees[context.dataIndex]);
                return `Departemen: ${emp.organization || 'Tidak diketahui'}\nTotal Hadir: ${emp.total_present || 0} hari`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Keterlambatan',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
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

    // Tampilkan tabel detail
    renderLateEmployeeDetails(data, employees, lateInCounts, departments);

  } catch (error) {
    console.error('Error:', error);
  }
}

function processLateEmployeeData(data) {
  // Filter karyawan dengan keterlambatan
  const employeesWithLateIn = data.filter(emp => emp.total_late_in > 0);

  // Urutkan berdasarkan keterlambatan terbanyak
  const sortedEmployees = [...employeesWithLateIn]
    .sort((a, b) => b.total_late_in - a.total_late_in)
    .slice(0, 10); // Ambil 10 teratas

  return {
    employees: sortedEmployees.map(emp => emp.full_name),
    lateInCounts: sortedEmployees.map(emp => emp.total_late_in),
    departments: sortedEmployees.map(emp => emp.organization || 'Unknown')
  };
}

function renderLateEmployeeDetails(data, employees, lateInCounts, departments) {
  const container = document.getElementById('lateEmployeeDetails');

  container.innerHTML = `
    <h3>Detail 10 Karyawan Terlambat Terbanyak</h3>
    <div class="late-employees-grid">
      ${employees.map((emp, index) => {
        const empData = data.find(e => e.full_name === emp);
        return `
          <div class="employee-card late">
            <div class="rank">${index + 1}</div>
            <div class="employee-info">
              <div class="name">${emp}</div>
              <div class="dept">${departments[index]}</div>
            </div>
            <div class="stats">
              <div class="late-count">
                <span class="value">${lateInCounts[index]}</span>
                <span class="label">kali terlambat</span>
              </div>
              <div class="details">
                <span>${empData.total_present || 0} hari hadir</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
