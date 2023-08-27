const socket = io("https://pda-0j64.onrender.com", { transports: ["websocket"] });

var group = '';

var distance = 0;

var coords = {
   lat: 0.0,
   long: 0.0
}

const infectionPoints = [
   { name: "bio", latitude: 55.7565, longitude: 37.6180, radius: 1 },
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
   getLocation();
   checkInfectionStatus();

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
   setInterval(checkInfectionStatus, 1000 / 60);
});

function getLocation() {
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
         coords.lat = position.coords.latitude;
         coords.long = position.coords.longitude;
      }, (error) => {
         alert(new Error("Error: " + error.message));
      });
   }
}

function check_stats() {
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

async function checkInfectionStatus () {
   await getLocation();
   infectionPoints.forEach(point => {
      distance = geolib.getDistance(
         { latitude: coords.lat, longitude: coords.long },
         { latitude: point.latitude, longitude: point.longitude }
      );

      document.getElementById("result").innerHTML = `<p>${point.name} : ${parseFloat(distance.toFixed(50))} | cords: lat ${parseFloat(coords.lat).toFixed(5)} long ${parseFloat(coords.long).toFixed(5)}</p>`;
      if (distance <= point.radius) {
         console.log("inside" + point.name);
      }
   });
};
