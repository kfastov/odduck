import { promises as fs } from 'fs';
import axios from 'axios';

interface Config {
  hack_url: string;
  project_url_prefix: string;
}

interface Project {
  id: string;
  slug: string;
}

interface HackData {
  projects: Project[];
}

interface ProjectData {
  organizations: {
    repos: {
      htmlUrl: string;
      isIncludedInProject: boolean;
    }[];
  }[];
}

async function getRepoUrls(): Promise<string[]> {
  try {
    // Read config.json
    const configData = await fs.readFile('config.json', 'utf-8');
    const config: Config = JSON.parse(configData);

    // Fetch hack data
    const hackResponse = await axios.get<HackData>(config.hack_url);
    const hackData = hackResponse.data;

    // Fetch project details and collect repo URLs
    const repoUrls: string[] = [];
    for (const project of hackData.projects) {
      const projectUrl = `${config.project_url_prefix}${project.slug}`;
      const projectResponse = await axios.get<ProjectData>(projectUrl);
      const projectData = projectResponse.data;

      projectData.organizations.forEach(org => {
        org.repos.forEach(repo => {
          if (repo.isIncludedInProject) {
            repoUrls.push(repo.htmlUrl);
          }
        });
      });
    }

    return repoUrls;
  } catch (error) {
    console.error('Error fetching repo URLs:', error);
    return [];
  }
}

export default getRepoUrls;