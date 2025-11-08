import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { ChartProps } from '../types/components.ts'

const DEFAULT_COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1']

const defaultTooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
}

const Chart: React.FC<ChartProps> = ({ type, data, height = 300, xKey = 'date', yKeys = ['value'], colors = DEFAULT_COLORS, showTooltip = true, showLegend = true }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <span className="text-sm text-gray-500">Pas de données</span>
      </div>
    )
  }

  const renderLine = () => (
    <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey={xKey} stroke="#6b7280" />
      <YAxis stroke="#6b7280" />
      {showTooltip && <Tooltip contentStyle={defaultTooltipStyle} />}
      {showLegend && <Legend />}
      {yKeys.map((key, i) => (
        <Line key={key} type="monotone" dataKey={key} name={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
      ))}
    </LineChart>
  )

  const renderBar = () => (
    <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey={xKey} stroke="#6b7280" />
      <YAxis stroke="#6b7280" />
      {showTooltip && <Tooltip contentStyle={defaultTooltipStyle} />}
      {showLegend && <Legend />}
      {yKeys.map((key, i) => (
        <Bar key={key} dataKey={key} name={key} fill={colors[i % colors.length]} />
      ))}
    </BarChart>
  )

  const renderPie = () => {
    const pieData = (data as any[]).map((d: any) => ({ name: d.name ?? d.date ?? d.month, value: d.value ?? d.total ?? 0 }))
    return (
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {pieData.map((_, idx) => (
            <Cell key={`c-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        {showTooltip && <Tooltip contentStyle={defaultTooltipStyle} />}
        {showLegend && <Legend />}
      </PieChart>
    )
  }

  const content = (() => {
    switch (type) {
      case 'line':
        return renderLine()
      case 'bar':
        return renderBar()
      case 'pie':
        return renderPie()
      default:
        return renderLine()
    }
  })()

  return (
    <ResponsiveContainer width="100%" height={height}>
      {content}
    </ResponsiveContainer>
  )
}

export default Chart
