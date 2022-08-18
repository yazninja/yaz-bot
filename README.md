<h1 align="center">Free Games Discord Bot</h1>
<p align="center">
  <img src="https://img.shields.io/github/package-json/v/yazninja/discord-fg-bot?style=for-the-badge">
  <img src="https://dcbadge.vercel.app/api/shield/985786630923239465?bot=true&theme=clean-inverted">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png" 
  alt="icon" width="200px" height="200px"/>
</p>

> A Simple ECMA js bot that fetches free games using Reddit api to check /r/GameDeals, and Epic games api.

### ➕ [Add Bot to your Discord Server](https://discord.com/api/oauth2/authorize?client_id=985786630923239465&permissions=534723950656&scope=bot)

## Bot Commands

📍 Get information about the bot and commands in the discord channel.  
```sh
fg help
```
📍 Sign up for free game alerts to the channel where command is sent. 
```sh 
fg add
```

📍 Remove free game alerts to the channel where command is sent. 
```sh
fg remove
```

📍 Check if current channel is receiving game alerts. 
```sh
fg active
```

📍 Send free game promotions from Reddit.
```sh
fg reddit
```

📍 Send free game promotions from Epic Games.
```sh
fg epic
```

## Install

> A developer discord bot key will be needed to run locally.

```sh
yarn install
```

## Usage

```sh
yarn dev
```
