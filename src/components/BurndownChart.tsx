
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BurndownData } from "@/types/openproject";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BurndownChartProps {
  data: BurndownData;
}

export function BurndownChart({ data }: BurndownChartProps) {
  const chartData = data.dates.map((date, i) => ({
    date,
    ideal: data.ideal[i],
    actual: data.actual[i]
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Diagrama de quemado</CardTitle>
        <CardDescription>Progreso del sprint actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => {
                  // Format date to display in a shorter way
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Fecha: ${new Date(label).toLocaleDateString()}`}
                formatter={(value, name) => {
                  return [value, name === 'ideal' ? 'Ideal' : 'Real'];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#8884d8"
                name="Ideal"
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#82ca9d"
                name="Real"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
