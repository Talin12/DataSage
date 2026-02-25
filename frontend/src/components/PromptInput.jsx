import { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`

const pillFadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeIn} 0.4s ease 0.1s both;
`

const Label = styled.label`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64ffda;
`

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
`

const Pill = styled.button`
  background: rgba(100, 255, 218, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 20px;
  color: #64ffda;
  cursor: pointer;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 6px 14px;
  transition: background 0.2s, border-color 0.2s, transform 0.1s;
  animation: ${pillFadeIn} 0.3s ease both;
  animation-delay: ${p => p.$index * 0.05}s;

  &:hover {
    background: rgba(100, 255, 218, 0.12);
    border-color: rgba(100, 255, 218, 0.5);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const Textarea = styled.textarea`
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-radius: 6px;
  color: #e2e8f0;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 14px 16px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #64ffda;
    box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.08);
  }

  &::placeholder { color: #3a4a5a; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const Button = styled.button`
  align-self: flex-end;
  background: ${p => p.$loading ? 'transparent' : '#64ffda'};
  border: 2px solid #64ffda;
  border-radius: 6px;
  color: ${p => p.$loading ? '#64ffda' : '#0a0a0f'};
  cursor: ${p => p.$loading ? 'not-allowed' : 'pointer'};
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 12px 28px;
  text-transform: uppercase;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  ${p => p.$loading && css`animation: ${pulse} 1.5s ease infinite;`}

  &:hover:not(:disabled) {
    background: #4dd9b8;
    border-color: #4dd9b8;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(100, 255, 218, 0.2);
  }

  &:active:not(:disabled) { transform: translateY(0); }
`

function PromptInput({ onSubmit, isLoading, sampleQuestions = [] }) {
  const [text, setText] = useState('')

  return (
    <Wrapper>
      <Label htmlFor="prompt-input">Natural Language Query</Label>

      {sampleQuestions.length > 0 && (
        <PillsRow>
          {sampleQuestions.map((q, i) => (
            <Pill
              key={q}
              $index={i}
              onClick={() => setText(q)}
              disabled={isLoading}
            >
              {q}
            </Pill>
          ))}
        </PillsRow>
      )}

      <Textarea
        id="prompt-input"
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder='e.g. "Show me a bar chart of sales by region"'
        disabled={isLoading}
      />
      <Button
        onClick={() => text.trim() && onSubmit(text)}
        disabled={isLoading}
        $loading={isLoading}
      >
        {isLoading ? '⟳ Analyzing data...' : 'Run Query →'}
      </Button>
    </Wrapper>
  )
}

export default PromptInput