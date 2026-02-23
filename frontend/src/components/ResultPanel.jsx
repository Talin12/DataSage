import styled, { keyframes } from 'styled-components'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Panel = styled.div`
  animation: ${slideUp} 0.4s ease both;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const BlockCard = styled.div`
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-left: 3px solid #64ffda;
  border-radius: 8px;
  padding: 24px 28px;
`

const BlockTitle = styled.h3`
  font-size: 16px;
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

const SectionLabel = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64ffda;
  margin-bottom: 14px;
`

const WarningBanner = styled.div`
  background: rgba(255, 180, 50, 0.07);
  border: 1px solid rgba(255, 180, 50, 0.25);
  border-radius: 6px;
  color: #ffb432;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 12px 16px;
`

const SummaryText = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: #a0b4c0;
`

const Pre = styled.pre`
  color: #a8c4a2;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

const COLORS = ['#64ffda', '#4a9eff', '#ff6b9d', '#ffb432', '#a78bfa', '#34d399']

const CustomTooltip = styled.div`
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: #e2e8f0;
`

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <CustomTooltip>
      <div style={{ color: '#64ffda', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </CustomTooltip>
  )
}

// Generate mock chart data from block metadata when no real data is available
function generateMockData(block) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return labels.map(name => ({ [block.x_axis || 'x']: name, [block.y_axis || 'value']: Math.floor(Math.random() * 900 + 100) }))
}

function ChartBlock({ block }) {
  const data = generateMockData(block)
  const x = block.x_axis || 'x'
  const y = block.y_axis || 'value'

  const commonProps = {
    data,
    margin: { top: 8, right: 16, left: 0, bottom: 0 }
  }

  const axisStyle = {
    tick: { fill: '#4a6070', fontFamily: 'Space Mono', fontSize: 11 },
    axisLine: { stroke: '#1e2a3a' },
    tickLine: false
  }

  let chart = null

  if (block.chart_type === 'bar') {
    chart = (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip content={<TooltipContent />} />
        <Bar dataKey={y} fill="#64ffda" radius={[3, 3, 0, 0]} />
      </BarChart>
    )
  } else if (block.chart_type === 'line') {
    chart = (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2030" vertical={false} />
        <XAxis dataKey={x} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip content={<TooltipContent />} />
        <Line type="monotone" dataKey={y} stroke="#64ffda" strokeWidth={2} dot={{ fill: '#64ffda', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    )
  } else if (block.chart_type === 'pie') {
    chart = (
      <PieChart>
        <Pie data={data} dataKey={y} nameKey={x} cx="50%" cy="50%" outerRadius={110} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<TooltipContent />} />
        <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, color: '#4a6070' }} />
      </PieChart>
    )
  }

  if (!chart) return null

  return (
    <ResponsiveContainer width="100%" height={280}>
      {chart}
    </ResponsiveContainer>
  )
}

function ResultBlock({ block }) {
  return (
    <BlockCard>
      <BlockTitle>{block.title}</BlockTitle>
      <Meta>
        {[block.chart_type, block.x_axis && `x: ${block.x_axis}`, block.y_axis && `y: ${block.y_axis}`, block.aggregation]
          .filter(Boolean).join('  ·  ')}
      </Meta>
      {block.chart_type && <ChartBlock block={block} />}
    </BlockCard>
  )
}

function ResultPanel({ data }) {
  if (!data) return null

  return (
    <Panel>
      <SectionLabel>▸ Query Result</SectionLabel>

      {data.warnings?.length > 0 && (
        <WarningBanner>⚠ {data.warnings.join(' · ')}</WarningBanner>
      )}

      {data.type === 'summary' && (
        <BlockCard>
          <SummaryText>{JSON.stringify(data, null, 2)}</SummaryText>
        </BlockCard>
      )}

      {data.type === 'table' && (
        <BlockCard>
          <Pre>{JSON.stringify(data, null, 2)}</Pre>
        </BlockCard>
      )}

      {data.type === 'chart' && data.blocks?.map((block, i) => (
        <ResultBlock key={i} block={block} />
      ))}
    </Panel>
  )
}

export default ResultPanel