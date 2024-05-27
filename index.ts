import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { fetchAllIssues, type Label, type Issue, labelName, findIssuesAfterTS, findLatestIssueTS } from './issues';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) => ctx.reply('Welcome! I can fetch ODHack Github /issues for you.'));
bot.launch();

// State
let issues = new Map<string, Issue[]>();
let latestIssueTS = 0;

const mainLoop = async () => {
    // fetch issues
    console.log('Fetching all issues...');
    issues = await fetchAllIssues();

    // if latest ts is not 0, find new issues
    if (latestIssueTS !== 0) {
        const newIssues = findIssuesAfterTS(issues, latestIssueTS);
        if (newIssues.size > 0) {
            console.log('New issues found!');
            for (const [key, value] of newIssues.entries()) {
                console.log(`New issues for ${key}:`);
                for (const issue of value) {
                    console.log(`- ${issue.title}`);
                }
            }
        } else {
            console.log('No new issues found.');
        }
    }

    // update latest ts
    latestIssueTS = findLatestIssueTS(issues);

    setTimeout(mainLoop, 60000);
};

function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
  
bot.command('issues', async (ctx) => {
    for (const [key, value] of issues.entries()) {
        const project = escapeMarkdownV2(key);
        const issuesMsg = value.map(issue => {

            const labels = issue.labels.map(labelName)
            .filter((name): name is string => name?.length != 0 && name?.toLowerCase() != 'odhack')
            .map(escapeMarkdownV2);

            const formattedLabels = labels.length ? ` \\(${labels.join(', ')}\\)` : '';
            const issueTitle = escapeMarkdownV2(issue.title);
            const htmlUrl = escapeMarkdownV2(issue.html_url);
            const issueLink = `[${issueTitle}](${htmlUrl})${formattedLabels}`;
            return `• ${issueLink}`;
        }).join('\n')
        await ctx.replyWithMarkdownV2(`Issues for ${project}:\n${issuesMsg}`, {
            disable_web_page_preview: true,
        });
    }
})

mainLoop();