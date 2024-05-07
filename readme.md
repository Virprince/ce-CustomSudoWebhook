# ce-CustomSudoWebhook

This is a simple script that will take the output of the Sudo log webhook and send it to multiple Discord webhook based on a json configuration file.
It's base on the first version of a webhook script provided by Noms for RoleplayRedux module.

## NOTES: 
- This script is provided as is, you will **still need to have your very own webserver** to host it and make it work.
- I made this script for fun and to answer some needs for a Conan Exiles server i run with friends, you may have to modify it to fit your needs.
- English is english, so be aware that special characters like `é`,`è`,`â`,`ç`, etc are not returned correctly from sudo and are replaced by `?`. So text in with accent will be full of ?. eg: `Fl?che` instead of `Flêche`.

## Send chat message to Discord
First rename the file `/config/chatMessages.json.dist` to `/config/chatMessages.json`then you just modify it with your own webhook url.

```json
{
  "discord": {
    "webhook": "YOUR_WEBHOOK_URL"
  }
}
```

It will send the chat message to the discord webhook you provided with the following format:

```
TeleportPlayer [X] [Y] [Z]
[ActName or charName] [(charName) if actName] [radius (eg Say or Mumble)] in channel [channelID] : [message]
```
Message generated by RR Abilities will be sent like a normal chat message.

**Note** :
I don't need to log message, so this feature will most likely not be updated often.

## Send Sudo log to Discord
First rename the file `/config/logMessage.json.dist` to `/config/logMessage.json`

### Configure default webhook for all eventId
You can set default webhooks for all events. Just add your webhook url in the `eventId.default.discord`section.

```json
{
  "eventId": {
    "default": {
      // ... other stuff
      "discord": [
        {
          "webhook": "YOUR_WEBHOOK_URL",
          "message": "[[charName]] - [[eventCategory]] - [[eventId]] - [[eventType]] =>  [[params]]"
        }
      ]
    }
  }
}
```

### Configure specific webhook for specific eventId
To may want to have different webhooks for different eventId and keep your alert in different channel on your discord. 
You can add a specific section for each eventId you want. Main EventId I use are:
- `RR_ABILITY_USE` (for abilities that have "log usage" option enabled)
- `FlowChartLog` (for log from the sudo log node in Tot Admin script)

You can find the complete list for each log on your Sudo Dashboard => section Log => configure Log

### Default webhook for specific eventId
For each eventId, you can have a default webhook 

```json
{
  "eventId": {
    //... other stuff
    "RR_ABILITY_USE": {
      "default": {
        "discord": [
          {
            "webhook": "YOUR_WEBHOOK_URL",
            "message": "[[charName]] - [[eventCategory]] - [[eventId]] - [[eventType]] =>  [[params]]"
          }
        ]
      }
    }
  }
}
```
### Webhook for specific params of eventId
Let say you want to log each `RR_ABILITY_USE` but you also need to be warned if a player use a specific ability or a list of abilities.

You can do it by adding a new section in the `eventId.RR_ABILITY_USE`

The name doesn't matter, you can put whatever you want, but it must be unique for each webhook you want to add.

Then you can add a `find` section with the list of ability name you want to be alerted for. Keep in mind that the name must be **exactly the same** as the ability name in the game and watch for accent that will be replaced by `?`.



```json
{
  "eventId": {
    //... other stuff
    "RR_ABILITY_USE": {
      //... other stuff
      "my specific webhook": {
        "find": [
          "My ability name",
          "My other ability name"
        ],
        "discord": [
          {
            "webhook": "YOUR_WEBHOOK_URL",
            "message": "@here [[charName]] - [[eventCategory]] - [[eventId]] - [[eventType]] =>  [[params]]"
          }
        ]
      }
    }
  }
}
```
### Webhook for params of eventId that include a specific string
This case is more adapted for the `FlowChartLog` eventId, where you can add a key in your log message that will be used to trigger the webhook.
For example: 
- you made a conversation script where a player can select an option to say he want to see a NPC, you can make the message in sudo log node like this: `[NPC] NpcName is requested`.
- you made a script where you want to be alerted when a player enter a specific zone, you can make the message in sudo log node like this: `[Zone] ZoneName is entered`.

Then you configure the webhook like this:

```json
{
  "eventId": {
    //... other stuff
    "FlowChartLog": {
      //... other stuff
      "request npc": {
        "include": "[NPC]",
        "discord": [
          {
            "webhook": "YOUR_WEBHOOK_URL",
            "message": "@here [[charName]] => [[params]]"
          }
        ]
      },
      "watch_zone": {
        "include": "[Zone]",
        "discord": [
          {
            "webhook": "YOUR_WEBHOOK_URL",
            "message": "@here [[charName]] => [[params]]"
          }
        ]
      }
    }
  }
} 
```

### Message format
The discord (and logInFile) message format is a simple string where you can use some placeholders that will be replaced by the value of the log message.
Placeholders are enclosed in double square brackets `[[placeholder]]`.
- `[[charName]]` : the name of the character that trigger the log
- `[[actName]]` : the current displayed name of the character that trigger the log
- `[[eventCategory]]` : the category of the log
- `[[eventId]]` : the eventId of the log
- `[[eventType]]` : the type of the log
- `[[params]]` : the params of the log
- `[[date]]` : the date of the log
- `[[steamId]]` : the steamId of the character that trigger the log
- `[[fullCharName]]` : formated string with `actName (charName)` or `charName` if actName is equal

You can also use 
- discord mention like `@here` or `@everyone` in the message.
- discord markdown like `**bold**`, `*italic*`, `__underline__`, `~~strike~~`, `||spoiler||`, `>quote`, ````code```, `:emoji:`

### BONUS: logInFile option
Sometimes it can be hard to follow the flow of the log in discord, so you may want to log the message in a file.
You can do it by adding a `logInFile` section in the webhook configuration.

```json
{
  "eventId": {
    "default": {
      "logInFile": {
        "enabled": true,
        "fileName": "default_log",
        "message": "[[charName]] - [[eventCategory]] - [[eventId]] - [[eventType]] =>  [[params]]"
      },
      "discord": [
        {
          "webhook": "YOUR_WEBHOOK_URL",
          "message": "[[charName]] - [[eventCategory]] - [[eventId]] - [[eventType]] =>  [[params]]"
        }
      ]
    }
  }
}
```
It create a file in the `logs` folder of the app with the name you provided in `fileName` with the following format `fileName_YYYY_MM.log`.

Each month a new file will be created.

Every message will be appended to the file with the following format `[date provided by the event] [message] `.

```