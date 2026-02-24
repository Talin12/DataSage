import styled, { keyframes } from 'styled-components'

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
  overflow-x: auto;
`

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #f0f6ff;
  margin-bottom: 18px;
`

const RowCount = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: #ffb432;
  margin-bottom: 14px;
  letter-spacing: 0.08em;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`

const Th = styled.th`
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64ffda;
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid #1e2a3a;
`

const Td = styled.td`
  color: #a0b4c0;
  padding: 10px 14px;
  border-bottom: 1px solid #111827;
  tr:last-child & { border-bottom: none; }
`

const Tr = styled.tr`
  transition: background 0.15s;
  &:hover { background: rgba(100, 255, 218, 0.03); }
`

function formatCell(value) {
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return parseFloat(value.toFixed(2))
  }
  return value ?? '—'
}

function DataTable({ block }) {
  const columns = block.columns || []
  const data = block.data || []
  const truncated = data.slice(0, 500)
  const isTruncated = data.length > 500

  if (!columns.length && !data.length) {
    return (
      <Wrapper>
        <Title>{block.title}</Title>
        <p style={{ color: '#4a6070', fontFamily: 'Space Mono', fontSize: 12 }}>No table data available.</p>
      </Wrapper>
    )
  }

  const cols = columns.length ? columns : Object.keys(truncated[0] || {})

  return (
    <Wrapper>
      <Title>{block.title}</Title>
      {isTruncated && (
        <RowCount>⚠ Showing top 500 of {data.length} rows</RowCount>
      )}
      <Table>
        <thead>
          <tr>{cols.map(col => <Th key={col}>{col}</Th>)}</tr>
        </thead>
        <tbody>
          {truncated.map((row, i) => (
            <Tr key={i}>
              {cols.map(col => <Td key={col}>{formatCell(row[col])}</Td>)}
            </Tr>
          ))}
        </tbody>
      </Table>
    </Wrapper>
  )
}

export default DataTable