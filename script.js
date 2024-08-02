var tick_rate = 60;

var group = '';

let date = new Date();

var infections = {
   rad: 20,
   bio: 0,
   psy: 0,
   temp: 23
}

var PDA_data = {}

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
var vibrate = true;

var socket;
var was_conn = false;

var modal;

var coords = {
   lat: 0.0,
   long: 0.0
}

var distance = 0.0;

const infectionPoints = [
   { name: "bio", latitude: 47.998689, longitude: 8.820344, radius: 5, strength: 5 },
   { name: "rad", latitude: 47.999052, longitude: 8.820551, radius: 6, strength: 9 },
   { name: "rad", latitude: 47.999027, longitude: 8.819620, radius: 8, strength: 16 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 15, strength: 24 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 20, min: 60, background: true },       //? zone 2
   { name: "rad", latitude: 47.999714, longitude: 8.820312, radius: 13, strength: 16 },
   { name: "psy", latitude: 47.999816, longitude: 8.820140, radius: 7, strength: 4 },
   { name: "bio", latitude: 47.999498, longitude: 8.820577, radius: 6, strength: 7 },
   { name: "rad", latitude: 47.998933, longitude: 8.818682, radius: 8, strength: 14 },
   { name: "bio", latitude: 47.997965, longitude: 8.821235, radius: 6, strength: 3 },
   { name: "rad", latitude: 47.997638, longitude: 8.820741, radius: 9, strength: 7 },
   { name: "rad", latitude: 47.997369, longitude: 8.820891, radius: 9, strength: 8 },
   { name: "rad", latitude: 47.997308, longitude: 8.820505, radius: 17, strength: 6 },
   { name: "rad", latitude: 47.997714, longitude: 8.820011, radius: 5, strength: 4 },
   { name: "bio", latitude: 47.997255, longitude: 8.819794, radius: 7, strength: 6 },
   { name: "rad", latitude: 47.999153, longitude: 8.821538, radius: 44, min: 34, background: true },       //! locations
   { name: "rad", latitude: 47.996979, longitude: 8.820725, radius: 24, min: 55, background: true },       //! locations
   { name: "rad", latitude: 47.999098, longitude: 8.820082, radius: 6, strength: 12 },
   { name: "bio", latitude: 47.997736, longitude: 8.820387, radius: 10, strength: 2 },
   { name: "rad", latitude: 47.997178, longitude: 8.819941, radius: 8, strength: 8 },
   { name: "rad", latitude: 47.998832, longitude: 8.818748, radius: 7, strength: 3 },
   { name: "rad", latitude: 47.998379, longitude: 8.819073, radius: 5, strength: 3 },
   { name: "rad", latitude: 47.997866, longitude: 8.819510, radius: 5, strength: 3 },
   { name: "rad", latitude: 47.997348, longitude: 8.819925, radius: 5, strength: 3 },
   { name: "rad", latitude: 47.998391, longitude: 8.820137, radius: 6, strength: 6 },
   { name: "rad", latitude: 47.998526, longitude: 8.820149, radius: 1, strength: 2 },
   { name: "rad", latitude: 47.998442, longitude: 8.821268, radius: 16, strength: 6 },
   { name: "bio", latitude: 47.998683, longitude: 8.817779, radius: 6, strength: 6 },
   { name: "rad", latitude: 47.998323, longitude: 8.819821, radius: 4, strength: 3 },
   { name: "bio", latitude: 47.998538, longitude: 8.820297, radius: 6, strength: 4 },
   { name: "rad", latitude: 47.999169, longitude: 8.819542, radius: 11, strength: 6 },
   { name: "rad", latitude: 47.999709, longitude: 8.819448, radius: 6, strength: 5 },
   { name: "rad", latitude: 47.999534, longitude: 8.819439, radius: 7, strength: 5 },
   { name: "rad", latitude: 47.999174, longitude: 8.818953, radius: 6, strength: 2 },
   { name: "bio", latitude: 47.998126, longitude: 8.821418, radius: 2, strength: 2 },
   { name: "rad", latitude: 47.998162, longitude: 8.820865, radius: 2, strength: 2 },
   { name: "rad", latitude: 47.998664, longitude: 8.818218, radius: 3, strength: 3 },
   { name: "rad", latitude: 47.998927, longitude: 8.819972, radius: 5, strength: 4 }
];

