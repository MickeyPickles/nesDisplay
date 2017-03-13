// SIZE VARIABLES

var viewHeight = window.innerHeight;
var viewWidth = window.innerWidth;

var projectDivHeight = 0.9*viewHeight - 0.025*viewWidth;

var infoDivHeight = 0.1*viewHeight - 0.025*viewWidth;

// S3 VARIABLES

var awsS3 = new awsS3;

// DISPLAY VARIABLES

var projectFolders = [];
// var projectData = ["https://media.giphy.com/media/xTiTnGKRrYFiucyTpC/giphy.gif","https://s3.amazonaws.com/prototypedisplay/test.mp4","https://s3.amazonaws.com/prototypedisplay/test.mp4","https://media.giphy.com/media/xTiTnGKRrYFiucyTpC/giphy.gif","http://vrone.us/media/wysiwyg/12211-87deb5c625116df48c811a227a2c74a5.jpg"];
var projectData = [];
var projectVideoURL = [];
var projectTitles = [];
var projectClient = [];
var projectOffice = [];
var projectVideo = [];
var currentProjectIndex = 0;

// TIMEOUT VARIABLES

var reelTimeout = '';
var reelTimeoutTime = 2000;

var playlistTimeout = '';
var playedPlaylistProjectCount = 0;

var imageTimeoutTime = 3000;
var videoTimeoutTime = 0;

//  SOCKET IO VARIABLES
var socket = io('http://localhost:5000');


// DIVS

var projectDiv;
var projectVideoDiv;
var videoSource;
var projectName;
var clientName;
var rgaOffice;

(function(){

    socket.on('connect', function(){
      console.log("connected")
    });

    socket.on('frontEnd', function(data){
      console.log("FRONT EVENT");
    });

    socket.on('event', function(data){
      console.log("EVENT");
      console.log(data);

      $('body').css('background-color',data);
    });

    socket.on('project', function(data){
      console.log("project");
      console.log(data);

      clearTimeoutCalled(reelTimeout);

      awsS3.matchProjectNameToIndex(projectTitles, data.toString(), function(projectFound, index){
        console.log(projectFound)
        if(projectFound == true){
          currentProjectIndex = index;
          setProjectInformation();

          // playlist timeout and variables
          setTimeout(function(){
            playedPlaylistProjectCount = 0;
            setPlaylistTimeout();
          },1000);
        }
        else{
          // PROJECT NOT FOUND
        }
      });
    });

    socket.on('video', function(data){
      console.log("video");
      console.log(data);

      // resetReelTimeout();

      if(data == "pauseVideo"){
        // PAUSE
        projectVideoDiv.pause();
        pauseVideoTimeout();

      }
      else{
        // PLAY
        projectVideoDiv.play();
        restartVideoTimeout();
      }
    });



    socket.on('disconnect', function(){
      console.log("disconnect")
    });

    // INIT PROGRAM

    awsS3.configure(function(){
      awsS3.getProjectFolders(function(data){
          awsS3.getInformationForAllProjects(data, function(s3ProjectTitles, s3RgaOffces, s3ProjectInformation, s3ProjectVideo){

              projectFolders = data;
              projectTitles = s3ProjectTitles;
              projectOffice = s3RgaOffces;
              projectInformation = s3ProjectInformation;
              projectVideo = s3ProjectVideo;

              awsS3.getProjectURLS(data, projectVideo, function(s3ProjectData,s3ProjectVideoURL){

                projectData = s3ProjectData;
                projectVideoURL = s3ProjectVideoURL;

                setTimeout(function(){
                  initPage();
                }, 500);

              });
          });
      })
    });
})();

// DISPLAY FUNCTIONS


function initPage(){



  console.log(infoDivHeight)

  // add the projectDiv (WILL BE A  BACKGROUND IMAGE)

  projectDiv = document.createElement('div');

  projectDiv.style.position = 'absolute';
  projectDiv.id = "projectDiv"
  projectDiv.style.width = '100vw';
  projectDiv.style.height = projectDivHeight + 'px';
  projectDiv.style.top = 0;
  // projectDiv.style.backgroundColor = 'grey';
  projectDiv.style.background = "url("+projectData[currentProjectIndex]+") no-repeat center";
  // projectDiv.style.backgroundRepeat = 'no-repeat';
  // projectDiv.style.backgroundSize = '100% 100%'
  document.body.appendChild(projectDiv);

  // ADD THE INFO DIVS

  projectName = document.createElement('div');
  projectName.id = "projectName";
  projectName.style.width = '30vw';
  projectName.style.height = infoDivHeight + 'px';
  projectName.style.position = 'absolute';
  projectName.style.bottom = '2.5vw';
  projectName.style.left = '2.5vw';
  // projectName.style.backgroundColor = 'black';
  projectName.innerHTML = projectTitles[currentProjectIndex];
  document.body.appendChild(projectName);

  clientName = document.createElement('div');
  clientName.id = "clientName";
  clientName.style.width = '30vw';
  clientName.style.height = infoDivHeight + 'px';
  clientName.style.position = 'absolute';
  clientName.style.bottom = '2.5vw';
  clientName.style.left = '35vw';
  clientName.style.backgroundColor = 'red';
  document.body.appendChild(clientName);

  rgaOffice = document.createElement('div');
  rgaOffice.id = "rgaOffice";
  rgaOffice.style.width = '30vw';
  rgaOffice.style.height = infoDivHeight + 'px';
  rgaOffice.style.position = 'absolute';
  rgaOffice.style.bottom = '2.5vw';
  rgaOffice.style.left = '67.5vw';
  // rgaOffice.style.backgroundColor = 'blue';
  rgaOffice.innerHTML = projectOffice[currentProjectIndex];
  document.body.appendChild(rgaOffice);

  addProjectVideo();

}

