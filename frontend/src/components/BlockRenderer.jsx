import DynamicChart from './blocks/DynamicChart'
import DataTable from './blocks/DataTable'
import KPICard from './blocks/KPICard'

function BlockRenderer({ block }) {
  if (block.render === 'chart') {
    return <DynamicChart block={block} />
  }
  if (block.render === 'table') {
    return <DataTable block={block} />
  }
  if (block.render === 'kpi') {
    return <KPICard block={block} />
  }
  return (
    <p style={{ color: '#4a6070', fontFamily: 'Space Mono', fontSize: 12 }}>
      Unsupported block type: {block.render}
    </p>
  )
}

export default BlockRenderer