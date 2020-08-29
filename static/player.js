var sounds = {};
document.addEventListener("DOMContentLoaded", function(event) {
document.getElementById("in-game-name").innerHTML = encodeURIComponent(new URLSearchParams(window.location.search).get("username") || "Player");
document.getElementById("in-game-head").src = "https://mc-heads.net/head/" + encodeURIComponent(new URLSearchParams(window.location.search).get("username") || "MHF_Question");
})
      const socketProtocol =
        window.location.protocol === "https:" ? "wss:" : "ws:";
      const echoSocketUrl =
        socketProtocol +
        "//" +
        window.location.hostname +
        "/ws?username=" +
        encodeURIComponent(
          new URLSearchParams(window.location.search).get("username")
        );
      const socket = new WebSocket(echoSocketUrl);

      socket.onopen = () => {
        document.getElementById("track-title").innerHTML = "Ready.";
      };

      socket.onmessage = e => {
        var data = JSON.parse(event.data);
        console.log(data);
        if (data["action"] == "keepalive") {
          socket.send(JSON.stringify({ action: "keepalive" }));
        }
        if (data["action"] == "play") {
          playAudio(data["source"], data["track"], data["spatial"], data["xPos"], data["yPos"], data["zPos"], data["loop"]);
          document.getElementById("track-title").innerHTML = data["title"];
          document.getElementById("track-plot").innerHTML =
            "" + data["plot"];
        }
        if (data["action"] == "stop") {
          stopAudio(data["track"]);
          document.getElementById("track-plot").innerHTML =
            "" + data["plot"];
        }
        if(data["action"] == "pos") {
          setPos(data["xPos"],data["yPos"],data["zPos"]);
        }
      };

      socket.onerror = e => {
        stopAudio("all");
        document.getElementById("track-title").innerHTML = "Error.";
      };

      socket.onclose = e => {
        stopAudio("all");
        document.getElementById("track-title").innerHTML = "Error.";
      };

      function playAudio(url, track,spatial,x,y,z,looping) {
        if(window.sounds[track] == undefined) {
          window.sounds[track] = [];
        }
        if(spatial == "true") {
      var soundHowl = new Howl({
      src: [url],
      autoplay: true,
      loop: looping,
      pos: [x, y, z],
      orientation: [0, 0, 0],
      pannerAttr: {
      panningModel: 'HRTF',
      refDistance: 0.8,
      rolloffFactor: 2.5,
      }
      });
        } else {
       var soundHowl = new Howl({
      src: [url],
      autoplay: true,
      loop: looping,
      html5: true
       });
      }
    window.sounds[track].push(soundHowl);
      };
      function stopAudio(track) {
        if (track === "all") {
          for(const[key,value] of Object.entries(window.sounds)) {
          value.forEach(element => {
            element.stop();
            });
          };
        }
        if(window.sounds[track] != undefined) {
          window.sounds[track].forEach(element => {
            element.stop();
            });
        }
      }
      function setPos(x,y,z) {
        Howler.pos(x,y,z);
      }
      function setVolume(volume) {
        document.getElementById("volume-disp").innerHTML = "" + volume + "%";
        Howler.volume(volume/100);
      }
      /*
      window.howl = new Howl({
  src: "https://audio.tomoli.me/youtube/S7gkA3EyyNY.mp3",
  autoplay: true,
  loop: true,
  pos: [0, 0, 0],
  orientation: [0, 0, 0],
  pannerAttr: {
    panningModel: 'HRTF',
    refDistance: 0.8,
    rolloffFactor: 2.5,
  }
});
var roundDec = (num, dec) => {
    let pow = Math.pow(10, dec);
    return Math.round(num * pow) / pow;
};
var pan$ = Rx.Observable.fromEvent(
    document, "mousemove")
  .throttleTime(150)
  .map(function(e) {
    return {x: e.pageX, y: e.pageY};
  });

pan$.subscribe(function(e) {
  var hlookat = ((e.x / window.innerWidth) * 360) - 180;
  var vlookat = ((e.y / window.innerHeight) * 180) - 90;
  var theta = ((hlookat % 360) + 90) * (Math.PI / 180);
    var phi = ((vlookat % 180) - 90) * (Math.PI / 180);
    var r = 1;
  var pos = {
        x: roundDec(r * Math.sin(phi) * Math.cos(theta), 2) * 10,
        y: roundDec(r * Math.cos(phi), 2) * 10,
        z: roundDec(r * Math.sin(phi) * Math.sin(theta), 2) * 10
    };
  console.log("pos", pos);
  Howler.pos(pos.x, pos.y, pos.z);
});
*/