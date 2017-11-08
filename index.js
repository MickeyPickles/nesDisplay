var express = require('express');
var app     = express();
var port    = process.env.PORT || 5000;
//pickle is adding this
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// SOCKET IO
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var sockets = [],
    mainSocket,
    message;


app.use(express.static('node_modules'));
app.use(express.static('client'));

// SOCKET IO SERVER SIDE CONNECTIONS.

// CALLED WHEN AN DEVICE CONNECTS TO THE SERVER.
io.on('connection', function(socket){

  console.log("CONNECTION MADE W/" + socket.id);

  sockets.push(socket.id);
  mainSocket = socket;

  // FUNCTIONS / COMMANDS THAT ARE CALLED UPON RECIEVING A SIGNAL

  /* NOTE:
    @Example: SAMPLE SOCKET IO MESSAGE
    @Param: messageName: The name of the event which is recieved by the backend
    @Param: messageData: The data that is recieved from the SocketIO message.

    socket.on(messageName, function(messageData){

      console.log("EVENT");
      console.log(data);

      EMIT IS USED TO BROADCAST THE MESSAGE TO ALL DEVICES THAT ARE CONNECTED
      TO THE SOCKET. THIS IS DONE AS FOLLOWS:

      io.emit('event', messageData);

    });

  */

  /*
  SOCKET IO COMMAND: 'project'

  USE: USED TO LET THE DISPLAY KNOW THAT THEY HAVE TO PLAY A SINGLE PROJECT.

  NOTE: THIS COMMAND IS CURRENTLY NOT IN USE AS WE ARE USING PLAYLISTS EXCLUSIVELY
  BUT WILL NEED TO BE INTEGRATED IN THE FUTURE TO ALLOW FOR SPECIFIC PROEJCTS TO
  BE PLAYED.

  SENDER: IPAD
  */
  socket.on('project', function(data){

    console.log("PROJECT  " + data);

    // BROADCAST 'PROJECT' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('project', data);

  });

  /*
  SOCKET IO COMMAND: 'video'

  USE: TO LET THE DISPLAY KNOW WHEN TO PAUSE OR PLAY A VIDEO

  SENDER: IPAD
  */

  socket.on('video', function(data){

    console.log("video");
    console.log(data);

    // BROADCAST 'VIDEO' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('video', data);

  });

  /*
  SOCKET IO COMMAND: 'switchPlaylistProject'

  USE: TO LET THE DISPLAY/IPAD KNOW WHEN TO PROJECTS TO A DIFFERENT INDEX.

  SENDER: IPAD/DISPLAY
  */

  socket.on('switchPlaylistProject', function(data){
    console.log('switchPlaylistProject');
    console.log(data);

    // BROADCAST 'SWITCH PLAYLIST PROJECT' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('switchPlaylistProject', data);
  });

  /*
  SOCKET IO COMMAND: 'playReel'

  USE: TO LET THE DISPLAY KNOW TO RETURN / PLAY THE HIGHLIGHT REEL

  SENDER: IPAD/DISPLAY
  */

  socket.on('playReel', function(data){
    // BROADCAST 'PLAY REEL' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('playReel', data);
  });


  socket.on('playNES', function(data){
    // BROADCAST 'PLAY REEL' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('playNES', data);
  });


  /*
  SOCKET IO COMMAND: 'playPlayListAtIndex'

  USE: TO LET THE DISPLAY KNOW TO PLAY A PROJECT AT A SPECIFIC INDEX.

  SENDER: IPAD
  */

  socket.on('playPlayListAtIndex', function(data){
    console.log(data);
    // BROADCAST 'PLAY PLAYLIST AT INDEX' EVENT AND ITS DATA TO ALL DEVICES.
    io.emit('playPlayListAtIndex', data);
  });

  socket.on('disconnect', function(){

    console.log("DISCONNECTED");

  });
});



app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index.ejs');
});


//particle posts this
//{"event":"prototype-nes","data":"{\"buttonAction\":\"pressed\", \"lastRFID\":\"66006C451E51\"}","published_at":"2017-05-16T13:55:52.616Z","coreid":"29002a000b47353137323334"}

app.post('/particleWebhook',function(req, res, next){
  var dataString = req.body.data;
  var projectName, nesGameName;
  var dataObj = JSON.parse(dataString);
  console.log("We have something from particle :" + dataObj);
  if(dataObj.lastRFID == "66006C338AB3") {
    //console.log("Samsung Hu");
    projectName = "Samsung Hu";
  } else if(dataObj.lastRFID == "66006C3A4A7A") {
    //console.log("Google Tango");
    projectName = "Google Tango";
  } else if(dataObj.lastRFID == "6A003E398AE7") {
    //console.log("Google Tango");
    projectName = "NikeiD VR";
  } else if(dataObj.lastRFID == "66006C451E51") {
    //console.log("Google Tango");
    nesGameName = "Super%20Mario%20Bros.%203%20(U)%20(PRG1)%20%5B!%5D.nes";
  } else if(dataObj.lastRFID == "6A003E37583B") {
    //console.log("Google Tango");
    nesGameName = "Legend%20of%20Zelda%2C%20The%20(U)%20(PRG1).nes";
  }
//66006C338AB3 Samsung Hu
//66006C3A4A7A Tango
//6A003E398AE7 Nike ID
//66006C451E51 Mario 3
//6A003E37583B Zelda!
//Samsung Move to Play
//Verizon Open Innovation


  if(projectName) {
    io.emit('project',projectName);
  } else if (nesGameName) {
    io.emit('playNES', nesGameName);
  }

  res.send("we good");
});




app.post('/displayCommand',function(req, res, next){

  var data = req.body;

  if(data.nesGame) {
    io.emit('playNES',data.nesGame);
    console.log("we have a game");
  } else if(data.project) {
    io.emit('project',data.project);
    console.log("emmiting project");
  } else {
    io.emit('playPlayListAtIndex',data);
    console.log("emmiting playlist");
  }

  //console.log("Getting this : " + JSON.stringify(req.body));
  res.json({"success":"true"});
  // io.emit("playPlayListAtIndex", currentProjectIndex);
});

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

server.listen(port, function(){
  console.log('http server started');
});
