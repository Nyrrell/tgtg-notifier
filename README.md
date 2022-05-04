> ⚠️ Work In Progress

# Too Good To Go - Notifier

Greatly inspired by [tgtg-python](https://github.com/ahivert/tgtg-python).

### New feature :
Too Good To Go - Notifier now support `Discord` and `WhatsApp`.

> ⚠️ WhatsApp notification uses Puppeteer to run a real instance of Whatsapp Web to avoid getting blocked. 
> WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Install

```zsh
git clone https://github.com/Nyrrell/tgtg-notifier.git
cd tgtg-notifier
npm install
```

## Configure

To run this project, you will need to create a `config.json` file, see below or use `example.config.json` to set your
configuration.

Be sure to fill your service `Notifier`, `Name`, `Timezone`, `Locale`, `Email` (or `User-ID`, `Access-Token` and `Refresh-Token` instead
of `Email`).<br>

⚠️ Too Good To Go use Datadome bot protection and maybe you must provide a `Cookie`, if a cookie is needed, a link 
appear in the console, follow it, complete captcha and get your cookie using DevTools.

```json
{
  "Users": [
    {
      "Name": "User 1",
      "Email": "Too Good To Go Email User 1",
      "User-ID": "Too Good To Go User ID [OPTIONAL]",
      "Access-Token": "Too Good To Go Access Token [OPTIONAL]",
      "Refresh-Token": "Too Good To Go Refresh Token [OPTIONAL]",
      "Favorite": true,
      "Notifier": {
        "Discord": "https://discord.com/api/webhooks/{webhook.id}/{webhook.token}"
      }
    }
  ],
  "Cookie": "datadome={...} [MAYBE OPTIONAL CHECK CONSOLE IF NEEDED]",
  "Timezone": "Europe/Paris",
  "Locale": "fr-FR",
  "Available": "Disponible [OPTIONAL]",
  "Price": "Prix [OPTIONAL]"
}
```

- WhatsApp notifier configuration :

```json 
"Notifier": {
  "WhatsApp": {
    "Filename": "Name use for store whatsapp session",
    "IdResolvable": "Resolvable phone-number with prefix OR chat name"
  }
}
```

- To improve i18n, you can set `Available` & `Price` for translate in your language, it's totally optional.

## Run

```zsh
npm start
```

If you don't set `User-ID`, `Access-Token` and `Refresh-Token` You should receive an email from Too Good To Go.<br>
You must validate the login by clicking the link inside this email within 2 minute (Do not use your phone if Too Good To Go app is installed).<br>

After that `tgtg-notifier` start to monitor your favorite stores (once per minute) and send you a notification when a store's stock is add.
