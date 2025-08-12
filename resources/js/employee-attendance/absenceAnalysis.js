import { Chart, chartInstances } from './index.js';

export function renderTopAbsenceDepartments(data) {
  try {
    // Proses data untuk mendapatkan 5 department dengan absensi terbanyak
    const { topDepartments, absenceCounts, employeeCounts } = processAbsenceData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.topAbsenceChart) {
      chartInstances.topAbsenceChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('topAbsenceChart').getContext('2d');
    chartInstances.topAbsenceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topDepartments,
        datasets: [
          {
            label: 'Total Absensi',
            data: absenceCounts,
            backgroundColor: 'rgba(220, 38, 38, 0.7)',
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Jumlah Karyawan',
            data: employeeCounts,
            backgroundColor: 'rgba(75, 85, 99, 0.5)',
            borderColor: 'rgba(75, 85, 99, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '5 Department dengan Absensi Terbanyak',
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.datasetIndex === 0
                  ? `Total Absen: ${context.raw} hari`
                  : `Jumlah Karyawan: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Total Hari Absen' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Jumlah Karyawan' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    // Tampilkan tabel detail
    renderDepartmentDetails(data, topDepartments);

  } catch (error) {
    console.error('Error:', error);
  }
}

function processAbsenceData(data) {
  // Kelompokkan data per department
  const departmentStats = data.reduce((acc, curr) => {
    const dept = curr.organization || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = {
        totalAbsence: 0,
        employees: 0
      };
    }
    acc[dept].totalAbsence += curr.total_absence;
    acc[dept].employees++;
    return acc;
  }, {});

  // Konversi ke array dan urutkan
  const departments = Object.entries(departmentStats)
    .map(([name, stats]) => ({
      name,
      totalAbsence: stats.totalAbsence,
      employeeCount: stats.employees,
      avgAbsence: stats.totalAbsence / stats.employees
    }))
    .sort((a, b) => b.totalAbsence - a.totalAbsence);

  // Ambil 5 teratas
  const topDepartments = departments.slice(0, 5);

  return {
    topDepartments: topDepartments.map(d => d.name),
    absenceCounts: topDepartments.map(d => d.totalAbsence),
    employeeCounts: topDepartments.map(d => d.employeeCount)
  };
}

function renderDepartmentDetails(data, topDepartments) {
  const container = document.getElementById('departmentDetails');

  // Hitung statistik detail
  const departmentDetails = topDepartments.map(dept => {
    const deptData = data.filter(d => d.organization === dept);
    const totalAbsence = deptData.reduce((sum, d) => sum + d.total_absence, 0);
    const totalEmployees = deptData.length;

    return {
      name: dept,
      totalEmployees,
      totalAbsence,
      avgAbsence: (totalAbsence / totalEmployees).toFixed(1),
      topOffenders: [...deptData]
        .sort((a, b) => b.total_absence - a.total_absence)
        .slice(0, 3)
    };
  });

  // Buat tabel
  container.innerHTML = `
    <h3>Detail Department</h3>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th>Jumlah Karyawan</th>
          <th>Total Absen</th>
          <th>Rata-rata</th>
          <th>Karyawan dengan Absen Terbanyak</th>
        </tr>
      </thead>
      <tbody>
        ${departmentDetails.map(dept => `
          <tr>
            <td>${dept.name}</td>
            <td>${dept.totalEmployees}</td>
            <td class="absence">${dept.totalAbsence} hari</td>
            <td class="absence">${dept.avgAbsence} hari/orang</td>
            <td>
              <ul class="offender-list">
                ${dept.topOffenders.map(emp => `
                  <li>${emp.full_name} (${emp.total_absence} hari)</li>
                `).join('')}
              </ul>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
