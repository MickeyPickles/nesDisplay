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
var projectInfoDiv;
var rgaOffice;
var rgaCube;

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
          awsS3.getDisplayList(function(displayList){
            awsS3.getInformationForAllProjects(displayList, data, function(s3ProjectTitles, s3RgaOffces, s3ProjectInformation, s3ProjectVideo){

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
        });
      })
    });
})();

// DISPLAY FUNCTIONS


function initPage(){

  // add the projectDiv (WILL BE A  BACKGROUND IMAGE)

  projectDiv = document.createElement('div');

  projectDiv.style.position = 'absolute';
  projectDiv.id = "projectDiv"
  projectDiv.style.width = '100vw';
  projectDiv.style.height = '100vh' //projectDivHeight + 'px';
  projectDiv.style.top = 0;
  // projectDiv.style.backgroundColor = 'grey';
  projectDiv.style.background = "url("+projectData[currentProjectIndex]+") no-repeat center";
  // projectDiv.style.backgroundRepeat = 'no-repeat';
  // projectDiv.style.backgroundSize = '100% 100%'
  document.body.appendChild(projectDiv);

  // ADD THE INFO DIVS

  projectInfoDiv = document.createElement('div');
  projectInfoDiv.id = 'projectInfoDiv';
  projectInfoDiv.style.height = '7.5vh';
  projectInfoDiv.style.width = '100vw';
  projectInfoDiv.style.bottom = '0';
  projectInfoDiv.style.position = 'absolute';
  projectInfoDiv.style.zIndex = 120;
  projectInfoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  document.body.appendChild(projectInfoDiv);

  projectName = document.createElement('div');
  projectName.id = "projectName";
  projectName.style.width = 'auto';
  projectName.style.height = 'auto';
  projectName.style.position = 'absolute';
  projectName.style.bottom = '1.325vh';
  projectName.style.left = '2.5vw';
  projectName.style.zIndex = 120;
  projectName.style.verticalAlign = 'middle';
  projectName.innerHTML = projectTitles[currentProjectIndex];
  projectInfoDiv.appendChild(projectName);

  // VERTICALLY ALIGN PROJECT NAME

  var projectNameBottom = (0.075*viewHeight - $('#projectName').height())/2;
  console.log(projectNameBottom);
  $('#projectName').css('bottom', projectNameBottom);

  rgaOffice = document.createElement('div');
  rgaOffice.id = "rgaOffice";
  rgaOffice.style.width = 'auto';
  rgaOffice.style.height = 'auto';
  rgaOffice.style.position = 'absolute';
  rgaOffice.style.bottom = '1.325vh';
  rgaOffice.style.right = '2.5vw';
  rgaOffice.style.zIndex = 120;
 // rgaOffice.style.backgroundColor = 'blue';
  rgaOffice.innerHTML = projectOffice[currentProjectIndex];
  projectInfoDiv.appendChild(rgaOffice);

  // VERTICALLY ALIGN RGA OFFICE
  var rgaOfficeBottom = (0.075*viewHeight - $('#rgaOffice').height())/2;
  $('#rgaOffice').css('bottom', rgaOfficeBottom);

  rgaCube = document.createElement('div');
  rgaCube.id = "rgaCube";
  rgaCube.style.width = '3.5vh';
  rgaCube.style.height = '3.5vh';
  rgaCube.style.backgroundColor = 'rgba(232, 16, 48, 1)';
  rgaCube.style.position = 'absolute';
  rgaCube.style.bottom = '2vh';
  rgaCube.style.zIndex = 120;
  rgaCube.style.display = 'none';
  projectInfoDiv.appendChild(rgaCube);

  // var newCubePosition = 0.05*viewWidth + $('#rgaOffice').width() + $('#rgaCube').width();
  // console.log(newCubePosition)

  addProjectVideo();

}

function addProjectVideo(){

  projectVideoDiv = document.createElement('video');
  projectVideoDiv.style.position = 'absolute';
  projectVideoDiv.id = "projectVideoDiv"
  projectVideoDiv.style.width = '100vw';
  projectVideoDiv.style.height = '100vh'   //projectDivHeight + 'px';
  projectVideoDiv.style.top = 0;
  projectVideoDiv.style.left = 0;
  projectVideoDiv.style.zIndex = 100;
  projectVideoDiv.autoplay = true;
  projectVideoDiv.poster = projectData[currentProjectIndex];
  document.body.appendChild(projectVideoDiv);

  videoSource = document.createElement("source");
  videoSource.type = "video/mp4";
  videoSource.src = projectVideoURL[currentProjectIndex];
  projectVideoDiv.appendChild(videoSource);

  if(currentProjectIndex == 0){
    projectName.style.width = '100vw';
    projectName.style.left = '0';
    projectName.style.textAlign = 'center';
    rgaOffice.style.display =  'none';
    rgaCube.style.display = 'none';
  }

}

function removeProjectVideo(){
  var divToRemove = document.getElementById('projectVideoDiv');
  divToRemove.parentNode.removeChild(divToRemove);

  projectName.style.width = 'auto';
  projectName.style.left = '2.5vw';
  projectName.style.textAlign = 'left';
  rgaOffice.style.display =  ''
  rgaOffice.style.textAlign = 'right';
  rgaCube.style.display = '';

  // POSITION RGA CUBE BASED ON WIDTH OF RGA OFFICE


  // document.body.removeChild(projectVideoDiv);
}

function setProjectInformation(){
  projectName.innerHTML = projectTitles[currentProjectIndex];
  rgaOffice.innerHTML = projectOffice[currentProjectIndex];

  var newCubePosition = 0.015*viewWidth + $('#rgaOffice').width() + $('#rgaCube').width();
  $('#rgaCube').css('right', newCubePosition);

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

  console.log("NEXT ITEM!!");

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
    itemTimeout = projectVideoDiv.duration * 1000; // add 5 seconds to the timeout
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
  var remainingVideoTimeout = (projectVideoDiv.duration - projectVideoDiv.currentTime)*1000;
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
