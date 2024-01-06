const express = require('express');
const app = express();
const axios = require('axios').default;
const http = require('http').Server(app);
const io = require('socket.io')(http);
const config = require('./ config');
const {create} = require("axios");
const port = config.port;

const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().max(30).required(),
    email: Joi.string().email().required()
});

if(!config.METERED_DOMAIN){
    throw new Error(
        "Please specify the METERED_DOMAIN.\nAdd as an environment variable or in the .env file or directly specify in the src/config.js\nIf you are unsure where to get METERED_DOMAIN please read the Advanced SDK Guide here: https://metered.ca/docs/Video%20Calls/JavaScript/Building%20a%20Group%20Video%20Calling%20Application"
      );
}

if (!config.METERED_SECRET_KEY) {
    throw new Error(
      "Please specify the METERED_SECRET_KEY.\nAdd as an environment variable or in the .env file or directly specify in the src/config.js\nIf you are unsure where to get METERED_SECRET_KEY please read the Advanced SDK Guide here: https://metered.ca/docs/Video%20Calls/JavaScript/Building%20a%20Group%20Video%20Calling%20Application"
    );
  }

app.use("/",express.static(__dirname + '/public_html'));

app.get("/chat", (req, res) => {
   return  res.sendFile(__dirname + '/public_html/chat.html');
});

app.get('/validate_meeting', function(req,res){
    // console.log(res);

    let options = {
        method: "GET",
        url:
          "https://" +
          config.METERED_DOMAIN +
          "/api/v1/room/" +
          req.query.meetingId,
        params: {
          secretKey: config.METERED_SECRET_KEY,
        },
        headers: {
          Accept: "application/json",
        },
    };

    axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      res.send({
        success: true,
      });
    })
    .catch(function (error) {
      console.error(error);
      res.send({
        success: false,
      });
    }); 
});

app.post("/create-meeting-room", function (req, res) {
    /**
     * Using the Metered Create Room API to create a new
     * Meeting Room.
     * https://www.metered.ca/docs/rest-api/create-room-api
     */
    var options = {
      method: "POST",
      url: "https://" + config.METERED_DOMAIN + "/api/v1/room/",
      params: {
        secretKey: config.METERED_SECRET_KEY,
      },
      headers: {
        Accept: "application/json",
      },
    };
  
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        res.send({
          success: true,
          ...response.data,
        });
      })
      .catch(function (error) {
        console.error(error);
        res.send({
          success: false,
        });
      });
  });

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  socket.on('message', (message) => {
    console.log('Received message:', message);
    io.emit('message', message);
  });

  console.log('UserId => ' + socket.id);
  socket.on('create user', (payload, callback) => {
      if(typeof callback !== "function") {
          return socket.disconnect();
      }
      const { error, value } = userSchema.validate(payload);
      if (error) {
          return callback({
              status: "Ko",
              error
          });
      }
      callback({
          status: "Ok"
      });
  });

    socket.on("hello", (arg) => {
        console.log(arg); // world
    });

    socket.on("room", (...args) => {
        console.log('details ' + args);
    });

    socket.broadcast.emit('broadcast', 'New participant connected.');

    socket.broadcast.emit('joined', 'Everybody, say hello to ' + socket.id);

    socket.broadcast.emit('leave', 'Everybody, say good by to ' + socket.id);


    


    // Join room event
    // socket.on('join-room', (roomId, socket.id) => {
    //     socket.join(roomId);
    //     socket.to(roomId).broadcast.emit("user-connected", userId);
    // });
});

http.listen(3000, () => {
  console.log('Server started on port 3000');
});