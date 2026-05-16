# Decisions and Tradeoffs

This document explains key product and engineering decisions made while building the workflow.

## Why Build This as a Workflow Automation Project?

The problem was repetitive and multi-step: find jobs, review descriptions, tailor resumes, generate PDFs, track processed jobs, store outputs, and send a summary.

A workflow automation approach was a good fit because the process involves many API integrations and repeatable steps.

## Why n8n?

n8n was selected because it provides:

- visual workflow orchestration
- scheduling
- built-in integrations
- custom JavaScript nodes
- API request nodes
- credential management
- easy debugging across workflow steps

The tradeoff is that multi-item data flow can be tricky. Some n8n expressions such as `.item` can fail when many jobs are processed at once, so multi-item handling had to be debugged carefully.

## Why Supabase?

Supabase was used as a lightweight database for persistent tracking.

The workflow needs to remember which jobs were already processed across daily runs. Supabase makes this simple by storing job URLs and using `job_url` as a primary key.

The tradeoff is that duplicate insert attempts can cause database errors if duplicate filtering misses an edge case. The workflow handles this by checking existing rows before insert and allowing duplicate insert errors to continue when needed.

## Why Use an LLM?

The LLM is used for resume tailoring because the task requires reading a job description, identifying relevant keywords, and rewriting resume content while preserving truthfulness.

The prompt uses strict rules to reduce hallucinations:
- do not invent employers, dates, tools, certifications, or metrics
- preserve fixed resume sections
- only use approved background facts
- return a structured plain-text resume

The tradeoff is cost and rate limits. Free-tier LLM APIs may not support large daily batches, so small batch testing and paid-tier planning are important.

## Why LaTeX for Resume PDFs?

The LLM generates structured resume text, but LaTeX controls the final document format.

This separation improves:
- PDF consistency
- ATS-friendly formatting
- spacing control
- bullet formatting
- header formatting
- predictable resume layout

The tradeoff is that LaTeX requires escaping special characters and normalizing symbols before compilation.

## Why Google Drive?

Google Drive stores generated PDFs and provides shareable resume links.

This makes the daily email cleaner because the email can include links instead of relying on multiple large attachments.

The tradeoff is that sharing permissions must be handled carefully.

## Why Gmail Summary?

A daily email summary makes the output easy to review.

Each row includes:
- company
- role
- posted date
- job link
- generated resume link

This supports a human-in-the-loop workflow where the user reviews the generated material before applying.

## Why Human-in-the-Loop?

The workflow does not apply to jobs automatically.

This is intentional because resume quality, job fit, and application decisions should be reviewed by the user. The workflow reduces repetitive preparation work while keeping final judgment human-controlled.

## Known Tradeoffs

- LLM output quality depends on prompt quality and resume source quality.
- Free-tier LLM limits can block larger batch runs.
- Job scraping reliability depends on the upstream data provider.
- Resume tailoring must be reviewed before use.
- Workflow screenshots and exports must be sanitized before publishing publicly.