/**
 * Adzuna Job Search Service
 * Fetches real job listings from Adzuna API based on user skills
 */
import { config } from '../../config/env.ts';

export interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: boolean;
  contract_time?: string;
  contract_type?: string;
  category: string;
  created: string;
  redirect_url: string;
  latitude?: number;
  longitude?: number;
}

export interface AdzunaSearchResult {
  count: number;
  results: AdzunaJob[];
  mean?: number;
}

/**
 * Search jobs on Adzuna based on skills keywords
 * @param skills - Array of skill names to search for
 * @param country - ISO 2-letter country code (default: 'in' for India)
 * @param page - Result page number (default: 1)
 * @param resultsPerPage - Number of results per page (default: 20)
 * @param location - Optional location filter
 * @param salaryMin - Optional minimum salary
 * @param salaryMax - Optional maximum salary
 * @param fullTime - Optional flag to filter full-time jobs (1 or 0)
 */
export async function searchAdzunaJobs(options: {
  skills: string[];
  country?: string;
  page?: number;
  resultsPerPage?: number;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  fullTime?: number;
  sortBy?: string;
}): Promise<AdzunaSearchResult> {
  const {
    skills,
    country = 'in',
    page = 1,
    resultsPerPage = 20,
    location,
    salaryMin,
    salaryMax,
    fullTime,
    sortBy,
  } = options;

  const appId = config.adzunaAppId;
  const appKey = config.adzunaAppKey;

  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY must be set in .env');
  }

  // Build the search query from skills — join the top skills for best results
  const whatQuery = skills.slice(0, 6).join(' ');

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(resultsPerPage),
    'content-type': 'application/json',
  });

  if (whatQuery) {
    params.set('what', whatQuery);
  }

  if (location) {
    params.set('where', location);
  }

  if (salaryMin !== undefined) {
    params.set('salary_min', String(salaryMin));
  }

  if (salaryMax !== undefined) {
    params.set('salary_max', String(salaryMax));
  }

  if (fullTime !== undefined) {
    params.set('full_time', String(fullTime));
  }

  if (sortBy) {
    params.set('sort_by', sortBy);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/${page}?${params.toString()}`;

  console.log(`[Adzuna] Searching: ${url.replace(appKey, '***')}`);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Adzuna] API Error ${response.status}: ${text}`);
    throw new Error(`Adzuna API returned status ${response.status}: ${text}`);
  }

  const data = (await response.json()) as any;

  // Map the Adzuna response to our cleaner interface
  const results: AdzunaJob[] = (data.results || []).map((job: any) => ({
    id: String(job.id),
    title: job.title || 'Untitled',
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Unknown Location',
    description: job.description || '',
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_is_predicted: job.salary_is_predicted === '1',
    contract_time: job.contract_time,
    contract_type: job.contract_type,
    category: job.category?.label || 'General',
    created: job.created,
    redirect_url: job.redirect_url,
    latitude: job.latitude,
    longitude: job.longitude,
  }));

  return {
    count: data.count || 0,
    results,
    mean: data.mean,
  };
}
