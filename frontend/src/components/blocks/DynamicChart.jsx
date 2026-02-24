import styled, { keyframes } from 'styled-components'
import {
  BarChart, Bar, Cell as BarCell,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LabelList
} from 'recharts'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Wrapper = styled.div`
  animation: ${fadeUp} 0.4s ease both;
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-left: 3px solid #64ffda;
  border-radius: 8px;
  padding: 24px 28px;
`

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #f0f6ff;
  margin-bottom: 6px;
`

const Meta = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: #3a5060;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
`

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

const StatChip = styled.div`
  background: rgba(100, 255, 218, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.12);
  border-radius: 6px;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const StatLabel = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: #4a6070;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #64ffda;
  letter-spacing: -0.02em;
`

const TruncNote = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: #ffb432;
  margin-bottom: 14px;
  letter-spacing: 0.08em;
`

const TooltipBox = styled.div`
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: #e2e8f0;
`

const COLORS = ['#64ffda', '#4a9eff', '#ff6b9d', '#ffb432', '#a78bfa', '#34d399', '#f97316', '#e879f9']

const MAX_SERIES = 8

const AXIS_STYLE = {
  tick: { fill: '#4a6070', fontFamily: 'Space Mono', fontSize: 11 },
  axisLine: { stroke: '#1e2a3a' },
  tickLine: false,
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <TooltipBox>
      <div style={{ color: '#64ffda', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></div>
      ))}
    </TooltipBox>
  )
}

function PieCustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <TooltipBox>
      <div style={{ color: '#64ffda', marginBottom: 4 }}>{p.name}</div>
      <div>Count: <strong>{p.value.toLocaleString()}</strong></div>
      <div>Share: <strong>{p.payload.percent}</strong></div>
    </TooltipBox>
  )
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#0a0a0f" textAnchor="middle" dominantBaseline="central"
      fontFamily="Space Mono" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function computeStats(data, y) {
  const vals = data.map(d => Number(d[y])).filter(v => !isNaN(v))
  if (!vals.length) return null
  return {
    total: vals.reduce((a, b) => a + b, 0),
    max: Math.max(...vals),
    min: Math.min(...vals),
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  }
}

function DynamicChart({ block }) {
  const data = Array.isArray(block.data) ? block.data : []
  const rawLength = data.length

  // Task 4: enforce maximum of 8 series before any further slicing
  const seriesLimited = data.slice(0, MAX_SERIES)
  const isSeriesTruncated = rawLength > MAX_SERIES

  const isTruncated = seriesLimited.length > 50
  const chartData = seriesLimited.slice(0, 50)

  const x = block.x_axis
  const y = block.y_axis
  const margin = { top: 16, right: 16, left: 0, bottom: 0 }

  const total = chartData.reduce((sum, d) => sum + Number(d[y] || 0), 0)
  const enrichedPieData = chartData.map(d => ({
    ...d,
    percent: `${((Number(d[y]) / total) * 100).toFixed(1)}%`
  }))

  const stats = computeStats(chartData, y)

  if (!data.length) {
    return (
      <Wrapper>
        <Title>{block.title}</Title>
        <p style={{ color: '#ff6b6b', fontSize: 12, fontFamily: 'Space Mono' }}>⚠ No data returned from SQL query.</p>
      </Wrapper>
    )
  }

  let chart = null

  if (block.chart_type === 'bar') {
    chart = (
      <BarChart data={chartData} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} tickFormatter={v => v.toLocaleString()} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={y} radius={[3, 3, 0, 0]}>
          {chartData.map((_, i) => (
            <BarCell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList dataKey={y} position="top"
            style={{ fill: '#4a6070', fontFamily: 'Space Mono', fontSize: 10 }}
            formatter={v => v.toLocaleString()} />
        </Bar>
      </BarChart>
    )
  } else if (block.chart_type === 'line') {
    chart = (
      <LineChart data={chartData} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} tickFormatter={v => v.toLocaleString()} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={y} stroke="#64ffda" strokeWidth={2}
          dot={{ fill: '#64ffda', r: 4 }} activeDot={{ r: 6 }}>
          <LabelList dataKey={y} position="top"
            style={{ fill: '#4a6070', fontFamily: 'Space Mono', fontSize: 10 }}
            formatter={v => v.toLocaleString()} />
        </Line>
      </LineChart>
    )
  } else if (block.chart_type === 'pie') {
    chart = (
      <PieChart>
        <Pie
          data={enrichedPieData}
          dataKey={y}
          nameKey={x}
          cx="50%" cy="50%"
          outerRadius={120}
          paddingAngle={2}
          labelLine={false}
          label={renderPieLabel}
        >
          {enrichedPieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieCustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: '#a0b4c0', fontFamily: 'Space Mono', fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    )
  }

  if (!chart) return null

  return (
    <Wrapper>
      <Title>{block.title}</Title>
      <Meta>
        {[block.chart_type, x && `x: ${x}`, y && `y: ${y}`]
          .filter(Boolean).join('  ·  ')}
      </Meta>

      {stats && (
        <StatsRow>
          <StatChip>
            <StatLabel>Total</StatLabel>
            <StatValue>{stats.total.toLocaleString()}</StatValue>
          </StatChip>
          <StatChip>
            <StatLabel>Max</StatLabel>
            <StatValue>{stats.max.toLocaleString()}</StatValue>
          </StatChip>
          <StatChip>
            <StatLabel>Min</StatLabel>
            <StatValue>{stats.min.toLocaleString()}</StatValue>
          </StatChip>
          <StatChip>
            <StatLabel>Avg</StatLabel>
            <StatValue>{Math.round(stats.avg).toLocaleString()}</StatValue>
          </StatChip>
        </StatsRow>
      )}

      {isSeriesTruncated && (
        <TruncNote>⚠ Showing top {MAX_SERIES} of {rawLength} series</TruncNote>
      )}

      {isTruncated && (
        <TruncNote>⚠ Showing top 50 of {seriesLimited.length} data points</TruncNote>
      )}

      <ResponsiveContainer width="100%" height={300}>
        {chart}
      </ResponsiveContainer>
    </Wrapper>
  )
}

export default DynamicChart