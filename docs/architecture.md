# Architecture

This project is an n8n-based workflow automation system for AI-assisted job search and resume preparation.

The system is designed as a modular pipeline:

Job Discovery
  → Job Parsing
  → Duplicate Tracking
  → Resume Retrieval
  → LLM Resume Tailoring
  → LaTeX PDF Generation
  → Cloud Storage
  → Email Summary

## High-Level Components

### n8n

n8n acts as the workflow orchestrator. It connects external services, manages data flow between nodes, runs custom JavaScript, and schedules the workflow.

### Apify

Apify is used to retrieve recent job postings from a configured LinkedIn search URL. The workflow requests more jobs than it needs because some jobs may be duplicates, missing descriptions, or already processed.

### Supabase

Supabase stores processed job records. The job_url field is used as the primary key so the same job is not processed repeatedly across workflow runs.

### Google Docs

The source resume is stored as a Google Doc. The workflow retrieves the resume text and provides it to the LLM along with the target job description.

### LLM Resume Optimizer

The LLM receives the current resume and job description, then returns a tailored resume in a strict plain-text section format. The prompt includes truthfulness rules, fixed section headers, and formatting safety rules.

### LaTeX PDF Generation

A custom JavaScript node converts the LLM-generated resume text into LaTeX. The LaTeX is compiled into a PDF so the output is consistent and ATS-friendly.

### Google Drive

Generated PDFs are uploaded to Google Drive and shared using generated file links.

### Gmail

The workflow sends a daily summary email with job links and generated resume links.

## Data Flow

1. Schedule trigger starts the workflow.
2. Configuration values are loaded.
3. LinkedIn search URL is generated.
4. Apify fetches job listings.
5. Job results are parsed and normalized.
6. Supabase filters out already processed jobs.
7. Resume text is retrieved from Google Docs.
8. LLM tailors the resume for each job.
9. Job metadata is merged with LLM output.
10. Resume text is converted to LaTeX.
11. LaTeX is compiled to PDF.
12. PDF is uploaded to Google Drive.
13. Job record is stored in Supabase.
14. Gmail sends a daily summary.

## Human-in-the-Loop Design

The workflow does not submit applications automatically. It prepares resume drafts and related links so the user can review each output and decide whether to apply.