async function connectToServer() {
   socket = io("https://pda-0j64.onrender.com/", { transports: ["websocket"] });

   setTimeout(() => {
      if (!was_conn) {
         document.getElementById("connect").innerHTML = `<div class="d-flex mb-0 pb-0">
                                                            <svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="17" r="1" fill="#000000"/>
                                                            <path d="M12 10L12 14" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                            </svg><p class="ms-2 mb-0">Failed! / retry</p></div>`;
         document.getElementById("connect").classList.remove("btn-outline-success");
         document.getElementById("connect").classList.add("btn-danger");
         document.getElementById("connect").disabled = false;
         if (vibrate) navigator.vibrate(1000);
         socket.disconnect();
      }
   }, 5000);

   await socket.on("connect", async () => {
      was_conn = true;

      await document.getElementById("PDA_contact").play();
      document.getElementById("connection").innerText = "connected";
      document.getElementById("connection").classList.add("text-success");
      document.getElementById("connection").classList.remove("text-danger");
      document.getElementById("conn_img").src = "assets/img/connected.png";

      document.getElementById("connect").innerText = 'connected';
      document.getElementById("connect").classList.remove("btn-outline-success");
      document.getElementById("connect").classList.add("btn-success");

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
         if (vibrate) navigator.vibrate(120);
         document.getElementById("task").innerHTML = `<p>${parsed_data.task}</p>`;
      });

      socket.on("clear", () => {
         document.getElementById("task").innerHTML = ``;
      });
   });

   document.getElementById("change").disabled = false;

   socket.on("disconnect", async () => {
      await document.getElementById("PDA_contact").play();

      document.getElementById("connection").innerText = "disconnected";
      document.getElementById("connection").classList.add("text-danger");
      document.getElementById("connection").classList.remove("text-success");

      document.getElementById("change").disabled = true;

      document.getElementById("conn_img").src = "assets/img/disconnect.jpg";
      console.log("Disconnected from server");
   });
}

