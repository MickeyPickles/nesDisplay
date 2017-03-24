var express = require('express');
var app     = express();
var port    = process.env.PORT || 5000;

var server  = require('http').createServer(app);
var io      = require('socket.io')(server);

var sockets = [],
    mainSocket,
    message;


app.use(express.static('node_modules'));
app.use(express.static('client'));

io.on('connection', function(socket){

  console.log("CONNECTION MADE W/" + socket.id);

  sockets.push(socket.id);
  mainSocket = socket;

  // console.log(mainSocket);
  console.log();

  socket.on('set', function(socket){
    console.log("SET");
  })

  socket.on('event', function(data){

    console.log("EVENT");
    console.log(data);

    io.emit('event', data);

  });

  socket.on('project', function(data){

    console.log("PROJECT  " + data);
    io.emit('project', data);

  });

  socket.on('video', function(data){

    console.log("video");
    console.log(data);

    io.emit('video', data);

  });

  socket.on('switchPlaylistProject', function(data){
    console.log('switchPlaylistProject');
    console.log(data);
    io.emit('switchPlaylistProject', data);
  });

  socket.on('playReel', function(data){
    io.emit('playReel', data);
  });

  socket.on('playPlayListAtIndex', function(data){
    console.log(data);
    io.emit('playPlayListAtIndex', data);
  });

  socket.on('switchPlaylistProject', function(data){
    console.log(data);
    io.emit('switchPlaylistProject', data);
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

// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

server.listen(port, function(){
  console.log('http server started');
});
