/**
 * NumerologyChart Component
 * 
 * Chart component for visualizing numerology data.
 * Supports recharts or chart.js when installed.
 */

'use client'

import * as React from "react"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface NumerologyChartProps {
  data: ChartDataPoint[]
  type?: 'line' | 'bar' | 'pie' | 'area'
  title?: string
  height?: number
  className?: string
}

/**
 * Simple SVG-based chart (fallback when chart libraries not available)
 */
function SimpleChart({ data, type = 'bar', height = 200 }: NumerologyChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = 100 / data.length

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full"
      style={{ height: `${height}px` }}
      preserveAspectRatio="none"
    >
      {type === 'bar' &&
        data.map((point, index) => {
          const barHeight = (point.value / maxValue) * 80
          const x = (index * barWidth) + (barWidth * 0.1)
          const width = barWidth * 0.8
          const y = 90 - barHeight

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={point.color || 'currentColor'}
                opacity={0.7}
                className="hover:opacity-100 transition-opacity"
              />
              <text
                x={x + width / 2}
                y="95"
                textAnchor="middle"
                fontSize="3"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {point.label}
              </text>
              <text
                x={x + width / 2}
                y={y - 2}
                textAnchor="middle"
                fontSize="3"
                fill="currentColor"
                className="font-semibold"
              >
                {point.value}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

export function NumerologyChart({
  data,
  type = 'bar',
  title,
  height = 200,
  className,
}: NumerologyChartProps) {
  // Try to use recharts if available
  const [ChartComponent, setChartComponent] = React.useState<React.ComponentType<any> | null>(null)
  const [chartError, setChartError] = React.useState(false)

  React.useEffect(() => {
    // Try to dynamically import recharts
    import('recharts')
      .then((recharts) => {
        // Recharts is available
        const { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts

        const components: Record<string, React.ComponentType<any>> = {
          line: ({ data, height }: any) => (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          ),
          bar: ({ data, height }: any) => (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ),
          pie: ({ data, height }: any) => (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={height / 3}
                  fill="#8884d8"
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ),
          area: ({ data, height }: any) => (
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          ),
        }

        setChartComponent(() => components[type] || components.bar)
      })
      .catch(() => {
        // Recharts not available, use simple chart
        setChartError(true)
      })
  }, [type])

  const chartData = data.map((point) => ({
    label: point.label,
    value: point.value,
  }))

  return (
    <BaseCard variant="default" padding="md" className={className}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 font-['Playfair_Display']">
          {title}
        </h3>
      )}
      {ChartComponent ? (
        <ChartComponent data={chartData} height={height} />
      ) : (
        <SimpleChart data={data} type={type} height={height} />
      )}
    </BaseCard>
  )
}

/**
 * Life Cycle Chart - Visualizes numerology life cycles
 */
export function LifeCycleChart({
  cycles,
  className,
}: {
  cycles: Array<{ period: string; number: number; description: string }>
  className?: string
}) {
  const data = cycles.map((cycle) => ({
    label: cycle.period,
    value: cycle.number,
  }))

  return (
    <NumerologyChart
      data={data}
      type="line"
      title="Life Cycles"
      className={className}
    />
  )
}

/**
 * Compatibility Chart - Visualizes relationship compatibility scores
 */
export function CompatibilityChart({
  scores,
  className,
}: {
  scores: Array<{ category: string; score: number }>
  className?: string
}) {
  const data = scores.map((score) => ({
    label: score.category,
    value: score.score,
    color: score.score >= 80 ? '#10b981' : score.score >= 60 ? '#f59e0b' : '#ef4444',
  }))

  return (
    <NumerologyChart
      data={data}
      type="bar"
      title="Compatibility Scores"
      className={className}
    />
  )
}

