var group = '';

var infections = {
   rad: 20,
   bio: 0,
   psy: 0,
   temp: 23
}

var health = 100;

var heal;
var rad_heal;
var bio_heal;
var psy_heal;
var temp_heal;

var infect;
var background_infect;

var rad_min = 20;
var temp_min = 23;
var psy_min = 0;

var health_flag = false;
var background_flag = false;
var flag = false;
var psy_death = false;
var infect_flag = false;
var psy_warn_flag = false;
var sos_flag = false;
var infect_interval = false;
var health_SOS_flag = false;
var rad_sound = false;
var canheal = true;

var socket;
var connected = false;

var modal;

var coords = {
   lat: 0.0,
   long: 0.0
}

var distance = 0.0;

let infectionPoints = [];

async function connectToServer() {
   socket = io("https://pda-0j64.onrender.com/", { transports: ["websocket"] });

   await socket.on("connect", async () => {
      axios.get('https://pda-0j64.onrender.com/getPoints')
         .then((res) => {
            console.log(res);
            infectionPoints = res.data;
         }).catch((e) => {
            console.error(new Error(e));
         });
      await document.getElementById("PDA_contact").play();
      document.getElementById("connection").innerText = "connected";
      document.getElementById("connection").classList.add("text-success");
      document.getElementById("connection").classList.remove("text-danger");
      document.getElementById("conn_img").src = "assets/img/connected.png";

      console.log("Conected");

      socket.on("get-task", async (data) => {
         const rand = await Math.floor(Math.random() * 3) + 1;
         switch (rand) {
            case 1: document.getElementById("PDA_3").play(); break;
            case 2: document.getElementById("PDA_2").play(); break;
            case 3: document.getElementById("PDA_1").play(); break;
         }
         let parsed_data = JSON.parse(data);
         console.log(parsed_data);
         document.getElementById("task").innerHTML = `<p>${parsed_data.task}</p>`;
      });

      socket.on("clear", () => {
         document.getElementById("task").innerHTML = ``;
      });
   });

   socket.on("disconnect", async () => {
      await document.getElementById("PDA_contact").play();

      document.getElementById("connection").innerText = "disconnected";
      document.getElementById("connection").classList.add("text-danger");
      document.getElementById("connection").classList.remove("text-success");
      setTimeout(() => {
         document.getElementById("conn_img").src = "assets/img/disconnect.jpg";
      }, 1000);
      console.log("Disconnected from server");
   });
}

$(document).ready(async () => {
   setTimeout(connectToServer, 2000);
   if (localStorage.getItem("username") === null) {
      window.location.href = '/login';
   } else {
      localStorage.setItem('user', JSON.stringify({ username: localStorage.getItem("username"), group: null }));
      document.getElementById("username").innerText = localStorage.getItem("username");
   }
   document.getElementById("logout").addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/login';
   });

   modal = new bootstrap.Modal(document.getElementById('info-modal'));

   checkInfectionStatus();

   // getPermission();

   document.getElementById("rad").innerText = rad_min;
   document.getElementById("health").innerText = health;

   if (navigator.geolocation) {
      const options = {
         maximumAge: 1,
         timeout: 100,
         enableHighAccuracy: true
      };
      navigator.geolocation.watchPosition(successCallback, errorCallback, options);
   }

   const dropdownItems = document.querySelectorAll('.dropdown-item');

   dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
         if (item.innerText !== 'No Group / Reset') {
            group = item.innerText;
            let btn = document.querySelector('.dropdown-toggle');
            btn.innerText = group;
            localStorage.setItem("user", JSON.stringify({ username: localStorage.getItem("username"), group: group }));
            socket.emit("join", group);
         } else {
            setTimeout(() => {
               location.reload();
            }, 1000);
         }
      });
   });
   setInterval(check_stats, 1000 / 60);
   // setInterval(check_time, 1 * 60 * 1000);
});

function successCallback(position) {
   coords.lat = position.coords.latitude;
   coords.long = position.coords.longitude;
}

function errorCallback(error) {
   console.error(`Error: ${new Error(error)}`);
}

