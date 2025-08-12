import { Chart, chartInstances } from './index.js';

export function renderAttendancePatternChart(data) {
  try {
    // Proses data untuk mendapatkan pola absensi
    const { departments, noCheckInData, noCheckOutData, invalidData } = processPatternData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.attendancePatternChart) {
      chartInstances.attendancePatternChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('attendancePatternChart').getContext('2d');
    chartInstances.attendancePatternChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [
          {
            label: 'No Check In',
            data: noCheckInData,
            backgroundColor: 'rgba(234, 88, 12, 0.7)', // Orange
            borderColor: 'rgba(234, 88, 12, 1)',
            borderWidth: 1
          },
          {
            label: 'No Check Out',
            data: noCheckOutData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Invalid',
            data: invalidData,
            backgroundColor: 'rgba(220, 38, 38, 0.7)', // Red
            borderColor: 'rgba(220, 38, 38, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Analisis Pola Absensi Lainnya',
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label}: ${value} kasus`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Kasus'
            }
          }
        }
      }
    });

    // Tampilkan tabel detail
    renderPatternDetails(data, departments);

  } catch (error) {
    console.error('Error:', error);
  }
}

function processPatternData(data) {
  // Kelompokkan data per department
  const departmentStats = data.reduce((acc, curr) => {
    const dept = curr.organization || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = {
        noCheckIn: 0,
        noCheckOut: 0,
        invalid: 0,
        employeeCount: 0
      };
    }
    acc[dept].noCheckIn += curr.total_no_check_in;
    acc[dept].noCheckOut += curr.total_no_check_out;
    acc[dept].invalid += curr.total_invalid;
    acc[dept].employeeCount++;
    return acc;
  }, {});

  // Konversi ke array dan urutkan berdasarkan total kasus
  const departments = Object.keys(departmentStats).sort((a, b) => {
    const totalA = departmentStats[a].noCheckIn + departmentStats[a].noCheckOut + departmentStats[a].invalid;
    const totalB = departmentStats[b].noCheckIn + departmentStats[b].noCheckOut + departmentStats[b].invalid;
    return totalB - totalA;
  }).slice(0, 10); // Ambil 10 teratas

  return {
    departments,
    noCheckInData: departments.map(dept => departmentStats[dept].noCheckIn),
    noCheckOutData: departments.map(dept => departmentStats[dept].noCheckOut),
    invalidData: departments.map(dept => departmentStats[dept].invalid)
  };
}

function renderPatternDetails(data, departments) {
  const container = document.getElementById('patternDetails');

  // Hitung statistik detail
  const patternDetails = departments.map(dept => {
    const deptData = data.filter(d => d.organization === dept);
    return {
      name: dept,
      totalNoCheckIn: deptData.reduce((sum, d) => sum + d.total_no_check_in, 0),
      totalNoCheckOut: deptData.reduce((sum, d) => sum + d.total_no_check_out, 0),
      totalInvalid: deptData.reduce((sum, d) => sum + d.total_invalid, 0),
      employeeCount: deptData.length
    };
  });

  // Buat tabel
  container.innerHTML = `
    <h3>Detail Pola Absensi</h3>
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>No Check In</th>
            <th>No Check Out</th>
            <th>Invalid</th>
            <th>Total Kasus</th>
            <th>Jumlah Karyawan</th>
          </tr>
        </thead>
        <tbody>
          ${patternDetails.map(dept => `
            <tr>
              <td>${dept.name}</td>
              <td class="no-check-in">${dept.totalNoCheckIn}</td>
              <td class="no-check-out">${dept.totalNoCheckOut}</td>
              <td class="invalid">${dept.totalInvalid}</td>
              <td class="total">${dept.totalNoCheckIn + dept.totalNoCheckOut + dept.totalInvalid}</td>
              <td>${dept.employeeCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
