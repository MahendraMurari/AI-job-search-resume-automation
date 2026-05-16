# Setup Guide

This guide explains how to set up the sanitized version of the AI job search and resume automation workflow.

This repository is a portfolio version of the project. It does not include private credentials, API keys, personal resume content, Google Drive links, Supabase URLs, or job-board credentials.

## Prerequisites

You need the following accounts and tools:

- n8n
- Apify account
- Supabase project
- Google Drive and Gmail access
- Google Docs resume source
- Gemini API key or another LLM provider
- Optional VPS or Docker setup for scheduled execution

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-job-search-resume-automation.git
cd ai-job-search-resume-automation
```

## 2. Create Environment Configuration

Copy the example environment file:

cp .env.example .env

Then update .env with your own values.

Do not commit .env to GitHub.

## 3. Create the Supabase Table

Create a table named jobs using the schema in:

samples/sample-supabase-schema.sql

The basic schema is:

create table if not exists jobs (
  job_url text primary key,
  job_title text,
  company text,
  job_key text,
  processed_at timestamptz default now()
);

The workflow uses this table to avoid processing the same job more than once.

## 4. Prepare the Resume Source

Store your base resume as a Google Doc.

The workflow expects a Google Docs document ID, not a local Word file.

Add the document ID to your configuration:

GOOGLE_DOC_RESUME_ID=your_google_doc_resume_id

## 5. Configure Apify

Create or use an Apify actor for job scraping.

Update:

APIFY_ACTOR_ID=your_apify_actor_id
APIFY_TOKEN=your_apify_token

The workflow sends a search URL to Apify and fetches job results from the generated dataset.

## 6. Configure Google Drive and Gmail

In n8n, connect Google Drive and Gmail credentials.

Google Drive is used to upload generated resume PDFs.

Gmail is used to send the daily summary email.

## 7. Configure the LLM

The workflow was tested with Gemini Flash and Gemini Flash-Lite.

Example:

GEMINI_MODEL=models/gemini-2.5-flash-lite

Free-tier model limits can be restrictive. For larger daily batches, a paid API tier may be needed.

## 8. Import the n8n Workflow

Import:

workflows/n8n-workflow-sanitized.json

Then update the configuration node or environment variables with your own values.

## 9. Test with a Small Batch

Start with a small job limit:

MAX_JOBS_TO_PROCESS=2

Confirm that:

- jobs are fetched
- duplicate filtering works
- the LLM generates resume text
- PDFs are generated
- PDFs upload to Google Drive
- the Gmail summary contains working links

Then increase the limit gradually.

## 10. Schedule the Workflow

Once the workflow is tested, enable the schedule trigger.

The original workflow used a daily morning schedule, but the schedule can be adjusted based on preference and API limits.

## Safety Notes

- Do not commit API keys or credentials.
- Do not publish private resume content.
- Do not publish real Google Drive links unless intended.
- Keep the final application decision human-reviewed.
- Respect job board and data provider terms of service.