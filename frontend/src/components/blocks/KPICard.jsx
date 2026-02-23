import styled, { keyframes } from 'styled-components'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Card = styled.div`
  animation: ${fadeUp} 0.4s ease both;
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-top: 3px solid #64ffda;
  border-radius: 8px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Title = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #4a6070;
`

const Value = styled.div`
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #64ffda;
  line-height: 1;
`

function KPICard({ title, value }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value ?? '—'}</Value>
    </Card>
  )
}

export default KPICard