function check_stats() {
   checkInfectionStatus();

   var healthElement = document.getElementById("health");
   var currentHealth = parseInt(healthElement.innerText);
   var radElement = document.getElementById("rad");
   var currentRad = parseInt(radElement.innerText);
   var bioElement = document.getElementById("bio");
   var currentBio = parseInt(bioElement.innerText);
   var psyElement = document.getElementById("psy");
   var currentPsy = parseInt(psyElement.innerText);
   var tempElement = document.getElementById("temp");
   var currentTemp = parseInt(tempElement.innerText);

   if (currentHealth < 41) {
      healthElement.classList.remove("text-success", "text-warning");
      healthElement.classList.add("text-danger");
      if (!health_SOS_flag) {
         document.getElementById("PDA_SOS").play();
         health_SOS_flag = true;
      }
   } else if (currentHealth < 66) {
      health_SOS_flag = false;
      healthElement.classList.remove("text-success", "text-danger");
      healthElement.classList.add("text-warning");
   } else {
      health_SOS_flag = false;
      healthElement.classList.remove("text-warning", "text-danger");
      healthElement.classList.add("text-success");
   }

   if (currentRad > 99) {
      radElement.classList.remove("text-success", "text-warning");
      radElement.classList.add("text-danger");
   } else if (currentRad > 50) {
      radElement.classList.remove("text-success", "text-danger");
      radElement.classList.add("text-warning");
   } else {
      radElement.classList.remove("text-warning", "text-danger");
      radElement.classList.add("text-success");
   }

   if (currentBio > 70) {
      bioElement.classList.remove("text-success", "text-warning");
      bioElement.classList.add("text-danger");
   } else if (currentBio > 20) {
      bioElement.classList.remove("text-success", "text-danger");
      bioElement.classList.add("text-warning");
   } else {
      bioElement.classList.remove("text-warning", "text-danger");
      bioElement.classList.add("text-success");
   }

   if (currentPsy > 80) {
      psyElement.classList.remove("text-success", "text-warning");
      psyElement.classList.add("text-danger");
   } else if (currentPsy > 25) {
      psyElement.classList.remove("text-success", "text-danger");
      psyElement.classList.add("text-warning");
   } else {
      psyElement.classList.remove("text-warning", "text-danger");
      psyElement.classList.add("text-success");
   }

   if (currentTemp > 100) {
      tempElement.classList.remove("text-success", "text-warning");
      tempElement.classList.add("text-danger");
   } else if (currentTemp > 50) {
      tempElement.classList.remove("text-success", "text-danger");
      tempElement.classList.add("text-warning");
   } else {
      tempElement.classList.remove("text-warning", "text-danger");
      tempElement.classList.add("text-success");
   }

   if (health < 0) health = 0;
   if (parseInt(health) === 0 && !psy_death) {
      canheal = false;
      document.getElementById("modal-title").innerText = `TOD!!!!`;
      document.getElementById("modal-body").innerText = `DU BIST TOD!! nim deine rote flagge und lauf zu base oder warte auf leute die dir helfen.`;
      modal.show();
      if (!sos_flag) {
         sos_flag = true;
         document.getElementById("PDA_SOS").play();
         setTimeout(() => {
            sos_flag = false;
         });
      }
   }

   document.getElementById("health").innerHTML = `${parseInt(health)}`;
   document.getElementById("psy").innerHTML = `${parseInt(infections.psy)}`;

   if (infections.psy >= 25 && infections.psy < 80) {
      document.getElementById("modal-title").innerText = `Psy infection ist über 25!`;
      document.getElementById("modal-body").innerText = `Dir gehts schlecht, du kannst nicht rennen!!!`;
      modal.show();
      if (!psy_warn_flag) {
         psy_flag = false;
         psy_warn_flag = true;
         document.getElementById("psy_warn").play();
      }
   } else if (infections.psy >= 80) {
      psy_death = false;
      document.getElementById("psy_warn").pause();
      psy_warn_flag = false;
      document.getElementById("modal-title").innerText = `DU BIST ZOMBIERT!!!!`;
      document.getElementById("modal-body").innerText = `DU GREIFST ALLE AN UND KANNST NICHT DENKEN!!!`;
      modal.show();
   } else if (infections.psy < 0) {
      document.getElementById("psy_warn").pause();
      psy_warn_flag = false;
      console.error("psy infection Error");
   }

   if (infections.rad < rad_min) infections.rad = rad_min;
   if (infections.bio < 0) infections.bio = 0;
   if (infections.psy < 0) infections.psy = 0;
}

