const socket = io("192.168.178.50:3000", { transports: ["websocket"] });

var group = '';

socket.on("connect", () => {
   console.log("Conected");

   socket.on("get-task", (data) => {
      let parsed_data = JSON.parse(data);
      console.log(parsed_data);
      document.getElementById("task").innerHTML = `<p>${parsed_data.task}</p>`;
   });
});

socket.on("disconnect", () => {
   console.log("Disconnected from server");
});

$(document).ready(() => {
   if ('wakeLock' in navigator) {
      let wakeLock = null;
      const requestWakeLock = async () => {
         try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Активность экрана запрошена');
         } catch (error) {
            console.error('Не удалось запросить активность экрана:', error);
         }
      };

      document.addEventListener('click', () => {
         if (!wakeLock) {
            requestWakeLock();
         }
      });
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
});

