const socket = io("https://pda-0j64.onrender.com/", { transports: ["websocket"] });

var data = {
   group: "",
   task: "",
}

$(document).ready(() => {
   socket.on("connect", () => {
      console.log("Conected");
      var dropdownItems = document.querySelectorAll('.dropdown-item');

      dropdownItems.forEach((item) => {
         item.addEventListener('click', () => {
            data.group = item.innerText;
            let btn = document.querySelector('.dropdown-toggle');
            btn.innerText = data.group;
         });
      });
      socket.on("online", (count)=> {
         document.getElementById("online_val").innerText = count;
      });
   });
});

function check() {
   const task = document.getElementById("task").value;
   data.task = task;
   document.getElementById("modal-body").innerHTML = `<span><h3>Group: ${data.group}</h3><br><p id="message">message: ${data.task}</p></span>`;
}

function send() {
   document.getElementById("task").value = '';
   console.log(data);
   socket.emit("admin-send", JSON.stringify(data));
   document.getElementById("sound").play();
}