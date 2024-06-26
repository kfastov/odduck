import { Octokit } from '@octokit/rest';

import { type RestEndpointMethodTypes } from '@octokit/rest';

export type Issue = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][0];
export type Label = Issue['labels'][0];

type Repo = {
    owner: string;
    repo: string;
};  

export const odHackRegex = /od\s*hack/i;

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const fetchIssuesForProject = async (owner: string, repo: string) => {
    try {
        const issues = await octokit.issues.listForRepo({
            owner,
            repo,
            state: 'open',
            assignee: 'none',
        });
        return issues.data.filter(issue => !issue.pull_request && !issue.assignee && (
            // Check if the issue has the 'odhack' label
            issue.labels.map(label => typeof label == 'string' ? label : label.name).some(label => odHackRegex.test(label ?? '')) ||
            // Or if the issue title contains 'odhack'
            odHackRegex.test(issue.title ?? '')
        ));
    } catch (error) {
        console.error('Error fetching issues:', error);
        return [];
    }
};

// Function to parse GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const parsedUrl = new URL(url);
      const [owner, repo] = parsedUrl.pathname.split('/').filter(Boolean);
      
      if (owner && repo) {
        return { owner, repo };
      }
    } catch (e) {
      console.error("Invalid URL:", e);
    }
    
    return null;
  }
  
  import { promises as fs } from 'fs';
import getRepoUrls from './onlydust';


// Function to load and process the repos.json file
async function loadAndProcessRepos(urls: string[]): Promise<Repo[]> {
  try {
    // Process each URL
    const repos: Repo[] = urls.map(url => {
      const parsed = parseGitHubUrl(url);
      if (parsed) {
        return parsed;
      } else {
        console.warn(`Invalid URL: ${url}`);
        return null;
      }
    }).filter((repo): repo is Repo => repo !== null); // Remove null values and assert type
    
    return repos;
  } catch (error) {
    console.error('Error reading or processing file:', error);
    return [];
  }
}

const urls = await getRepoUrls();

const repos = await loadAndProcessRepos(urls);

export const fetchAllIssues = async (): Promise<Map<string, Issue[]>> => {
    const allIssues = new Map<string, Issue[]>();
    for (const { owner, repo } of repos) {
        console.debug(`Fetching issues for ${owner}/${repo}`)
        const issues = await fetchIssuesForProject(owner, repo);
        if (issues.length == 0) {
            console.debug(`No issues found for ${owner}/${repo}`);
            continue;
        }
        allIssues.set(`${owner}/${repo}`, issues);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay of 1 second
    }
    return allIssues;
};

export const labelName = (label: Label): string|undefined => typeof label === 'string' ? label : label?.name;

export const findLatestIssueTS = (issues: Map<string, Issue[]>): number => {
    let latestTS = 0;
    for (const [, value] of issues.entries()) {
        for (const issue of value) {
            const ts = Date.parse(issue.updated_at);
            if (ts > latestTS) {
                latestTS = ts;
            }
        }
    }
    return latestTS;
}

export const findIssuesAfterTS = (issues: Map<string, Issue[]>, ts: number): Map<string, Issue[]> => {
    const newIssues = new Map<string, Issue[]>();
    for (const [key, value] of issues.entries()) {
        const newIssuesForProject = value.filter(issue => Date.parse(issue.updated_at) > ts);
        if (newIssuesForProject.length > 0) {
            newIssues.set(key, newIssuesForProject);
        }
    }
    return newIssues;
}