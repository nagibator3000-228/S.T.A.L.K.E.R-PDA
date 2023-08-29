const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require("cors");
const os = require("os");
require("dotenv").config();

"use strict";

const api_controller = require("./controllers/api_controller");
const APIKey = require("./models/APIKey");

let authorized = false;

var sockets = [];
var count_of_sockets = 0;

app.use(cors({origin: '*', methods: ["GET"]}));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});

app.get('/admin/API/', async (req, res)=> {
   const apikey = new APIKey(req.query.key);
   const validApiKeys = api_controller.getKeys(process.env.VALID_API_KEYS);

   authorized = false;

   await validApiKeys.forEach(validApiKey => {
      if (apikey.key === validApiKey) {
         authorized = true;
      }
   });

   if (authorized === true) {
      switch (req.query.file) {
         case 'style.css': res.status(200).sendFile(__dirname + '/selber/style.css'); break; 
         case 'script.js': res.status(200).sendFile(__dirname + '/selber/script.js'); break;
         default: res.status(404);
      }
   } else {
      res.status(403).sendFile(__dirname + '/forbidden.html');
   }
});

app.get('/admin/API/style.css.map', (req, res) => {
   res.status(200).sendFile(__dirname + '/selber/style.css.map');
});

app.get('/admin/API/script.js', (req, res) => {
   res.status(200).sendFile(__dirname + '/selber/script.js');
});

app.get('/admin', (req, res) => {
   res.status(403).sendFile(__dirname + '/forbidden.html');
});

app.get('/admin/API/:API_KEY', (req, res) => {
   let providedApiKey = new APIKey(req.params.API_KEY);

   let authorized = false;

   const validApiKeys = api_controller.getKeys(process.env.VALID_API_KEYS);

   validApiKeys.forEach(validApiKey => {
      if (providedApiKey.key === validApiKey) {
         authorized = true;
      }
   });

   if (authorized === true) {
      res.status(200).sendFile(__dirname + '/selber/index.html');
   } else {
      res.status(403).sendFile(__dirname + '/forbidden.html');
   }
});

app.use((req, res, next) => {
   res.status(404).send("Слышь, брат, страница не найдена! Чё ты тут забыл?");
});

io.on("connection", (socket) => {
   var date = new Date();
   var month = date.getMonth() + 1;
   console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "\u001b[32mPlayer connected.\u001b[0m");

   sockets.push(socket.id);
   const connectionsCount = io.sockets.server.engine.clientsCount;
   count_of_sockets = connectionsCount;
   console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "sockets: ", sockets, "\n" + `[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "players online: ", " ", count_of_sockets, "\n");

   socket.on("join", (team) => {
      if (team !== '' || team !== ' ') {
         socket.join(team);
      }
   });

   socket.on("admin-send", (data) => {
      const parsed_data = JSON.parse(data);
      if (parsed_data.task !== '') {
         io.in(parsed_data.group).emit('get-task', JSON.stringify(parsed_data));
      } else {
         io.in(parsed_data.group).emit('clear');
      }
   });

   socket.on("disconnect", () => {
      var date = new Date();
      var month = date.getMonth() + 1;
      console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "\u001b[31mPlayer disconnected.\u001b[0m");

      count_of_sockets--;
      let index = sockets.indexOf(socket.id);
      if (index !== -1) {
         sockets.splice(index, 1);
      }

      const connectionsCount = io.sockets.server.engine.clientsCount;
      count_of_sockets = connectionsCount;
      console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "sockets: ", sockets, "\n" + `[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "players online: ", " ", count_of_sockets, "\n");
   });
});

http.listen(process.env.PORT, () => {
   console.log("starting...");
   try {
      let date = new Date();
      let month = date.getMonth() + 1;
      console.log(`\n[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + `\u001b[32mServer started on port 3000\u001b[0m | system ${os.arch} | cpu ${os.availableParallelism}\n`);
   } catch (e) {
      console.error(new Error(`ERROR 503 | ${e}`));
   }
});
