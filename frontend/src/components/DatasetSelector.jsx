import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import api from '../services/api'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${fadeIn} 0.4s ease both;
`

const Label = styled.label`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64ffda;
`

const Select = styled.select`
  background: #0f0f1a;
  border: 1px solid #1e2a3a;
  border-radius: 6px;
  color: #e2e8f0;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  padding: 12px 16px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364ffda' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;

  &:focus {
    border-color: #64ffda;
    box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.08);
  }

  option {
    background: #0f0f1a;
  }
`

function DatasetSelector({ onSelect }) {
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    api.get('datasets/')
      .then(res => setDatasets(res.data))
      .catch(err => console.error('Failed to load datasets:', err))
  }, [])

  return (
    <Wrapper>
      <Label htmlFor="dataset-select">Dataset</Label>
      <Select
        id="dataset-select"
        onChange={e => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>— Select a dataset —</option>
        {datasets.map(ds => (
          <option key={ds.id} value={ds.id}>{ds.name}</option>
        ))}
      </Select>
    </Wrapper>
  )
}

export default DatasetSelector