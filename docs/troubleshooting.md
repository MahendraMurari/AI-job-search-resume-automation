# Troubleshooting

This document captures the main issues encountered while building and testing the workflow, along with the fixes.

## Gemini API: 429 Too Many Requests

### Problem

The workflow failed with a Gemini quota error when too many resumes were generated in one run.

### Cause

The free tier had a low daily request limit for the selected model.

### Fix

- Test with smaller batches first.
- Use a lighter model for development.
- Add retry behavior where appropriate.
- Move to a paid API tier for larger daily runs.

## Gemini API: 503 Service Unavailable

### Problem

The LLM node failed with a service unavailable error.

### Cause

The model endpoint was temporarily under high demand.

### Fix

- Retry after a short delay.
- Enable retry settings on the LLM node.
- Use a fallback model if available.

## Supabase Duplicate Key Error

### Problem

The workflow failed with a duplicate key error when inserting into the jobs table.

### Cause

A job URL that was already stored in Supabase was inserted again.

### Fix

- Normalize LinkedIn job URLs.
- Check Supabase before processing a job.
- Use job_url as the primary key.
- Configure the Supabase insert node to continue on duplicate insert errors when appropriate.

## n8n fetch is not defined

### Problem

A Code node failed because `fetch` was not available.

### Cause

The n8n Code node environment did not support browser-style `fetch`.

### Fix

Use n8n's built-in helper instead:

this.helpers.httpRequest

## n8n Multiple Matches Error

### Problem

The workflow failed with a multiple matches error when processing several jobs.

### Cause

Some nodes used `.item` references even though multiple items were available.

### Fix

Use current item data when possible.

Use `.first()` only for true global configuration nodes.

Avoid unsafe references like:

$('Some Multi Item Node').item

For global config nodes, this is acceptable:

$('Workflow Configuration1').first().json

## Only One Resume Link or Attachment Appeared

### Problem

The email contained multiple job rows but only one resume link or one attachment.

### Cause

A previous node produced only one downstream item, often after a failed duplicate insert or manual recovery run.

### Fix

Check item counts across nodes:

- Build LaTeX Resume should output one item per job.
- Compile LaTeX to PDF should output one item per job.
- Upload PDF to Drive should output one item per job.
- Email Summary should combine all uploaded PDF links into one email.

## Broken Hyphens or Percentage Ranges

### Problem

Generated PDFs showed broken ranges such as missing hyphens or malformed percentages.

### Cause

LLM output and LaTeX rendering introduced formatting inconsistencies.

### Fix

- Add prompt rules to use simple ASCII characters.
- Normalize text before LaTeX generation.
- Avoid special dash characters when possible.

## Unknown Role or Bad PDF Filename

### Problem

Some generated PDFs had weak or fallback names.

### Cause

The metadata node did not receive clean company or title values.

### Fix

- Carry job metadata through each node.
- Use safe fallback logic.
- Simplify resume file naming.

Example:

Candidate Name - Company Name.pdf

## Email Links Not Clickable

### Problem

Some PDF Resume values appeared as plain text or broken links.

### Cause

The email summary had missing PDF IDs for some rows.

### Fix

Make sure the Email Summary node reads all uploaded Drive items and pairs them with job metadata by index.

## Public Repo Security Checklist

Before publishing:

- Remove API keys.
- Remove tokens.
- Remove Supabase URLs and keys.
- Remove Google Doc IDs.
- Remove Google Drive folder IDs.
- Remove real email addresses and phone numbers.
- Remove private resume content.
- Sanitize screenshots.
- Rotate any token that was accidentally exported.