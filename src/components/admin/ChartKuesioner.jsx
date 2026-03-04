import React from "react";
import Chart from "react-apexcharts";

const ChartKuesioner = ({ subtitle, series = [], labels = [] }) => {
    const totalResponden = parseFloat(
        series.reduce((a, b) => a + b, 0).toFixed(2)
    );

    const chartOptions = {
        labels,
        chart: {
            type: "donut",
            fontFamily: "Inter, sans-serif",
            toolbar: { show: false },
        },
        colors: [
            "#6366f1",
            "#3b82f6",
            "#06b6d4",
            "#10b981",
            "#f59e0b",
            "#f43f5e",
        ],
        stroke: {
            show: false,
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`,
            style: {
                fontSize: "12px",
                fontWeight: 600,
            },
        },
        legend: {
            position: "bottom",
            fontSize: "13px",
            labels: {
                colors: "#475569",
            },
            itemMargin: {
                horizontal: 12,
                vertical: 6,
            },
            markers: {
                radius: 12,
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}%`,
            },
        },
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: "14px",
                            color: "#64748b",
                            offsetY: -8,
                        },
                        value: {
                            show: true,
                            fontSize: "26px",
                            fontWeight: "bold",
                            color: "#0f172a",
                            offsetY: 6,
                            formatter: (val) => `${val}%`,
                        },
                        total: {
                            show: true,
                            label: "Total Responden",
                            fontSize: "13px",
                            color: "#64748b",
                            formatter: () => totalResponden,
                        },
                    },
                },
            },
        },
        states: {
            hover: {
                filter: {
                    type: "lighten",
                    value: 0.05,
                },
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">

            {/* Pertanyaan */}
            {subtitle && (
                <h3 className="text-sm font-semibold text-slate-700 mb-6 leading-relaxed">
                    {subtitle}
                </h3>
            )}

            {/* Chart */}
            <div className="flex justify-center">
                <Chart
                    options={chartOptions}
                    series={series}
                    type="donut"
                    width="100%"
                    height="340"
                />
            </div>
        </div>
    );
};

export default ChartKuesioner;