window.addEventListener('load', (event) => {
   startCamera();

   navigator.wakeLock.request('screen')
      .then((wakeLockObj) => {
         console.log('Экран заблокирован и будет включен всегда');
      })
      .catch((error) => {
         console.error('Ошибка при запросе блокировки экрана:', error);
      });
   if (localStorage.getItem("username") === null) {
      window.location.href = '/login';
   } else {
      document.getElementById("fullscreen").addEventListener('click', () => {
         toggleFullScreen(document.getElementById("fullscreen"));
      });

      document.getElementById("balance").innerText = parseInt(JSON.parse(localStorage.getItem("user")).bal);

      document.querySelectorAll("#username").forEach(username => {
         username.innerText = localStorage.getItem("username");
      });

      document.getElementById("logout").addEventListener('click', () => {
         localStorage.clear();
         window.location.href = '/login';
      });

      document.getElementById("connect").addEventListener('click', () => {
         document.getElementById("connect").classList.add("btn-outline-success");
         document.getElementById("connect").classList.remove("btn-danger");
         document.getElementById("connect").innerHTML = `<span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                                                      <span role="status">connecting...</span>`;
         document.getElementById("connect").disabled = true;
         connectToServer();
         console.log("connecting..");
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

      const dropdownItems = document.querySelectorAll('.teams');

      Array.from(dropdownItems).forEach((item) => {
         item.addEventListener('click', () => {
            if (item.innerText !== 'Reset / disconnect') {
               let group = item.innerText;
               let btn = document.querySelector('.team_btn');
               btn.innerText = group;
               let arrmour = JSON.parse(localStorage.getItem('user')).arrmour;
               let balance = JSON.parse(localStorage.getItem('user')).bal;
               localStorage.setItem("user", JSON.stringify({ username: localStorage.getItem("username"), group: group, bal: balance, arrmour }));
               socket.emit("join", group);
               // console.log(item);
            } else {
               setTimeout(() => {
                  location.reload();
               }, 1000);
            }
         });
      });
      setInterval(check_stats, 1000 / tick_rate);
      // setInterval(check_time, 1 * 60 * 1000);
   }
});

function successCallback(position) {
   coords.lat = position.coords.latitude;
   coords.long = position.coords.longitude;
}

function errorCallback(error) {
   console.error(`Error: ${new Error(error)}`);
}

function toggleFullScreen(element) {
   if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      element.innerText = 'Fullscreen ON';
      element.classList.remove("btn-outline-danger");
      element.classList.add("btn-outline-success");
   } else if (document.exitFullscreen) {
      document.exitFullscreen();
      element.innerText = 'Fullscreen OFF';
      element.classList.remove("btn-outline-success");
      element.classList.add("btn-outline-danger");
   }
}

function check_stats() {
   checkInfectionStatus();
   document.getElementById("clock").innerText = `${date.getHours()}:${date.getMinutes()}`;

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
      vibrate = false;
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
   // console.log(`infect_flag ${infect_flag} | health_flag ${health_flag} | rad sound ${rad_sound} | infect interval ${infect_interval}`)
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

               clearInterval(heal);
               clearInterval(rad_heal);
               clearInterval(bio_heal);
               clearInterval(temp_heal);

               // - arrmour

               infect = setInterval(() => {
                  if (vibrate) navigator.vibrate(200);
                  infect_interval = true;
                  switch (point.name) {
                     case 'rad': infections.rad += point.strength;
                        document.getElementById("rad").innerText = parseInt(infections.rad);
                        health -= parseInt(infections.rad / 10);
                        if (!rad_sound) {
                           rad_sound = true;
                           document.getElementById("radiation").play();

                           let rot_flag = true;
                           let rot;

                           rotate = setInterval(() => {
                              rot = rot_flag === true ? 0 : 180;
                              document.getElementById("noise").style = `transform: rotate(${rot}deg); display: block !important;`
                              rot_flag = !rot_flag;
                           }, 65);
                        }
                        break;
                     case 'bio':
                        infections.bio += point.strength;
                        document.getElementById("bio").innerText = parseInt(infections.bio);
                        health -= parseInt(infections.bio / 10);
                        break;
                     case 'psy': infections.psy += point.strength;
                        document.getElementById("psy").innerText = parseInt(infections.psy);
                        health -= parseInt(infections.psy / 10);
                        break;
                     case 'temp':
                        infections.temp += point.strength;
                        document.getElementById("temp").innerText = parseInt(infections.temp);
                        health -= parseInt(infections.temp / 10);
                        break;
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
   rad_sound = false;
   console.log(rad_sound, health_flag, flag);

   var healing_health = false;

   var healing_rad = false;
   var healing_bio = false
   var healing_temp = false;

   clearInterval(infect);
   infect_interval = false;
   if (canheal && !healing_health) {
      healing_health = true;
      heal = setInterval(() => {
         if (health !== 100 && canheal) health += 0.5;
         else clearInterval(heal); healing_health = false;
      }, 1.5 * 1000);
   }

   if (infections.rad !== rad_min && !healing_rad) {
      healing_rad = true;
      rad_heal = setInterval(() => {
         infections.rad -= 5;
         document.getElementById("rad").innerHTML = `${parseInt(infections.rad)}`;
         document.getElementById("radiation").pause();
         document.getElementById("noise").style = `display: none !important;`;
      }, 1 * 1000);
   } else {
      if (infections.rad === rad_min) {
         document.getElementById("noise").style = `display: none !important;`;
         document.getElementById("radiation").pause();
         clearInterval(rad_heal);
         healing_rad = false;
      }
   }

   if (!healing_bio) {
      healing_bio = true;
      bio_heal = setInterval(() => {
         if (infections.bio !== 0) infections.bio -= 0.5;
         else clearInterval(bio_heal); healing_bio = false;
         document.getElementById("bio").innerHTML = `${parseInt(infections.bio)}`;
      }, 2.5 * 1000);
   }

   let psy_flag = false;

   if (!psy_flag) {
      psy_flag = true;
      setTimeout(() => {
         psy_warn_flag = false;
         infections.psy = psy_min + 5;
         infections.rad !== rad_min ? infections.rad /= 2 : infections.rad = rad_min;
         infections.bio !== 0 ? infections.bio /= 2 : infections.bio = 0;
         health = 65 - psy_min + 5;
         psy_flag = false;
      }, 7 * 60 * 1000);
   }

   if (!healing_temp) {
      healing_temp = true;
      temp_heal = setInterval(() => {
         if (infections.temp !== temp_min) infections.temp -= 0.5;
         else clearInterval(temp_heal); healing_temp = false;
         document.getElementById("temp").innerHTML = `${parseInt(infections.temp)}`;
      }, 250);
   }
}

const Island = document.getElementById("PUZ-island");
var Island_event;

Island.addEventListener("click", () => {
   if (!Island.classList.contains("PUZ-island_active")) {
      Island.classList.add("PUZ-island_active");

   }
});

document.body.addEventListener("click", () => {
   if (Island.classList.contains("PUZ-island_active")) {
      Island.addEventListener("click", (e) => {
         Island_event = e;
      });
      if (typeof (Island_event) != 'object') {
         Island.classList.remove("PUZ-island_active");
         Island_event = 0;
      } else {
         Island_event = 0;
      }
   }
});

var sum = 0;

document.getElementById("sum-input").addEventListener("change", () => {
   const input_sum = parseInt(document.getElementById("sum-input").value);

   let balance = parseInt(JSON.parse(localStorage.getItem("user")).bal);
   document.getElementById("balance").innerText = balance;

   let parsed_sum = parseInt(input_sum);

   if (!isNaN(parsed_sum) && parsed_sum !== '' && parsed_sum < balance) {
      sum = parsed_sum;
   } else if (parsed_sum === '' || isNaN(parsed_sum)) {
      document.getElementById("sum-input").value = '';
      sum = 0;
   } else {
      document.getElementById("sum-input").value = balance;
      sum = balance;
   }
   document.getElementById("balance").innerText = balance - sum;
});

async function startCamera() {
   const video = document.getElementById('video');
   const canvas = document.getElementById('canvas');
   const context = canvas.getContext('2d');

   const camera = document.getElementById("camera");

   try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      video.addEventListener('play', () => {
         const scanQRCode = async () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
               canvas.height = video.videoHeight;
               canvas.width = video.videoWidth;
               context.drawImage(video, 0, 0, canvas.width, canvas.height);

               const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
               if (camera.classList.contains("active") && Island.classList.contains("PUZ-island_active") && sum !== 0) {
                  var code = jsQR(imageData.data, imageData.width, imageData.height);
                  console.log("scan");
               } else if (camera.classList.contains("active") && !Island.classList.contains("PUZ-island_active")) {
                  document.querySelector(".slide_button").click();

                  Island.classList.remove("PUZ-island_active");
               }

               if (code) {
                  console.log(`QR-код: ${code.data}`);

                  PDA_data = { username: localStorage.getItem("username"), sum: sum };

                  
                  await axios.get(code.data).then((res) => {
                     document.querySelector(".slide_button").click();
                     
                     if (res.status < 300) {
                        if (vibrate) navigator.vibrate(500);
                        
                        document.getElementById("success").play();
                        
                        let user_copy = JSON.parse(localStorage.getItem('user'));
                        user_copy.bal -= sum;
                        sum = 0;
                        document.getElementById("sum-input").value = '';
                        localStorage.setItem('user', JSON.stringify(user_copy));
      
                        console.log(JSON.stringify(user_copy));
                        
                     }
                  }).catch((e) => {
                     console.log(new Error(e));
                  });

                  requestAnimationFrame(scanQRCode);
               } else requestAnimationFrame(scanQRCode);
            }
         };
         scanQRCode();
      });
   } catch (err) {
      console.error("Ошибка доступа к камере:", err);
   }
}

document.getElementById("pay").addEventListener("click", () => {
   const camera = document.getElementById("camera");

   const carousel = document.getElementById("carousel");
   const activeItems = carousel.querySelectorAll(".active");

   activeItems.forEach((item) => {
      item.classList.remove("active");
   });

   document.querySelectorAll(".slide_button").forEach((button) => {
      button.addEventListener("click", () => {
         camera.classList.add("hidden");
         camera.classList.remove("carousel-item");
         camera.classList.remove("active");
      });
   });

   video.addEventListener("click", () => {
      document.querySelector(".slide_button").click();
   });

   camera.classList.add("carousel-item");
   camera.classList.add("active");
   camera.classList.remove("hidden");
});