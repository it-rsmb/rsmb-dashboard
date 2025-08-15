import { Chart, chartInstances } from './index.js';

export function renderTimeOffByDepartment(data) {
  try {
    // Proses data waktu libur
    const { departments, timeOffData, employeeCounts } = processTimeOffData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.timeOffChart) {
      chartInstances.timeOffChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('timeOffChart').getContext('2d');
    chartInstances.timeOffChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [
          {
            label: 'Total Waktu Libur (hari)',
            data: timeOffData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)', // Hijau
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Jumlah Karyawan',
            data: employeeCounts,
            backgroundColor: 'rgba(156, 163, 175, 0.5)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
        //   title: {
        //     display: true,
        //     text: 'Total Waktu Libur per Departemen',
        //     font: { size: 16 }
        //   },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.datasetIndex === 0
                  ? `Total Libur: ${context.raw} hari`
                  : `Jumlah Karyawan: ${context.raw}`;
              },
              afterLabel: function(context) {
                const dept = departments[context.dataIndex];
                const avg = (timeOffData[context.dataIndex] / employeeCounts[context.dataIndex]).toFixed(1);
                return `Rata-rata: ${avg} hari/orang`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Total Hari Libur'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Jumlah Karyawan'
            },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    // Tampilkan tabel detail
    renderTimeOffDetails(data, departments);

  } catch (error) {
    console.error('Error:', error);
  }
}

function processTimeOffData(data) {
  // Kelompokkan data per departemen
  const departmentStats = data.reduce((acc, curr) => {
    const dept = curr.organization || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = {
        totalTimeOff: 0,
        employees: 0
      };
    }
    acc[dept].totalTimeOff += curr.total_all_time_off_day || 0;
    acc[dept].employees++;
    return acc;
  }, {});

  // Konversi ke array dan urutkan
  const sortedDepartments = Object.entries(departmentStats)
    .map(([name, stats]) => ({
      name,
      totalTimeOff: stats.totalTimeOff,
      employeeCount: stats.employees,
      avgTimeOff: stats.totalTimeOff / stats.employees
    }))
    .sort((a, b) => b.totalTimeOff - a.totalTimeOff);

  // Ambil 10 departemen teratas
  const topDepartments = sortedDepartments.slice(0, 10);

  return {
    departments: topDepartments.map(d => d.name),
    timeOffData: topDepartments.map(d => d.totalTimeOff),
    employeeCounts: topDepartments.map(d => d.employeeCount)
  };
}

function renderTimeOffDetails(data, departments) {
  const container = document.getElementById('timeOffDetails');

  // Hitung statistik detail
  const timeOffDetails = departments.map(dept => {
    const deptData = data.filter(d => d.organization === dept);
    const totalTimeOff = deptData.reduce((sum, d) => sum + (d.total_all_time_off_day || 0), 0);
    const totalEmployees = deptData.length;

    return {
      name: dept,
      totalTimeOff,
      totalEmployees,
      avgTimeOff: (totalTimeOff / totalEmployees).toFixed(1),
      topEmployees: [...deptData]
        .sort((a, b) => (b.total_all_time_off_day || 0) - (a.total_all_time_off_day || 0))
        .slice(0, 3)
    };
  });

  // Buat tabel
  container.innerHTML = `
    <h3>Detail Waktu Libur</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Departemen</th>
            <th>Total Libur (hari)</th>
            <th>Jumlah Karyawan</th>
            <th>Rata-rata</th>
            <th>Karyawan dengan Waktu Libur Terbanyak</th>
          </tr>
        </thead>
        <tbody>
          ${timeOffDetails.map(dept => `
            <tr>
              <td>${dept.name}</td>
              <td class="time-off">${dept.totalTimeOff}</td>
              <td>${dept.totalEmployees}</td>
              <td class="time-off">${dept.avgTimeOff} hari/orang</td>
              <td>
                <ul class="employee-list">
                  ${dept.topEmployees.map(emp => `
                    <li>${emp.full_name} (${emp.total_all_time_off_day || 0} hari)</li>
                  `).join('')}
                </ul>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
