import DynamicChart from './blocks/DynamicChart'
import DataTable from './blocks/DataTable'
import KPICard from './blocks/KPICard'

function BlockRenderer({ block }) {
  if (block.chart_type === 'bar' || block.chart_type === 'line' || block.chart_type === 'pie') {
    return <DynamicChart block={block} />
  }
  if (block.type === 'table') {
    return <DataTable block={block} />
  }
  if (block.type === 'kpi' || block.type === 'summary') {
    return <KPICard title={block.title} value={block.value} />
  }
  return <p style={{ color: '#4a6070', fontFamily: 'Space Mono', fontSize: 12 }}>Unsupported block type: {block.type}</p>
}

export default BlockRenderer