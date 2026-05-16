# Workflow Overview

This document explains the major n8n workflow nodes and what each one does.

## Daily 7 AM Trigger

Starts the workflow on a daily schedule.

## Workflow Configuration

Stores reusable configuration values such as job search query, Apify actor ID, destination email, Supabase URL, and resume document ID.

In the public version, these values are replaced with environment-style placeholders.

## Get Resume from Google Drive / Google Docs

Retrieves the base resume from Google Docs and extracts the full text so it can be passed to the LLM.

## Build LinkedIn URL

Builds a LinkedIn search URL using the configured job search query.

## Apify - Fetch Jobs

Starts an Apify actor run to collect job postings from the generated LinkedIn URL.

## Check Apify Status and Wait

Polls the Apify run until it succeeds. A wait node prevents excessive polling.

## Fetch Apify Results

Fetches job results from the Apify dataset after the actor run completes.

## Parse Apify Job Results

Cleans and normalizes job postings. This step extracts company, title, location, posted date, job URL, job key, and job description.

Important logic:
- strips HTML from job descriptions
- normalizes LinkedIn job URLs
- removes duplicate jobs in the same batch
- skips jobs with missing or weak descriptions

## Limit Jobs

Limits how many jobs continue into resume generation. The production workflow can be adjusted based on LLM quota and desired volume.

## Filter Out Duplicates

Checks Supabase to skip jobs already processed in previous workflow runs.

## Prepare Job Query

Prepares the current job item for the LLM agent.

## ATS Optimizer Agent

Uses an LLM to tailor the resume to the job description. The agent follows strict rules to avoid hallucinating experience, employers, titles, tools, metrics, or certifications.

## Merge Job Data

Combines the LLM output with the original job metadata so the resume remains connected to the correct company, title, and job link.

## Store Job Record

Stores processed job metadata in Supabase to avoid duplicate processing in future runs.

## Build LaTeX Resume

Converts structured resume text into LaTeX. This node also handles:
- LaTeX escaping
- formatting normalization
- date and percentage cleanup
- fixed header formatting
- project and certification formatting

## Compile LaTeX to PDF

Sends the LaTeX document to a PDF compilation endpoint and receives the generated PDF binary.

## Prep PDF Metadata

Creates a clean PDF filename and carries job metadata forward.

## Upload PDF to Drive

Uploads the generated PDF to Google Drive.

## Share PDF

Creates a shareable Google Drive link for the generated resume.

## Email Summary

Builds a single HTML email containing company, role, posted date, job link, and resume link.

## Send Gmail Message

Sends the final daily summary email.
