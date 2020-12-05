## Playing Audio
Playing audio with Project: Audio is easy. The URL format is as follows:
/play/[plot](#plot)/[key](#key)/[username](#username)/[title](#title)/[track](#track)/[loop](#loop)/[spatial](#spatial)/[x?](#x)/[y?](#y)/[z?](#z)
The **Direct Audio URL** should be placed in the body.

## Plot

This must be the Plot ID assigned to your key. If it isn't, the request will be denied.

## Key

This must be your key. This is case-sensitive. It must have the permissions requested in the URL, else the request will be denied.

## Username

This is the player's username you want to play the music to. The player must be on your plot.

## Title

This is the title that will show up in the web interface. Preferably, this will be the song title or the announcement title - e.g. if you wish to rick-roll people listening, you would put "Never Gonna Give You Up - Rick Astley" as the title.

## Track

This is not shown to the user, and acts as the audio's group. This can be anything, yet the words "music", "sfx" and "speech" are preferred.

## Loop

This should be either true or false. If true, the audio will loop.

## Spatial

This should be false if your key does not have access to spatial audio. If it does, this can be true or false.

### X

Required if Spatial is true. This is where the audio should play from, world coordinates are recommended for usage yet any coordinate can be used.

### Y

Required if Spatial is true. This is where the audio should play from, world coordinates are recommended for usage yet any coordinate can be used.

### Z

Required if Spatial is true. This is where the audio should play from, world coordinates are recommended for usage yet any coordinate can be used.
