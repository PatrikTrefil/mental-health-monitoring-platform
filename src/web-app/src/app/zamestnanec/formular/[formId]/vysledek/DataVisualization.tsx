"use client";

import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

export type ChartType = (typeof ChartTypes)[keyof typeof ChartTypes];

export const ChartTypes = {
    bar: "Sloupcový graf",
    pie: "Koláčový graf",
} as const;

/**
 * Component for visualizing data.
 * @param root0 - Props.
 * @param root0.data - Data to visualize.
 * @param root0.chartType - Type of chart to use.
 * @throws {Error} - If the chart type is unsupported. Should not happen if the {@link ChartType} type is used.
 */
export default function DataVisualization({
    data,
    chartType: selectedChartType,
}: {
    data: { name: string; value: number }[];
    chartType: ChartType;
}) {
    let chart: React.ReactNode;
    switch (selectedChartType) {
        case ChartTypes.bar:
            chart = (
                <BarChart
                    data={data}
                    margin={{
                        top: 30,
                        right: 30,
                        left: 0,
                        bottom: 50,
                    }}
                >
                    <Bar dataKey="value" fill="#8884d8" />
                    <XAxis dataKey="name" />
                    <YAxis />
                </BarChart>
            );
            break;
        case ChartTypes.pie:
            chart = (
                <PieChart>
                    <Pie
                        dataKey="value"
                        data={data}
                        nameKey="name"
                        fill="#8884d8"
                        label={(ctx) => `${ctx.name} (${ctx.value})`}
                        innerRadius="40%"
                        outerRadius="70%"
                    />
                </PieChart>
            );
            break;
        default:
            throw new Error("Unknown chart type");
    }

    return (
        <ResponsiveContainer height={window.innerHeight / 2}>
            {chart}
        </ResponsiveContainer>
    );
}
