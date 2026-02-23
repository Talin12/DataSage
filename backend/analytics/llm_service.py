import os
import re
import requests
import json


HF_API_URL = "https://router.huggingface.co/v1/chat/completions"


def analyze_prompt_with_llm(prompt, schema, sample_rows):
    """
    Sends structured dataset context + user prompt to Hugging Face LLM
    and returns raw string output.
    """

    api_key = os.getenv("HUGGINGFACE_API_KEY")

    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY not found in environment variables.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    system_message = f"""You are a data visualization assistant.

Your job is to analyze structured dataset information and convert
natural language requests into a structured JSON visualization plan.

DATASET SCHEMA:
{json.dumps(schema, indent=2)}

SAMPLE ROWS:
{json.dumps(sample_rows, indent=2)}

OUTPUT REQUIREMENTS:
- Return ONLY raw JSON.
- Do NOT include markdown formatting.
- Do NOT include ```json or backticks.
- Do NOT include explanations or conversational text.
- The output must strictly match this schema:

{{
  "type": "chart" | "table" | "summary",
  "blocks": [
    {{
      "title": "string",
      "chart_type": "bar" | "line" | "pie" | null,
      "x_axis": "string" | null,
      "y_axis": "string" | null,
      "aggregation": "sum" | "count" | "average" | null
    }}
  ],
  "warnings": []
}}

If the request cannot be fulfilled using the schema provided,
return a valid JSON response with warnings explaining why."""

    payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct:cerebras",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
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

    return result["choices"][0]["message"]["content"].strip()