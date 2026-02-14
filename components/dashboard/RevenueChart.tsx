'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const revenueData = [
  { month: 'Ene', revenue: 4000, invoices: 12 },
  { month: 'Feb', revenue: 3000, invoices: 8 },
  { month: 'Mar', revenue: 5000, invoices: 15 },
  { month: 'Abr', revenue: 4500, invoices: 13 },
  { month: 'May', revenue: 6000, invoices: 18 },
  { month: 'Jun', revenue: 5500, invoices: 16 },
];

const clientGrowthData = [
  { month: 'Ene', newClients: 5, totalClients: 45 },
  { month: 'Feb', newClients: 8, totalClients: 53 },
  { month: 'Mar', newClients: 12, totalClients: 65 },
  { month: 'Abr', newClients: 6, totalClients: 71 },
  { month: 'May', newClients: 10, totalClients: 81 },
  { month: 'Jun', newClients: 8, totalClients: 89 },
];

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tendencia de Ingresos</CardTitle>
        <CardDescription>Ingresos mensuales de los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="month" 
              className="text-gray-600"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-gray-600"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number | undefined) => [`$${value?.toLocaleString() || 0}`, 'Ingresos']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ClientGrowthChart({ className }: RevenueChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Crecimiento de Clientes</CardTitle>
        <CardDescription>Nuevos clientes y total acumulado</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clientGrowthData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis 
              dataKey="month" 
              className="text-gray-600"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-gray-600"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar 
              dataKey="newClients" 
              fill="#10b981" 
              name="Nuevos Clientes"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="totalClients" 
              fill="#6366f1" 
              name="Total Clientes"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
