import styled, { keyframes } from 'styled-components'
import BlockRenderer from './BlockRenderer'

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

const SectionLabel = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64ffda;
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

function ResultPanel({ data }) {
  if (!data || !data.blocks?.length) return null

  return (
    <Panel>
      <SectionLabel>▸ Query Result</SectionLabel>

      {data.warnings?.length > 0 && (
        <WarningBanner>⚠ {data.warnings.join(' · ')}</WarningBanner>
      )}

      {data.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </Panel>
  )
}

export default ResultPanel