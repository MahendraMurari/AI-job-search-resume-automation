/**
 * filter-duplicates.js
 *
 * Sanitized n8n Code node logic for checking whether a job was already
 * processed in Supabase.
 *
 * This version uses n8n's httpRequest helper instead of fetch.
 */

const allJobs = $input.all();
const config = $('Workflow Configuration1').first().json;

const supabaseUrl = config.supabaseUrl || '{{SUPABASE_URL}}';
const supabaseKey = config.supabaseKey || '{{SUPABASE_ANON_KEY}}';

async function jobExists(jobUrl) {
  if (!jobUrl) return true;

  const encodedUrl = encodeURIComponent(jobUrl);

  const response = await this.helpers.httpRequest({
    method: 'GET',
    url: `${supabaseUrl}/rest/v1/jobs?job_url=eq.${encodedUrl}&select=job_url`,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    json: true
  });

  return Array.isArray(response) && response.length > 0;
}

const newJobs = [];

for (const job of allJobs) {
  const jobUrl = job.json.jobLink || job.json.job_url || '';

  if (!jobUrl) continue;

  const exists = await jobExists.call(this, jobUrl);

  if (!exists) {
    newJobs.push(job);
  }
}

return newJobs;