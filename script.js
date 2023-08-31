const socket = io("https://pda-0j64.onrender.com", { transports: ["websocket"] });

var group = '';

var infections = {
   rad: 20,
   bio: 0,
   psy: 0,
   temp: 23
}

var health = 100;

var infect;
var background_infect;

var rad_min = 20;

var health_flag = false;
var background_flag = false;
var flag = false;

var modal;

var coords = {
   lat: 0.0,
   long: 0.0
}

var distance = 0;

const infectionPoints = [
   { name: "bio", latitude: 47.998689, longitude: 8.820344, radius: 2, strength: 5 },
   { name: "rad", latitude: 47.999052, longitude: 8.820551, radius: 3, strength: 9 },
   { name: "rad", latitude: 47.999027, longitude: 8.819620, radius: 5, strength: 16 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 7, strength: 24 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 13, min: 60, background: true },       //? zone 2
   { name: "rad", latitude: 47.999714, longitude: 8.820312, radius: 9, strength: 25 },
   { name: "psy", latitude: 47.999816, longitude: 8.820140, radius: 3, strength: 4 },
   { name: "bio", latitude: 47.999498, longitude: 8.820577, radius: 4, strength: 7 },
   { name: "rad", latitude: 47.998933, longitude: 8.818682, radius: 5, strength: 18 },
   { name: "bio", latitude: 47.997965, longitude: 8.821235, radius: 4, strength: 3 },
   { name: "rad", latitude: 47.997638, longitude: 8.820741, radius: 6, strength: 7 },
   { name: "rad", latitude: 47.997369, longitude: 8.820891, radius: 5, strength: 8 },
   { name: "rad", latitude: 47.997308, longitude: 8.820505, radius: 13, strength: 6 },
   { name: "rad", latitude: 47.997714, longitude: 8.820011, radius: 3, strength: 4 },
   { name: "bio", latitude: 47.997255, longitude: 8.819794, radius: 4, strength: 6 },
   { name: "rad", latitude: 47.999153, longitude: 8.821538, radius: 30, min: 34, background: true },      //! locations
   { name: "rad", latitude: 47.996979, longitude: 8.820725, radius: 19, min: 55, background: true }       //! locations
];

socket.on("connect", () => {
   document.getElementById("connection").innerText = "connected";
   document.getElementById("connection").classList.add("text-success");
   document.getElementById("connection").classList.remove("text-danger");
   document.getElementById("conn_img").src = "assets/img/connected.png"

   console.log("Conected");

   socket.on("get-task", (data) => {
      let parsed_data = JSON.parse(data);
      console.log(parsed_data);
      document.getElementById("task").innerHTML = `<p>${parsed_data.task}</p>`;
   });

   socket.on("clear", () => {
      document.getElementById("task").innerHTML = ``;
   });
});

socket.on("disconnect", () => {
   console.log("Disconnected from server");

   document.getElementById("connection").innerText = "disconnected";
   document.getElementById("connection").classList.add("text-danger");
   document.getElementById("connection").classList.remove("text-success");
   document.getElementById("conn_img").src = "assets/img/disconnect.jpg"
});

$(document).ready(() => {
   modal = new bootstrap.Modal(document.getElementById('info-modal'));

   checkInfectionStatus();

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
            socket.emit("join", group);
         } else {
            setTimeout(() => {
               location.reload();
            }, 1000);
         }
      });
   });
   setInterval(check_stats, 1000 / 60);
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

   if (currentHealth < 20) {
      healthElement.classList.remove("text-success", "text-warning");
      healthElement.classList.add("text-danger");
   } else if (currentHealth < 50) {
      healthElement.classList.remove("text-success", "text-danger");
      healthElement.classList.add("text-warning");
   } else {
      healthElement.classList.remove("text-warning", "text-danger");
      healthElement.classList.add("text-success");
   }

   if (currentRad > 100) {
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
}

function checkInfectionStatus() {
   infectionPoints.forEach(point => {
      distance = geolib.getDistance(
         { latitude: coords.lat, longitude: coords.long },
         { latitude: point.latitude, longitude: point.longitude }
      );

      if (distance <= point.radius) {
         // document.getElementById("modal-title").innerText = `point: ${point.name}`;
         // document.getElementById("modal-body").innerText = `you are inside ${point.name}, point strength: ${point.strength}`;

         if (point.background) {
            if (!background_flag) {
               background_flag = true;
               rad_min = point.min;
               document.getElementById("rad").innerText = rad_min;
            }
         } else {
            if (!flag) {
               // modal.show();
               flag = true;
               infect = setInterval(() => {
                  switch (point.name) {
                     case 'rad': infections.rad += point.strength; document.getElementById("rad").innerText = infections.rad; break;
                     case 'bio': infections.bio += point.strength; document.getElementById("bio").innerText = infections.bio; break;
                     case 'psy': infections.psy += point.strength; document.getElementById("psy").innerText = infections.psy; break;
                     case 'temp': infections.temp += point.strength; document.getElementById("temp").innerText = infections.temp; break;
                     default: console.log(`Erorr: ${new Error("undefined infection")}`);
                  }
               }, 500);
            }
         }
      } else {
         if (health < 0) health = 0;
         if (health === 0) {
            document.getElementById("modal-title").innerText = `DEATH`;
            document.getElementById("modal-body").innerText = `You Died! take your red flag and walk to your base.`;
            modal.show();
         }

         if (infections.rad < rad_min) infections.rad = rad_min;
         if (infections.bio < 0) infections.bio = 0;
         if (infections.psy < 0) infections.psy = 0;

         if (!health_flag) checkHealth();
      }
   });
};

function checkHealth() {
   health_flag = true;
}