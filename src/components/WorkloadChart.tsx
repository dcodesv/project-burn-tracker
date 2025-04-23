
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkloadData } from "@/types/openproject";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface WorkloadChartProps {
  data: WorkloadData[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  const chartData = data.map(item => ({
    name: item.user.name,
    assigned: item.assignedTasks,
    completed: item.completedTasks,
    hours: Number((item.estimatedHours).toFixed(1))
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Carga laboral por desarrollador</CardTitle>
        <CardDescription>Distribución de tareas en el equipo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text 
                        x={0} 
                        y={0} 
                        dy={16} 
                        textAnchor="end" 
                        fill="#666" 
                        fontSize={12} 
                        transform="rotate(-45)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
                height={60} 
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value, name) => {
                if (name === "hours") return [`${value} horas`, "Horas estimadas"];
                if (name === "assigned") return [value, "Tareas asignadas"];
                if (name === "completed") return [value, "Tareas completadas"];
                return [value, name];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="assigned" name="Tareas asignadas" fill="#8884d8" />
              <Bar yAxisId="left" dataKey="completed" name="Tareas completadas" fill="#82ca9d" />
              <Bar yAxisId="right" dataKey="hours" name="Horas estimadas" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
