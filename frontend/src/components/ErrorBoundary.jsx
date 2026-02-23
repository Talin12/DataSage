import React from 'react'
import styled from 'styled-components'

const FallbackBox = styled.div`
  background: rgba(255, 80, 80, 0.06);
  border: 1px solid rgba(255, 80, 80, 0.25);
  border-radius: 8px;
  color: #ff6b6b;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 20px 24px;
  line-height: 1.6;
`

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('BlockRenderer error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackBox>
          ⚠ Failed to render this visualization. The AI generated an incompatible data format.
        </FallbackBox>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary