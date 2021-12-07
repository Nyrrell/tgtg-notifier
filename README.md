    ⚠️ Work In Progress
# Too Good To Go - Discord Notifier

Greatly inspired by [tgtg-python](https://github.com/ahivert/tgtg-python).

## Install

```zsh
git clone https://github.com/Nyrrell/tgtg-notifier.git
cd tgtg-notifer
npm install || yarn install
```

## Configure

To run this project, you will need to create a `config.json` file or use `example.config.json` to set your configuration. 

Be sure to fill `webhook`, `timezone`, `locale` and `Email` (or `User-ID`, `Access-Token` and `Refresh-Token` instead of `Email`)<br>

```json
{
  "users": [
    {
      "Email": "Too Good To Go Email",
      "User-ID": "Too Good To Go User ID", 
      "Access-Token": "Too Good To Go Access Token", 
      "Refresh-Token": "Too Good To Go Refresh Token" 
    }
  ],
  "timezone": "Europe/Paris",
  "locale": "fr-FR",
  "webhook": "https://discord.com/api/webhooks/123456789/ABCDEFG123456789"
}
```

## Run
```zsh
npm start || yarn start
```
If you don't set `User-ID`, `Access-Token` and `Refresh-Token` You should receive an email from Too Good To Go.<br>
You must validate the login by clicking the link inside this email within 1 minute.<br>

After that `tgtg-notifier` start to monitor your favorite stores (once per minute) and send you a notification by discord when a store's stock is add 