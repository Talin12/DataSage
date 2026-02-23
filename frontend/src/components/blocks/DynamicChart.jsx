import styled, { keyframes } from 'styled-components'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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
  margin-bottom: 24px;
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
        <div key={i}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </TooltipBox>
  )
}

function normalizeData(block) {
  const raw = Array.isArray(block.data) && block.data.length ? block.data : (
    ['Jan','Feb','Mar','Apr','May','Jun'].map(name => ({
      [block.x_axis || 'category']: name,
      [block.y_axis || 'value']: Math.floor(Math.random() * 800 + 200),
    }))
  )
  return raw.slice(0, 8)
}

function DynamicChart({ block }) {
  const rawLength = Array.isArray(block.data) ? block.data.length : 0
  const data = normalizeData(block)
  const isTruncated = rawLength > 8
  const x = block.x_axis || 'category'
  const y = block.y_axis || 'value'
  const margin = { top: 8, right: 16, left: 0, bottom: 0 }

  let chart = null

  if (block.chart_type === 'bar') {
    chart = (
      <BarChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={y} fill="#64ffda" radius={[3, 3, 0, 0]} />
      </BarChart>
    )
  } else if (block.chart_type === 'line') {
    chart = (
      <LineChart data={data} margin={margin}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...AXIS_STYLE} />
        <YAxis {...AXIS_STYLE} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={y} stroke="#64ffda" strokeWidth={2}
          dot={{ fill: '#64ffda', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    )
  } else if (block.chart_type === 'pie') {
    chart = (
      <PieChart>
        <Pie data={data} dataKey={y} nameKey={x} cx="50%" cy="50%"
          outerRadius={110} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, color: '#4a6070' }} />
      </PieChart>
    )
  }

  if (!chart) return null

  return (
    <Wrapper>
      <Title>{block.title}</Title>
      <Meta>
        {[block.chart_type, x && `x: ${x}`, y && `y: ${y}`, block.aggregation]
          .filter(Boolean).join('  ·  ')}
      </Meta>
      {isTruncated && (
        <TruncNote>⚠ Showing top 8 of {rawLength} data points</TruncNote>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {chart}
      </ResponsiveContainer>
    </Wrapper>
  )
}

export default DynamicChart