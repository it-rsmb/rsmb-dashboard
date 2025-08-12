import { Chart, chartInstances } from './index.js';

export function renderTopLateInDepartments(data) {
  try {
    // Proses data untuk mendapatkan 5 department terlambat tertinggi
    const { topDepartments, lateInCounts } = processLateInData(data);

    // Hapus chart sebelumnya jika ada
    if (chartInstances.topLateInChart) {
      chartInstances.topLateInChart.destroy();
    }

    // Buat chart
    const ctx = document.getElementById('topLateInChart').getContext('2d');
    chartInstances.topLateInChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topDepartments,
        datasets: [{
          label: 'Total Keterlambatan',
          data: lateInCounts,
          backgroundColor: 'rgba(234, 88, 12, 0.7)',
          borderColor: 'rgba(234, 88, 12, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
        //   title: {
        //     display: true,
        //     text: '5 Department dengan Keterlambatan Tertinggi',
        //     font: { size: 16 }
        //   },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw} kali terlambat`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Keterlambatan'
            }
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

function processLateInData(data) {
  // Kelompokkan data per department
  const departmentStats = data.reduce((acc, curr) => {
    const dept = curr.organization || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = {
        totalLateIn: 0,
        employees: 0
      };
    }
    acc[dept].totalLateIn += curr.total_late_in;
    acc[dept].employees++;
    return acc;
  }, {});

  // Konversi ke array
  const departments = Object.entries(departmentStats).map(([name, stats]) => ({
    name,
    totalLateIn: stats.totalLateIn,
    avgLateIn: stats.totalLateIn / stats.employees,
    employeeCount: stats.employees
  }));

  // Urutkan berdasarkan total keterlambatan dan ambil 5 teratas
  const sortedDepartments = [...departments].sort((a, b) => b.totalLateIn - a.totalLateIn);
  const topDepartments = sortedDepartments.slice(0, 5).map(d => d.name);

  return {
    topDepartments,
    lateInCounts: topDepartments.map(dept =>
      departments.find(d => d.name === dept).totalLateIn
    )
  };
}

function renderDepartmentDetails(data, topDepartments) {
  const container = document.getElementById('departmentDetails');

  // Hitung statistik detail
  const departmentDetails = topDepartments.map(dept => {
    const deptData = data.filter(d => d.organization === dept);
    return {
      name: dept,
      totalEmployees: deptData.length,
      totalLateIn: deptData.reduce((sum, d) => sum + d.total_late_in, 0),
      avgLateIn: (deptData.reduce((sum, d) => sum + d.total_late_in, 0) / deptData.length)
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
          <th>Total Keterlambatan</th>
          <th>Rata-rata per Karyawan</th>
        </tr>
      </thead>
      <tbody>
        ${departmentDetails.map(dept => `
          <tr>
            <td>${dept.name}</td>
            <td>${dept.totalEmployees}</td>
            <td class="late-in">${dept.totalLateIn} kali</td>
            <td class="late-in">${dept.avgLateIn.toFixed(1)} kali</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
