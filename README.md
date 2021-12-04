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

To run this project, you will need to add the following environment variables.

Create a `.env` file or use .`env.example` to set your configuration. 

Be sure to fill `WEBHOOK`, `TIMEZONE`, `LOCALE` and `EMAIL`

```.dotenv
WEBHOOK=xxx        # Discord webhook URL, example : https://discord.com/api/webhooks/123456789/ABCDEFG123456789
TIMEZONE=xxx       # Europe/Paris
LOCALE=xxx         # fr-FR
EMAIL=xxx          # Too Good To Go Email
```

ℹ️ `USER_ID`, `ACCESS_TOKEN` and `REFRESH_TOKEN` are optional.
```.dotenv
USER_ID=           # Too Good To Go UserID || Leave blank 
ACCESS_TOKEN=      # Too Good To Go AccessToken || Leave blank 
REFRESH_TOKEN=     # Too Good To Go RefreshToken || Leave blank 
```

## Run
```zsh
npm start || yarn start
```
If you don't set `USER_ID`, `ACCESS_TOKEN` and `REFRESH_TOKEN` You should receive an email from Too Good To Go.<br>
You must validate the login by clicking the link inside this email within 1 minute.<br>

After that `tgtg-notifier` start to monitor your favorite stores (once per minute) and send you a notification by discord when a store's stock is add 