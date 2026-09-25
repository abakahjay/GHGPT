import { useMemo } from "react";
import { Box, Flex, Spinner, Text, useColorModeValue, useToken } from "@chakra-ui/react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// Renders a ```chart block written by the AI:
// { type: 'bar'|'line'|'area'|'pie', title?, xKey, series: [keys], data: [{...}] }
const PALETTE = ["#3182ce", "#e53e3e", "#d69e2e", "#38a169", "#805ad5", "#dd6b20", "#319795", "#d53f8c"];

function parseSpec(source) {
    try {
        const spec = JSON.parse(source);
        if (!Array.isArray(spec.data) || spec.data.length === 0) return null;
        const xKey = spec.xKey || Object.keys(spec.data[0]).find((k) => typeof spec.data[0][k] === "string") || "name";
        // Keep only series that name real fields; models sometimes list the values instead.
        const named = Array.isArray(spec.series)
            ? spec.series.filter((k) => typeof k === "string" && k !== xKey && k in spec.data[0])
            : [];
        const series = (named.length
            ? named
            : Object.keys(spec.data[0]).filter((k) => k !== xKey && !Number.isNaN(Number(spec.data[0][k])))
        ).slice(0, 8);
        if (!series.length) return null;
        const data = spec.data.map((row) => {
            const out = { ...row };
            series.forEach((k) => {
                out[k] = Number(row[k]);
            });
            return out;
        });
        return { type: ["bar", "line", "area", "pie"].includes(spec.type) ? spec.type : "bar", title: spec.title, xKey, series, data };
    } catch {
        return null;
    }
}

export default function ChartBlock({ source, streaming }) {
    const spec = useMemo(() => parseSpec(source), [source]);
    const [gridColor, textColor] = useToken("colors", [useColorModeValue("gray.200", "whiteAlpha.200"), useColorModeValue("gray.600", "gray.400")]);
    const tooltipBg = useColorModeValue("#ffffff", "#1d1a2a");

    if (!spec) {
        return (
            <Flex my={3} p={4} borderWidth="1px" borderColor="border.default" borderRadius="lg" align="center" gap={2} color="text.muted" fontSize="sm">
                {streaming ? <><Spinner size="xs" /> Building chart…</> : "This chart's data couldn't be read."}
            </Flex>
        );
    }

    const axis = { stroke: textColor, fontSize: 12, tickLine: false };
    const tooltip = <Tooltip contentStyle={{ background: tooltipBg, borderRadius: 8, border: `1px solid ${gridColor}` }} />;
    const common = { data: spec.data, margin: { top: 8, right: 16, left: 0, bottom: 8 } };

    let chart;
    if (spec.type === "pie") {
        const key = spec.series[0];
        chart = (
            <PieChart>
                <Pie data={spec.data} dataKey={key} nameKey={spec.xKey} outerRadius="75%" label>
                    {spec.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                {tooltip}
                <Legend />
            </PieChart>
        );
    } else {
        const Chart = spec.type === "line" ? LineChart : spec.type === "area" ? AreaChart : BarChart;
        chart = (
            <Chart {...common}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey={spec.xKey} {...axis} />
                <YAxis {...axis} width={48} />
                {tooltip}
                {spec.series.length > 1 && <Legend />}
                {spec.series.map((key, i) => {
                    const color = PALETTE[i % PALETTE.length];
                    if (spec.type === "line") return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3 }} />;
                    if (spec.type === "area") return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.25} />;
                    return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />;
                })}
            </Chart>
        );
    }

    return (
        <Box my={3} p={{ base: 2, md: 4 }} borderWidth="1px" borderColor="border.default" borderRadius="lg" bg="bg.surface">
            {spec.title && <Text fontWeight="semibold" fontSize="sm" mb={2} px={2}>{spec.title}</Text>}
            <Box h={{ base: "240px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>
            </Box>
        </Box>
    );
}
