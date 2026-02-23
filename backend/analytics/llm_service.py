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
1. Write a valid PostgreSQL SELECT query to answer the user's request.
2. The data is stored in a table named `analytics_record`.
3. The actual fields are stored inside a JSONB column named `row_data`.
4. To query fields use JSONB syntax: `row_data->>'field_name'` for text, or cast like `(row_data->>'revenue')::numeric` for numbers.
5. Always filter by dataset: `dataset_id = %s`
6. NEVER cast values to JSON (no ::json). Only cast to ::numeric, ::float, or ::int.
7. Always use simple column aliases (e.g. AS region, AS total_revenue) with no spaces or special characters.

STRICT OUTPUT RULES:
- Return ONLY a raw JSON object.
- Do NOT use markdown.
- Do NOT wrap in ```json or ``` or any backticks.
- Do NOT add any text before or after the JSON.
- Start your response with {{ and end with }}

The JSON must match this exact schema:
{{
  "sql": "SELECT row_data->>'region' AS region, SUM((row_data->>'revenue')::numeric) AS total_revenue FROM analytics_record WHERE dataset_id = %s GROUP BY row_data->>'region';",
  "chart_type": "bar" | "line" | "pie" | "table",
  "title": "string",
  "x_axis": "exact_sql_alias_for_x",
  "y_axis": "exact_sql_alias_for_y"
}}
"""

    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct:cerebras",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Return only raw JSON for: {prompt}"},
        ],
        "temperature": 0.1,
        "max_tokens": 500,
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

    # Strip markdown fences
    raw = re.sub(r"```json|```", "", raw).strip()

    # Extract just the JSON object
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in LLM output: {raw}")

    return raw[start:end]