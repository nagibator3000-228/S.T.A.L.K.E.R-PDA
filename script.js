const socket = io("https://pda-0j64.onrender.com", { transports: ["websocket"] });

var group = '';

var distance = 0;

var modal;

var coords = {
   lat: 0.0,
   long: 0.0
}

const infectionPoints = [
   { name: "bio", latitude: 47.998689, longitude: 8.820344, radius: 2, strength: 5 },
   { name: "rad", latitude: 47.999052, longitude: 8.820551, radius: 3, strength: 9 },
   { name: "rad", latitude: 47.999027, longitude: 8.819620, radius: 5, strength: 16 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 7, strength: 24 },
   { name: "rad", latitude: 47.999779, longitude: 8.819765, radius: 15, strength: 6 },
   { name: "rad", latitude: 47.999714, longitude: 8.820312, radius: 6, strength: 25 },
   { name: "psy", latitude: 47.999816, longitude: 8.820140, radius: 2, strength: 4 },
   { name: "bio", latitude: 47.999498, longitude: 8.820577, radius: 4, strength: 7 },
   { name: "rad", latitude: 47.998933, longitude: 8.818682, radius: 5, strength: 18 },
   { name: "bio", latitude: 47.997965, longitude: 8.821235, radius: 4, strength: 3 },
   { name: "rad", latitude: 47.997638, longitude: 8.820741, radius: 6, strength: 7 },
   { name: "rad", latitude: 47.997369, longitude: 8.820891, radius: 5, strength: 8 },
   { name: "rad", latitude: 47.997308, longitude: 8.820505, radius: 6, strength: 6 },
   { name: "rad", latitude: 47.997714, longitude: 8.820011, radius: 3, strength: 4 },
   { name: "bio", latitude: 47.997255, longitude: 8.819794, radius: 4, strength: 6 },
];

socket.on("connect", () => {
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
});

$(document).ready(() => {
   modal = new bootstrap.Modal(document.getElementById('info-modal'));

   checkInfectionStatus();

   if (navigator.geolocation) {
      const options = {
         maximumAge: 1,
         timeout: 100,
         enableHighAccuracy: true
      };
      navigator.geolocation.watchPosition(successCallback, errorCallback, options);
   }

   var dropdownItems = document.querySelectorAll('.dropdown-item');

   dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
         if (item.innerText !== 'No Group') {
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
   document.getElementById("result").innerHTML = `<p>cords: lat ${parseFloat(coords.lat).toFixed(6)} long ${parseFloat(coords.long).toFixed(6)}</p>`;
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
         console.log("inside " + point.name);
         document.getElementById("modal-title").innerText = `point: ${point.name}`;
         document.getElementById("modal-body").innerText = `you are inside ${point.name}, point strength: ${point.strength}`;
         modal.show();
      }
   });
};