function addProjectVideo(){

  projectVideoDiv = document.createElement('video');
  projectVideoDiv.style.position = 'absolute';
  projectVideoDiv.id = "projectVideoDiv"
  projectVideoDiv.style.width = '100vw';
  projectVideoDiv.style.height = projectDivHeight + 'px';
  projectVideoDiv.style.top = 0;
  projectVideoDiv.style.zIndex = 100;
  projectVideoDiv.autoplay = true;
  projectVideoDiv.poster = projectData[currentProjectIndex];
  document.body.appendChild(projectVideoDiv);

  videoSource = document.createElement("source");
  videoSource.type = "video/mp4";
  videoSource.src = projectVideoURL[currentProjectIndex];
  projectVideoDiv.appendChild(videoSource);
}

function removeProjectVideo(){
  var divToRemove = document.getElementById('projectVideoDiv');
  divToRemove.parentNode.removeChild(divToRemove);
  // document.body.removeChild(projectVideoDiv);
}

function setProjectInformation(){
  projectName.innerHTML = projectTitles[currentProjectIndex];
  rgaOffice.innerHTML = projectOffice[currentProjectIndex];

  console.log(projectVideo[currentProjectIndex]);

  if(document.getElementById('projectVideoDiv') != null){
    removeProjectVideo();
  }

  if(projectVideo[currentProjectIndex] == 'true'){
    console.log("!!");
    addProjectVideo();
    projectDiv.style.background = ''
  }
  else{
    projectDiv.style.background = "url("+projectData[currentProjectIndex]+") no-repeat center";
  }
}

// MARK: PLAYLIST TIMEOUT FUNCTIONS

function nextItemOnPlaylist(){

  // INCREMENT PROJECTCOUNT

  playedPlaylistProjectCount += 1;
  currentProjectIndex += 1;

  if(playedPlaylistProjectCount != (projectTitles.length - 1)){

    if(currentProjectIndex > (projectTitles.length - 1)){
      currentProjectIndex = 1;
    }

    setProjectInformation();

    socket.emit("switchPlaylistProject", currentProjectIndex);

    setTimeout(function(){
      setPlaylistTimeout();
    }, 500);

  }
  else{
    console.log("SETTING REEL TIMEOUT");
    resetReelTimeout();
  }
}

function setPlaylistTimeout(){

  // CLEAR THE TIMEOUT IF IT EXISTS.

  clearTimeoutCalled(playlistTimeout);

  // DETERMINE PLAYLIST TIMEOUT;

  var itemTimeout = 0;

  if(projectVideo[currentProjectIndex] == 'true'){
    itemTimeout = projectVideoDiv.duration * 1000 + 4500; // add 5 seconds to the timeout
  }
  else{
    itemTimeout = imageTimeoutTime;
  }

  console.log("TIMEOUT " + itemTimeout);

  // SET NEW TIMEOUT;

  playlistTimeout = setTimeout(function(){
    console.log("COUNT " + playedPlaylistProjectCount)
    nextItemOnPlaylist();

  }, itemTimeout);

}

function clearTimeoutCalled(timeoutName){
  if(timeoutName != ''){
    clearTimeout(timeoutName);
  }
}

// MARK: PAUSE/PLAY TIMEOUT FUNCTIONS

function pauseVideoTimeout(){
  clearTimeoutCalled(playlistTimeout);
  resetReelTimeout();
  console.log("PAUSE");

}

function restartVideoTimeout(){
  clearTimeoutCalled(reelTimeout);

  // DETERMINE REMAINING TIME LEFT OF VIDEO AND SUBTRACT IT FROM THE TOTAL AND ADD 4.5 SECONDS.
  console.log("PLAY");
  var remainingVideoTimeout = (projectVideoDiv.duration - projectVideoDiv.currentTime)*1000 +4500;
  playlistTimeout = setTimeout(function(){
    nextItemOnPlaylist();
  }, remainingVideoTimeout);
}

// MARK: REEL TIMEOUT FUNCTIONS

function resetReelTimeout(){
  clearTimeoutCalled(reelTimeout);
  setReturnToReelTimeout();

}


function setReturnToReelTimeout(){

  reelTimeout = setTimeout(function(){
    currentProjectIndex = 0;
    setProjectInformation();
    socket.emit("playReel", currentProjectIndex);
  }, reelTimeoutTime);

}
