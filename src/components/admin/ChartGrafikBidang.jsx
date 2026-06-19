import React from "react";
import Chart from "react-apexcharts";
import { useThemeSettings } from "../../context/ThemeContext";

// --- Pie Chart: Kesesuaian Bidang Keseluruhan ---
export function PieKesesuaian({ data = {} }) {
  const { theme } = useThemeSettings();
  const primaryColor = theme?.primaryColor || "#3C5759";

  const sesuai = data.sesuai ?? 0;
  const tidakSesuai = data.tidak_sesuai ?? 0;
  const belumDinilai = data.belum_dinilai ?? 0;
  const total = sesuai + tidakSesuai + belumDinilai;

  const series = [sesuai, tidakSesuai, belumDinilai];

  const options = {
    chart: { type: "donut" },
    labels: ["Sesuai Bidang", "Tidak Sesuai", "Belum Dinilai"],
    colors: [primaryColor, "#ef4444", "#d1d5db"],
    legend: {
      position: "bottom",
      fontSize: "13px",
      fontFamily: "Lexend, sans-serif",
      fontWeight: 600,
      markers: { size: 6, shape: "circle" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: true, fontSize: "13px", fontFamily: "Lexend", fontWeight: 700 },
            value: { show: true, fontSize: "24px", fontFamily: "Lexend", fontWeight: 800 },
            total: {
              show: true,
              label: "Total Alumni",
              fontSize: "12px",
              fontFamily: "Lexend",
              fontWeight: 600,
              color: "#9ca3af",
              formatter: () => total,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => Math.round(val) + "%",
      style: { fontSize: "12px", fontFamily: "Lexend", fontWeight: 700 },
    },
    stroke: { colors: ["#fff"], width: 3 },
    responsive: [
      {
        breakpoint: 768,
        options: { chart: { width: "100%" }, legend: { position: "bottom" } },
      },
    ],
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-fourth shadow-sm h-full flex flex-col justify-center">
      <h3 className="text-sm font-bold text-primary mb-4 text-center">Kesesuaian Bidang Keseluruhan</h3>
      {total > 0 ? (
        <Chart options={options} series={series} type="donut" height={320} />
      ) : (
        <div className="flex items-center justify-center h-60 text-third text-sm">Belum ada data kesesuaian</div>
      )}
    </div>
  );
}

// --- Bar Chart: Kesesuaian per Jurusan ---
export function BarKesesuaianJurusan({ data = [] }) {
  const { theme } = useThemeSettings();
  const primaryColor = theme?.primaryColor || "#3C5759";

  const categories = data.map((d) => d.jurusan || d.nama_jurusan || "Lainnya");
  const sesuaiData = data.map((d) => d.sesuai ?? 0);
  const tidakSesuaiData = data.map((d) => d.tidak_sesuai ?? 0);

  const series = [
    { name: "Sesuai Bidang", data: sesuaiData },
    { name: "Tidak Sesuai", data: tidakSesuaiData },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      fontFamily: "Lexend, sans-serif",
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "11px", fontWeight: 600, colors: "#9ca3af" },
        rotate: -35,
        rotateAlways: data.length > 5,
      },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", fontWeight: 600, colors: "#9ca3af" } },
    },
    colors: [primaryColor, "#ef4444"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      markers: { size: 6, shape: "circle" },
    },
    grid: { strokeDashArray: 4, borderColor: "#f3f4f4" },
    tooltip: {
      y: { formatter: (val) => val + " alumni" },
      theme: "light",
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: { bar: { columnWidth: "70%" } },
          xaxis: { labels: { rotate: -45 } },
        },
      },
    ],
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-fourth shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-primary mb-4">Kesesuaian Bidang per Jurusan</h3>
      {data.length > 0 ? (
        <div className="flex-1">
          <Chart options={options} series={series} type="bar" height={340} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-60 text-third text-sm">Belum ada data per jurusan</div>
      )}
    </div>
  );
}

// --- Line Chart: Kesesuaian per Tahun Lulus ---
export function LineKesesuaianTahun({ data = [] }) {
  const { theme } = useThemeSettings();
  const primaryColor = theme?.primaryColor || "#3C5759";

  const categories = data.map((d) => d.tahun_lulus || d.tahun || "");
  const sesuaiData = data.map((d) => d.sesuai ?? 0);
  const tidakSesuaiData = data.map((d) => d.tidak_sesuai ?? 0);

  const series = [
    { name: "Sesuai Bidang", data: sesuaiData },
    { name: "Tidak Sesuai", data: tidakSesuaiData },
  ];

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Lexend, sans-serif",
    },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px", fontWeight: 600, colors: "#9ca3af" } },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", fontWeight: 600, colors: "#9ca3af" } },
    },
    colors: [primaryColor, "#ef4444"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      markers: { size: 6, shape: "circle" },
    },
    grid: { strokeDashArray: 4, borderColor: "#f3f4f4" },
    tooltip: {
      y: { formatter: (val) => val + " alumni" },
      theme: "light",
    },
    markers: { size: 5, strokeWidth: 2, strokeColors: "#fff", hover: { size: 7 } },
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-fourth shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-primary mb-4">Tren Kesesuaian per Tahun Lulus</h3>
      {data.length > 0 ? (
        <div className="flex-1">
          <Chart options={options} series={series} type="area" height={340} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-60 text-third text-sm">Belum ada data per tahun</div>
      )}
    </div>
  );
}
