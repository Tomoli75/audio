## Audio Sources
If you don't want to host your own audio, you can always use the methods we provide.
/play/[plot](#plot)/[key](#key)/[username](#username)/[title](#title)/[track](#track)/[loop](#loop)
### TTS
We provide free access to the basic (Google Translate style) TTS service from Google. The URL format is as follows:
/tts/[text].mp3
Replace [text] with the URL-encoded text you want to use.
### GLaDOS
We also provide access to GLaDOS TTS, recommended for use in puzzle-style games. The URL format is as follows:
/glados/[text].mp3
Replace [text] with the URL-encoded text you want to use.
### YouTube
Furthermore, we provide the ability to play YouTube videos (audio only) via the service. The URL format is as follows:
/yt/[id].mp3
Replace [text] with the YouTube video id you want to play. For example, `dQw4w9WgXcQ` plays a rick-roll.
You can also use /youtube/ rather than /yt/. This is to provide compatability for slightly older integrations.
