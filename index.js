const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const expressWs = require("express-ws")(app);
const ytdl = require("youtube-dl-exec");
const path = require("path");
const compression = require('compression');
const ffmpeg = require("ffmpeg");
const webhook = require("webhook-discord");
const googleTTS = require('google-tts-api');
const { http, https } = require('follow-redirects');
var secrets = require('./secret');
var os = require('node-os-utils');
const request = require('request');

const connectionHook = new webhook.Webhook(secrets.requestSecret("connectionHook"));
const playbackHook = new webhook.Webhook(secrets.requestSecret("playbackHook"));
const positionHook = new webhook.Webhook(secrets.requestSecret('positionHook'));
const errorHook = new webhook.Webhook(secrets.requestSecret('errorHook'));
var wss = expressWs.getWss("/");
app.use(bodyParser.text());
app.use(compression());

let demoLogger = (req, res, next) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  let log = `[${formatted_date}] ${method}:${url} ${status}`;
  console.log(log);
  next();
};

app.use(demoLogger);

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var auth = secrets.requestSecret('auth');

function forceHTTPS(req, res, next) {
  if(req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect("https://"+req.get("host")+req.url);
  }
  next();
}

wss.on("connection",(cb,request) => {
  if(cb.uuid == "null") { return; }
  connectionHook.info("Connect",""+cb.uuid+" has connected.");
  cb.on("close",(listener) => {
    connectionHook.info("Disconnect",""+cb.uuid+" has disconnected.")
  });
  cb.on("error",(listener) => {
    connectionHook.warn("Error",""+cb.uuid+" has errored: "+listener.err);
  });
})

app.use(forceHTTPS);

app.use("/static",express.static(path.join(__dirname,"static")));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/secrets.json", (req,res) => {
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
})

app.get("/keys.json", (req,res) => {
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
})

app.get("/tts/:text.mp3", (req,res) => {
  googleTTS(req.params.text, 'en', 1) // speed normal = 1 (default), slow = 0.24
  .then((url) => {
    https.get(url, (resp) => {
      res.writeHead(resp.statusCode);
    resp.on("data", (chunk) => {
      res.write(chunk)
    })
    resp.on('close', () => {
        res.end();
      });

      resp.on('end', () => {
        res.end();
      });
  })
  })
  .catch((err) => {
    console.error(err.stack);
  });
})

app.get("/glados/:text.mp3", (req,res) => {
  // https://glados.c-net.org/generate?text=
  var url = "https://glados.c-net.org/generate?text="+encodeURIComponent(req.params.text);
  https.get(url, (resp) => {
      res.writeHead(resp.statusCode);
    resp.on("data", (chunk) => {
      res.write(chunk)
    })
    resp.on('close', () => {
        res.end();
      });

      resp.on('end', () => {
        res.end();
      });
  })
})

app.ws("/ws", function(ws, req, res) {
  ws.uuid = getParameterByName("username",req.url);
  ws.on("message", (info) => {
    var data = JSON.parse(info);
    if(data.action === "getStats") {
      os.cpu.usage()
  .then(cpuUsage => {
    os.mem.info()
  .then(memUsage => {
    ws.send(JSON.stringify({
        users: wss.clients.size,
        cpuPerc: cpuUsage,
        memPerc: 100-memUsage.freeMemPercentage,
      }))
  })
  })
    }
  })
});

app.get("/yt/:id/audio.mp3", async (req, res) => { 
const uri = "https://www.youtube.com/watch?v="+req.params.id; 
ytdl(uri, {
  dumpJson: true,
  noWarnings: true,
  noCallHome: true,
  noCheckCertificate: true,
  preferFreeFormats: true,
  youtubeSkipDashManifest: true,
  format: "bestaudio",
})
  .then(output => {
    request(output.formats[0].url).pipe(res);
  });
});

app.get("/youtube/:id/audio.mp3", async (req, res) => { 
res.redirect("/yt/"+req.params.id+"/audio.mp3")
});

app.post("/play/:plot/:key/:username/:title/:track/:loop", function(req, res) {
  var body = req.body;
  req.body = req.body.replace(/http(.*):\/\/(.*)youtube\.com\/watch\?v=(.*)/g,"youtube/$3/audio.mp3");
  req.body = req.body.replace(/&(.*)/g, "");
  if(req.body != body) {
    req.body = req.body + ".mp3";
  }
  if (req.params.plot in auth) {
    if (auth[req.params.plot].key == req.params.key) {
      var toLoop = false;
      if(req.params.loop == "true") {
        toLoop = true;
      }
      //console.log(req.body);
      wss.clients.forEach(function each(client) {
        if (client.uuid == req.params.username) {
          client.send(
            JSON.stringify({
              action: "play",
              source: req.body,
              title: req.params.title,
              plot: req.params.plot,
              track: req.params.track,
              loop: toLoop
            })
          );
        }
        if (req.params.username == "broadcast") {
          if (req.params.plot === 0) {
            client.send(
              JSON.stringify({
                action: "play",
                source: req.body,
                title: req.params.title,
                plot: req.params.plot,
                track: req.params.track,
                loop: toLoop
              })
            );
            playbackHook.info("Plot "+req.params.plot+" - User "+req.params.username,"Tried to broadcast "+req.body+" globally - Success.");
          } else {
            playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to broadcast "+req.body+" globally- Unauthorized.");
            res.sendStatus(403);
            return;
          }
        }
      });
      playbackHook.info("Plot "+req.params.plot+" - User "+req.params.username,"Tried to play "+req.body+" -  Success.");
      res.sendStatus(200);
      return;
    } else {
      playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to play "+req.body+" - Key invalid.");
      res.sendStatus(403);
      return;
    }
  } else {
    playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to play "+req.body+" - Plot invalid.");
    res.sendStatus(403);
    return;
  }
});

app.post("/stop/:plot/:key/:username/:track", function(req, res) {
  if (req.params.plot in auth) {
    if (auth[req.params.plot].key == req.params.key) {
      wss.clients.forEach(function each(client) {
        if (client.uuid == req.params.username) {
          client.send(
            JSON.stringify({
              action: "stop",
              plot: req.params.plot,
              track: req.params.track
            })
          );
        }
        if (req.params.username == "broadcast") {
          if (req.params.plot === 0) {
            client.send(
              JSON.stringify({
                action: "stop",
                plot: req.params.plot,
                track: req.params.track
              })
            );
            playbackHook.info("Plot "+req.params.plot+" - User "+req.params.username,"Tried to broadcast stop globally - Success.");
          } else {
            playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to broadcast globally- Unauthorized.");
            res.sendStatus(403);
          }
        }
      });
    
      res.sendStatus(200);
      return;
    } else {
      playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to stop audio - Key invalid.");
      res.sendStatus(403);
      return;
    }
  } else {
    playbackHook.warn("Plot "+req.params.plot+" - User "+req.params.username,"Tried to stop audio - Plot invalid.");
    res.sendStatus(403);
    return;
  }
});

const listener = app.listen(3000, () => {
  console.log("Listening on " + listener.address().port);
});

setInterval(function() {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify({ action:"keepalive" }));
  });
}, 5000);

process.on('uncaughtExceptionMonitor',(err,origin) => {
  errorHook.err("Unhandled Exception",""+err+"\n\n"+origin);
});

process.on('unhandledRejection',(err,promise) => {
  errorHook.err("Unhandled Promise Rejection",""+err);
});
