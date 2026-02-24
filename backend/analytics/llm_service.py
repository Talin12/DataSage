import os
import re
import requests
import json


HF_API_URL = "https://router.huggingface.co/v1/chat/completions"


def analyze_prompt_with_llm(prompt, schema, sample_rows):
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY not found in environment variables.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    system_message = f"""
You are an expert PostgreSQL data analyst.
You will be given a dataset schema, sample rows, and a user's natural language request.

DATASET SCHEMA:
{json.dumps(schema, indent=2)}

SAMPLE ROWS:
{json.dumps(sample_rows, indent=2)}

USER REQUEST:
"{prompt}"

YOUR TASK:
Analyze the request and return a dashboard composed of one or more blocks.
Each block can be a KPI, a chart, or a table.

DATABASE RULES:
1. The data is stored in a table named `analytics_record`.
2. The actual fields are stored inside a JSONB column named `row_data`.
3. To query fields use JSONB syntax: `row_data->>'field_name'` for text, or cast like `(row_data->>'revenue')::numeric` for numbers.
4. Always filter by dataset: `dataset_id = %s`
5. NEVER cast values to JSON (no ::json). Only cast to ::numeric, ::float, or ::int.
6. Always use simple column aliases (e.g. AS region, AS total_revenue) with no spaces or special characters.

CRITICAL — JSONB COLUMN ACCESS:
- The table `analytics_record` has NO direct columns for your dataset fields.
- Fields like `page_views`, `revenue`, `region`, `date`, etc. DO NOT exist as table columns.
- They ONLY exist inside the `row_data` JSONB column.
- You MUST ALWAYS access them via `row_data->>'field_name'`.
- This rule applies EVERYWHERE: SELECT, WHERE, GROUP BY, ORDER BY — no exceptions.
- Referencing a dataset field directly (e.g. `page_views`, `revenue`) WILL cause a crash.

BAD SQL vs GOOD SQL:

  BAD — direct column reference (WILL CRASH):
    SELECT region, SUM(page_views) FROM analytics_record
    WHERE dataset_id = %s AND page_views > 100
    GROUP BY region
    ORDER BY page_views DESC

  GOOD — correct JSONB access:
    SELECT
      row_data->>'region' AS region,
      SUM((row_data->>'page_views')::numeric) AS total_page_views
    FROM analytics_record
    WHERE dataset_id = %s
      AND (row_data->>'page_views')::numeric > 100
    GROUP BY row_data->>'region'
    ORDER BY total_page_views DESC

BLOCK TYPES AND THEIR REQUIRED FIELDS:

1. KPI block — a single scalar value (e.g. total revenue, record count):
{{
  "render": "kpi",
  "title": "string",
  "sql": "SELECT ... FROM analytics_record WHERE dataset_id = %s"
}}
The SQL for a KPI must return exactly one row and one column. The alias of that column is the value label.

2. Chart block — a bar, line, or pie chart:
{{
  "render": "chart",
  "title": "string",
  "chart_type": "bar" | "line" | "pie",
  "x_axis": "exact_sql_alias_for_x",
  "y_axis": "exact_sql_alias_for_y",
  "sql": "SELECT ... FROM analytics_record WHERE dataset_id = %s"
}}

3. Table block — raw tabular data:
{{
  "render": "table",
  "title": "string",
  "sql": "SELECT ... FROM analytics_record WHERE dataset_id = %s"
}}

STRICT OUTPUT RULES:
- Return ONLY a raw JSON array of block objects.
- Do NOT use markdown.
- Do NOT wrap in ```json or ``` or any backticks.
- Do NOT add any text before or after the JSON.
- Start your response with [ and end with ]
- Return at least one block. Return multiple blocks when the request calls for it.

Example of a valid two-block response:
[
  {{
    "render": "kpi",
    "title": "Total Revenue",
    "sql": "SELECT SUM((row_data->>'revenue')::numeric) AS total_revenue FROM analytics_record WHERE dataset_id = %s"
  }},
  {{
    "render": "chart",
    "title": "Revenue by Region",
    "chart_type": "bar",
    "x_axis": "region",
    "y_axis": "total_revenue",
    "sql": "SELECT row_data->>'region' AS region, SUM((row_data->>'revenue')::numeric) AS total_revenue FROM analytics_record WHERE dataset_id = %s GROUP BY row_data->>'region'"
  }}
]
"""

    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct:cerebras",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Return only a raw JSON array of blocks for: {prompt}"},
        ],
        "temperature": 0.1,
        "max_tokens": 1000,
    }

    response = requests.post(
        HF_API_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        raise Exception(f"Hugging Face API Error: {response.text}")

    result = response.json()
    raw = result["choices"][0]["message"]["content"].strip()

    print("RAW LLM OUTPUT:", repr(raw))

    raw = re.sub(r"```json|```", "", raw).strip()

    start = raw.find("[")
    end = raw.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON array found in LLM output: {raw}")

    return raw[start:end]