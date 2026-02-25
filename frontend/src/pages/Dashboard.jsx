import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import DatasetSelector from '../components/DatasetSelector'
import PromptInput from '../components/PromptInput'
import ResultPanel from '../components/ResultPanel'
import api from '../services/api'

const SAMPLE_QUESTIONS = {
  1: [
    'Show me a bar chart of sales by region',
    'What were the top 5 products by revenue?',
    'Line chart of monthly sales trends',
    'Which region had the lowest Q4 performance?',
  ],
  2: [
    'Show me daily website traffic as a line chart',
    'What are the top 5 traffic sources?',
    'Bar chart of bounce rate by page',
    'Which pages had the highest conversion rate?',
  ],
  3: [
    'Show me headcount by department as a bar chart',
    'What is the average salary by role?',
    'Pie chart of employee tenure distribution',
    'Which department has the highest attrition rate?',
  ],
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const Page = styled.div`
  animation: ${fadeIn} 0.6s ease both;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 48px 24px;
  max-width: 780px;
  margin: 0 auto;
  gap: 40px;
`

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Eyebrow = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #64ffda;
`

const Title = styled.h1`
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #f0f6ff;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: #4a6070;
  margin-top: 4px;
  line-height: 1.5;
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, #1e2a3a 0%, transparent 100%);
`

const Card = styled.div`
  background: #0d0d18;
  border: 1px solid #1a2030;
  border-radius: 10px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const ErrorBanner = styled.div`
  background: rgba(255, 80, 80, 0.08);
  border: 1px solid rgba(255, 80, 80, 0.3);
  border-radius: 6px;
  color: #ff6b6b;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  padding: 12px 16px;
`

function Dashboard() {
  const [selectedDatasetId, setSelectedDatasetId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (text) => {
    if (!selectedDatasetId) {
      setError('Please select a dataset first.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const res = await api.post('ask/', {
        dataset_id: selectedDatasetId,
        prompt: text,
      })
      setDashboardData(res.data)
    } catch (err) {
      console.error('Submission error:', err)
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Page>
      <Header>
        <Eyebrow>▸ AI Analytics</Eyebrow>
        <Title>Data Dashboard</Title>
        <Subtitle>Select a dataset, describe what you want to see,<br />and let the model do the rest.</Subtitle>
      </Header>

      <Divider />

      <Card>
        <DatasetSelector onSelect={setSelectedDatasetId} />
        <PromptInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          sampleQuestions={SAMPLE_QUESTIONS[selectedDatasetId] || []}
        />
        {error && <ErrorBanner>⚠ {error}</ErrorBanner>}
      </Card>

      <ResultPanel data={dashboardData} />
    </Page>
  )
}

export default Dashboard