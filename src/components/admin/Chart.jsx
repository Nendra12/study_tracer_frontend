import React from "react";
import Chart from "react-apexcharts";
// Import ThemeContext untuk mengambil warna dinamis
import { useThemeSettings } from "../../context/ThemeContext";

// --- Fungsi Bantuan: Menghasilkan palet warna dari 1 warna HEX ---
// (Berguna untuk Pie Chart yang butuh banyak warna senada)
function generateShades(hex, count = 5) {
  if (!hex || !/^#[0-9A-F]{6}$/i.test(hex)) return ["#3C5759", "#526061", "#9CA3AF", "#D0D5CE", "#E8B44B"];
  
  const rgb = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
  
  const shades = [];
  for (let i = 0; i < count; i++) {
    // Mencampurkan warna asli dengan abu-abu/putih secara bertahap
    const mixRatio = i / count; 
    const mixed = rgb.map(c => Math.round(c + (200 - c) * mixRatio));
    shades.push(`#${mixed[0].toString(16).padStart(2,'0')}${mixed[1].toString(16).padStart(2,'0')}${mixed[2].toString(16).padStart(2,'0')}`);
  }
  return shades;
}

export function ChartsPenyelesaian({ approved = 0, total = 0 }) {
  const { theme } = useThemeSettings(); // Panggil context
  const primaryColor = theme?.primaryColor || "#3C5759";
  const secondaryColor = theme?.secondaryColor || "#F3F4F4";

  const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;
  const series = [percentage];

  const options = {
    chart: {
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "75%",
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "14px",
            formatter: function () {
              return "Tingkat Penyelesaian";
            },
          },
          value: {
            fontSize: "28px",
            fontWeight: 600,
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Disetujui", "Belum"],
    // 👇 Ganti warna statis dengan warna dinamis 👇
    colors: [primaryColor, secondaryColor], 
    legend: {
      show: true,
      position: "bottom",
    },
  };

  return (
    <div style={{ width: 300 }}>
      <h4
        style={{ textAlign: "center", letterSpacing: 2 }}
        className="text-sm font-bold text-primary/80"
      >
        Penyelesaian Persetujuan
      </h4>
      <Chart options={options} series={series} type="radialBar" height={250} />
    </div>
  );
}

export function ChartKarir({ data = [] }) {
  const { theme } = useThemeSettings(); // Panggil context
  const primaryColor = theme?.primaryColor || "#3C5759";
  
  // Menghasilkan 5 warna turunan yang senada dari primaryColor
  const dynamicColors = generateShades(primaryColor, 5);

  const defaultData = [
    { status: "Bekerja", total: 44 },
    { status: "Kuliah", total: 55 },
    { status: "Wirausaha", total: 10 },
    { status: "Mencari Kerja", total: 29 },
  ];
  const chartData = data.length > 0 ? data : defaultData;
  const series = chartData.map((item) => item.total);

  const options = {
    chart: {
      type: "pie",
    },
    labels: chartData.map((item) => item.status),
    // 👇 Gunakan palet warna dinamis 👇
    colors: dynamicColors, 
    legend: {
      position: "bottom",
      fontSize: "14px",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
    stroke: {
      colors: ["#fff"],
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px"
      }}
      className="h-full border border-gray-100 shadow-sm"
    >
      <Chart options={options} series={series} type="pie" height={320} />
    </div>
  );
}

export function ChartJurusan({ data: propData = [] }) {
  const { theme } = useThemeSettings(); // Panggil context
  const primaryColor = theme?.primaryColor || "#3C5759";

  const defaultData = [
    { jurusan: "RPL", total: 120 },
    { jurusan: "TKJ", total: 95 },
    { jurusan: "Multimedia", total: 70 },
    { jurusan: "Akuntansi", total: 55 },
    { jurusan: "BDP", total: 40 },
  ];
  // Merge duplicates (same jurusan name from different IDs) and sort descending
  const rawData = propData.length > 0 ? propData : defaultData;
  const merged = rawData.reduce((acc, item) => {
    const key = item.jurusan;
    if (acc[key]) {
      acc[key].total += item.total;
    } else {
      acc[key] = { ...item };
    }
    return acc;
  }, {});
  const data = Object.values(merged).sort((a, b) => b.total - a.total);

  const series = [
    {
      name: "Jumlah Alumni",
      data: data.map((item) => item.total),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: data.map((item) => item.jurusan),
    },
    // 👇 Ganti warna statis dengan warna dinamis 👇
    colors: [primaryColor], 
    grid: {
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => val + " alumni",
      },
    },
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
      }}
      className="border border-gray-100 shadow-sm"
    >
      <Chart options={options} series={series} type="bar" height={320} />
    </div>
  );
}