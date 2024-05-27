# ODDuck

![ODDuck Logo](./logo.webp)

ODDuck is a Telegram bot designed for the [OnlyDust](https://www.onlydust.com/) [ODHack](https://blog.onlydust.com/odhack-4-0-lets-go/) hackathon. It fetches and provides updates (not ready yet) on GitHub issues specifically tagged for the hackathon.

## Features

- Fetches all issues tagged with "odhack" or containing "odhack" in the title from participating repositories.
- Updates every minute to check for new issues.
- Provides an `/issues` command to list the current open issues.

## Setup

### Prerequisites

- [Bun](https://bun.sh/)
- A Telegram bot token
- A GitHub token

### Environment Variables

Create a `.env` file in the root of your project and add the following variables:

```
BOT_TOKEN=your_telegram_bot_token
GITHUB_TOKEN=your_github_token
```

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ODDuck.git
    cd ODDuck
    ```

2. Install dependencies:
    ```sh
    bun install
    ```

3. Start the bot:
    ```sh
    bun index.ts
    ```

## Usage

Once the bot is running, you can interact with it on Telegram. Start the bot by sending the `/start` command. To fetch the latest issues, use the `/issues` command.

## Project Structure

- `index.ts`: Main bot logic.
- `issues.ts`: Functions to fetch and process GitHub issues.
- `repos.json`: List of repositories participating in the ODHack 4.0.

## How It Works

The bot uses the Telegraf library to interact with the Telegram API. It periodically fetches issues from GitHub repositories specified in `repos.json` and updates the list of issues every minute.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.

---

Made with ❤️ for the ODHack community
