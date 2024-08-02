const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require("cors");
const os = require("os");
const compression = require('compression');
const morgan = require('morgan');
const api_controller = require("./controllers/api_controller").default;
const APIKey = require("./models/APIKey").default;
const axios = require("axios");
require("dotenv").config();

"use strict";

app.use(cors({ origin: '*', methods: ["GET"] }));
app.use('/', morgan(':method | :url | status :status | ping :response-time ms'));
app.use(compression());
app.use(express.static(__dirname));

var sockets = [];
var count_of_sockets = 0;

const router = express.Router();

router.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});

router.get('/admin/API/', async (req, res) => {
   const Apikey = new APIKey(req.query.key);
   const validApiKeys = api_controller.getKeys(process.env.VALID_ADMIN_API_KEYS);
   
   await api_controller.validateKey(Apikey.key, validApiKeys);

   if (api_controller.authorized === true) {
      switch (req.query.file) {
         case 'style.css': res.status(200).sendFile(__dirname + '/selber/style.css'); break;
         case 'script.js': res.status(200).sendFile(__dirname + '/selber/script.js'); break;
         default: res.status(404).end();
      }
   } else {
      res.status(403).sendFile(__dirname + '/forbidden.html');
   }
});

router.get('/admin/API/style.css.map', (req, res) => {
   res.status(200).sendFile(__dirname + '/selber/style.css.map');
});

router.get('/admin', (req, res) => {
   res.status(403).sendFile(__dirname + '/forbidden.html');
});

router.get('/admin/API/:API_KEY', async (req, res) => {
   const Apikey = new APIKey(req.params.API_KEY);
   const validApiKeys = api_controller.getKeys(process.env.VALID_ADMIN_API_KEYS);
   var date = new Date();
   var month = date.getMonth() + 1;
 
   await api_controller.validateKey(Apikey.key, validApiKeys);
 
   if (api_controller.authorized === true) {
      console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + `\u001b[32mNew Admin connection IP: ${req.ip}\u001b[0m`);
      res.status(200).sendFile(__dirname + '/selber/index.html');
   } else {
      res.status(403).sendFile(__dirname + '/forbidden.html');
   }
});

router.use((req, res) => {
   res.status(404).send("404 | Слышь, брат, страница не найдена! Чё ты тут забыл?");
});

app.use("/", router);

io.on("connection", (socket) => {
   var date = new Date();
   var month = date.getMonth() + 1;
   console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "\u001b[32mPlayer connected.\u001b[0m");

   sockets.push(socket.id);
   const connectionsCount = io.sockets.server.engine.clientsCount;
   count_of_sockets = connectionsCount;

   console.log(`[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "sockets: ", sockets, "\n" + `[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + "players online: ", " ", count_of_sockets, "\n");

   io.emit("online", count_of_sockets-1);

   socket.on("join", (team) => {
      if (team !== '' || team !== ' ') {
         socket.join(team);
      }
   });

   socket.on("admin-send", (data) => {
      const { task, group } = JSON.parse(data);
      
      if (task !== '') {
         io.in(group).emit('get-task', JSON.stringify(task));
      } else {
         io.in(group).emit('clear');
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
      io.emit("online", count_of_sockets-1);
   });
});

http.listen(process.env.PORT, () => {
   console.log("starting...");
   try {
      let date = new Date();
      let month = date.getMonth() + 1;
      console.log(`\n[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + `\u001b[32mServer started on port ${process.env.PORT}\u001b[0m | system ${os.arch} | cpu ${os.availableParallelism}\n`);
   } catch (e) {
      console.error(new Error(`ERROR 503 | ${e}`));
   }
});
 
// http.listen(3000, '192.168.178.50', () => {
//    console.log("starting...");
//    try {
//       let date = new Date();
//       let month = date.getMonth() + 1;
//       console.log(`\n[${date.getDate().toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} | ${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} : ${date.getSeconds().toString().padStart(2, '0')}]` + " " + `\u001b[32mServer started on 192.168.178.50:3000\u001b[0m | system ${os.arch} | cpu ${os.availableParallelism}\n`);
//    } catch (e) {
//       console.error(new Error(`ERROR 503 | ${e}`));
//    }
// });