function checkInfectionStatus() {
   if (!infect_flag) {
      health_flag = false;
      rad_sound = false;
      infect_flag = true;
   }
   if (infect_interval) infect_flag = false;
   infectionPoints.forEach(point => {
      distance = geolib.getDistance(
         { latitude: coords.lat, longitude: coords.long },
         { latitude: point.latitude, longitude: point.longitude }
      );

      if (parseFloat(distance) <= point.radius) {
         if (point.background) {
            if (!background_flag) {
               background_flag = true;
               rad_min = point.min;
               document.getElementById("rad").innerText = rad_min;
            }
         } else {
            if (!flag) {
               flag = true;
               rad_sound = false;
               health_flag = true;

               console.log(point);

               clearInterval(heal);
               clearInterval(rad_heal);
               clearInterval(bio_heal);
               clearInterval(temp_heal);

               infect = setInterval(() => {
                  infect_interval = true;
                  switch (point.name) {
                     case 'rad': infections.rad += point.strength;
                        document.getElementById("rad").innerText = parseInt(infections.rad);
                        health -= parseInt(infections.rad / 10);
                        if (!rad_sound) {
                           rad_sound = true;
                           document.getElementById("radiation").play();
                        }
                        break;
                     case 'bio': infections.bio += point.strength; document.getElementById("bio").innerText = parseInt(infections.bio); health -= parseInt(infections.bio / 10); break;
                     case 'psy': infections.psy += point.strength; document.getElementById("psy").innerText = parseInt(infections.psy); health -= parseInt(infections.psy / 10); break;
                     case 'temp': infections.temp += point.strength; document.getElementById("temp").innerText = parseInt(infections.temp); health -= parseInt(infections.temp / 10); break;
                     default: console.log(`Erorr: ${new Error("undefined infection")}`);
                  }
               }, 500);
            }
         }
      } else {
         if (!health_flag) checkHealth();
      }
   });
};

function checkHealth() {
   health_flag = true;
   flag = false;
   background_flag = false;

   clearInterval(infect);
   infect_interval = false;
   if (canheal) {
      heal = setInterval(() => {
         if (health !== 100 && canheal) health += 0.5;
         else clearInterval(heal);
      }, 1.5 * 1000);
   }

   rad_heal = setInterval(() => {
      if (infections.rad !== rad_min) {
         infections.rad -= 0.5;
         rad_sound = false;
      }
      else {
         document.getElementById("radiation").pause();
         clearInterval(rad_heal);
      }
      document.getElementById("rad").innerHTML = `${parseInt(infections.rad)}`;
   }, 1 * 1000);

   bio_heal = setInterval(() => {
      if (infections.bio !== 0) infections.bio -= 0.5;
      else clearInterval(bio_heal);
      document.getElementById("bio").innerHTML = `${parseInt(infections.bio)}`;
   }, 2.5 * 1000);

   let psy_flag = true;

   if (!psy_flag) {
      psy_flag = true;
      setTimeout(() => {
         psy_warn_flag = false;
         infections.psy = psy_min + 5;
         infections.rad !== 0 ? infections.rad /= 2 : infections.rad = 0;
         infections.bio !== 0 ? infections.bio /= 2 : infections.bio = 0;
         health = 65 - psy_min + 5;
         psy_flag = false;
      }, 7 * 60 * 1000);
   }

   temp_heal = setInterval(() => {
      if (infections.temp !== temp_min) infections.temp -= 0.5;
      else clearInterval(temp_heal);
      document.getElementById("temp").innerHTML = `${parseInt(infections.temp)}`;
   }, 250);
}

// function check_time() {
//    const currentTime = new Date();
//    const currentTimeString = `${currentTime.getHours()}:${currentTime.getMinutes()}`;

//    if (toString(wibros_times).includes(currentTimeString)) {
//       document.getElementById("wibros_start").play();
//       console.log("wibros start");
//       setTimeout(() => {
//          console.log("wibros");
//          document.getElementById("wibros").play();
//          setTimeout(() => {
//             console.log("wibros end");
//             document.getElementById("wibros").pause();
//             document.getElementById("wibros_end").play();
//          }, 2.15 * 60 * 1000);
//       }, 5 * 60 * 1000);
//    }
// }

// function getPermission() {
//    switch (Notification.permission.toLocaleLowerCase()) {
//       case 'granted': subscribe(); break;
//       case 'denied': console.log("shade"); break;
//       case 'default': Notification.requestPermission((status) => {
//          if (status === 'granted') subscribe();
//          if (status === 'default') setTimeout(() => getPermission(), 3000);
//       });
//       break;
//    }
// }

// function subscribe() {
//    var msg = firebase.messaging();
//    msg.requestPermission().then(() => {
//       msg.getToken().then((token) => {
//          console.log(token);
//       }).catch((e) => {
//          console.log(e);
//       });
//    }).catch((e) => {
//       console.log(e);
//    });
// }