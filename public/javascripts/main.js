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


var prototypeDisplayList = [];
var playlistList = [];
var currentPlaylist = 0;
var currentPlaylistIndex = 0;

// TIMEOUT VARIABLES

var reelTimeout = '';
var reelTimeoutTime = 10000;
var pausePlayTimeoutTime = 120000;
var playlistTimeout = '';
var transitionTimeout = '';
var playedPlaylistProjectCount = 0;

var imageTimeoutTime = 20000;
var videoTimeoutTime = 0;
var transitionTime = 1000;

//  SOCKET IO VARIABLES
var socket = io('http://sample-env-1.c8yskffcqp.us-east-1.elasticbeanstalk.com');  //'http://sample-env-1.c8yskffcqp.us-east-1.elasticbeanstalk.com/');


// DIVS

var projectDiv;
var projectVideoDiv;
var videoSource;
var projectName;
var projectInfoDiv;
var rgaOffice;
var rgaCube;
var transitionDiv;
var transitionInfoDiv;

(function(){

    socket.on('connect', function(){
      console.log("connected")
    });

    socket.on('frontEnd', function(data){
      console.log("FRONT EVENT");
    });

    socket.on('playReel', function(data){
      console.log(data);
      playReel();
    });

    socket.on('event', function(data){
      console.log("EVENT");
      console.log(data);

      $('body').css('background-color',data);
    });

    socket.on('project', function(data){
      console.log("project");
      console.log(data);

      clearAllTimeOuts()

      awsS3.matchProjectNameToIndex(projectTitles, data.toString(), function(projectFound, index){
        console.log(projectFound)
        if(projectFound == true){
          currentProjectIndex = index;
          showTransitionSlide();
          // setProjectInformation();

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

    socket.on('playPlayListAtIndex', function(data){

      console.log(data);

      clearAllTimeOuts();
      showTransitionSlide();

      currentProjectIndex = data.index;
      for(playlist in playlistList){
        console.log(playlist);
        if(playlistList[playlist].title == data.playlist){
          currentPlaylist = playlistList[playlist];

          // playlist timeout and variables
          setTimeout(function(){
            playedPlaylistProjectCount = 0;
            setProjectInformation();
            setPlaylistTimeout();
          },1000);
        }
      }
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
        checkVideoState();
      }
    });



    socket.on('disconnect', function(){
      console.log("disconnect")
    });

    // INIT PROGRAM

    awsS3.configure(function(){
      awsS3.getProjectFolders(function(data){
          awsS3.getDisplayList(function(displayList){
            awsS3.getInformationForAllProjects(displayList, data, function(s3ProjectTitles, s3RgaOffces, s3ProjectInformation, s3ProjectVideo, s3PrototypeProjects){



                projectFolders = data;
                projectTitles = s3ProjectTitles;
                projectOffice = s3RgaOffces;
                projectInformation = s3ProjectInformation;
                projectVideo = s3ProjectVideo;

                awsS3.getProjectURLS(data, projectVideo, s3PrototypeProjects, function(s3ProjectData,s3ProjectVideoURL, prototypeProjects){

                  projectData = s3ProjectData;
                  projectVideoURL = s3ProjectVideoURL;

                  prototypeDisplayList = s3PrototypeProjects;
                  console.log(prototypeDisplayList);

                  awsS3.getPlaylists(function(data){
                    playlistList = data;
                    awsS3.getProjectFromDisplayList(prototypeDisplayList, playlistList, function(newPlaylist){
                      playlistList = newPlaylist;
                      setTimeout(function(){
                        initPage();
                      }, 500);

                    });
                  });
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
  projectDiv.style.background = "url("+prototypeDisplayList[currentProjectIndex].imageURL+") no-repeat center";
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
  projectName.innerHTML = prototypeDisplayList[currentProjectIndex].title;
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
  rgaOffice.innerHTML = prototypeDisplayList[currentProjectIndex].office;
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
  // projectInfoDiv.appendChild(rgaCube);

  // var newCubePosition = 0.05*viewWidth + $('#rgaOffice').width() + $('#rgaCube').width();
  // console.log(newCubePosition)

  transitionDiv = document.createElement('div');
  transitionDiv.style.position = 'absolute';
  transitionDiv.id = "transitionDiv"
  transitionDiv.style.width = '100vw';
  transitionDiv.style.height = '100vh' //projectDivHeight + 'px';
  transitionDiv.style.top = 0;
  transitionDiv.style.zIndex = 200;
  transitionDiv.style.backgroundColor = 'black';
  document.body.appendChild(transitionDiv);

  transitionInfoDiv = document.createElement('div');
  transitionInfoDiv.id = 'transitionInfoDiv';
  transitionInfoDiv.style.height = '7.5vh';
  transitionInfoDiv.style.width = '100vw';
  transitionInfoDiv.style.bottom = '0';
  transitionInfoDiv.style.position = 'absolute';
  transitionInfoDiv.style.zIndex = 200;
  transitionInfoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  document.body.appendChild(transitionInfoDiv);

  $('#transitionDiv').fadeOut(0);
  $('#transitionInfoDiv').fadeOut(0);

  playReel();

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

  if(currentPlaylist != 0) {
    projectVideoDiv.poster = currentPlaylist.projects[currentProjectIndex].imageURL;
  }
  else{
    console.log("!")
  projectVideoDiv.poster = prototypeDisplayList[currentProjectIndex].imageURL;
  }
  document.body.appendChild(projectVideoDiv);

  videoSource = document.createElement("source");
  videoSource.type = "video/mp4";
  if(currentPlaylist != 0) {
    videoSource.src = currentPlaylist.projects[currentProjectIndex].videoURL;
  }
  else{
    videoSource.src = prototypeDisplayList[currentProjectIndex].videoURL;
  }
  projectVideoDiv.appendChild(videoSource);

  if(currentPlaylist == playlistList[0]){
    projectName.style.width = '100vw';
    projectName.style.left = '0';
    projectName.style.textAlign = 'center';
    rgaOffice.style.display =  'none';
    rgaCube.style.display = 'none';
    // projectVideoDiv.loop = true;
  }
  else{
    // projectVideoDiv.loop = false;
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

  if(currentPlaylist != 0) {
    projectName.innerHTML = currentPlaylist.projects[currentProjectIndex].title;
    rgaOffice.innerHTML =   setOfficeAttributedString();

    var newCubePosition = 0.015*viewWidth + $('#rgaOffice').width() + $('#rgaCube').width();
    $('#rgaCube').css('right', newCubePosition);

    console.log(currentPlaylist.projects[currentProjectIndex].video);

    if(document.getElementById('projectVideoDiv') != null){
      removeProjectVideo();
    }

    if(currentPlaylist.projects[currentProjectIndex].video == 'true'){
      console.log("!!");
      addProjectVideo();
      projectDiv.style.background = ''
    }
    else{
      projectDiv.style.background = "url("+currentPlaylist.projects[currentProjectIndex].imageURL+") no-repeat center";
    }
  }
  else{
    projectName.innerHTML = prototypeDisplayList[0].title;
    addProjectVideo();
  }

}

function setOfficeAttributedString(){

  var attributedString = currentPlaylist.projects[currentProjectIndex].office;
  attributedString = attributedString.replace('R/GA', '<span class="rga">R/GA</span>');

  if(attributedString.includes('+')){
    attributedString = attributedString.replace('+', '<span class="plus">+</span>');
  }
  console.log(attributedString);

  return attributedString;
}

// MARK:  TRANSITION FUNCTIONS

function showTransitionSlide(){

  clearTimeoutCalled(transitionTimeout);

  // transitionDiv.style.display = '';
  // transitionInfoDiv.style.display = '';
  $('#transitionDiv').fadeIn(transitionTime);
  $('#transitionInfoDiv').fadeIn(transitionTime);

  transitionTimeout = setTimeout(function(){
    $('#transitionDiv').fadeOut(500);
    $('#transitionInfoDiv').fadeOut(500);
    setProjectInformation();
  }, transitionTime);
}

// MARK: PLAYLIST TIMEOUT FUNCTIONS

function nextItemOnPlaylist(){

  console.log("NEXT ITEM!!");

  // INCREMENT PROJECTCOUNT

  playedPlaylistProjectCount += 1;
  currentProjectIndex += 1;


  if(playedPlaylistProjectCount < (currentPlaylist.projects.length)){


    if(currentProjectIndex > (currentPlaylist.projects.length - 1)){
      currentProjectIndex = 0;
    }
    showTransitionSlide();
    // setProjectInformation();

    socket.emit("switchPlaylistProject", currentProjectIndex);

    var newPlaylistTimeoutTime = transitionTime + 500;
    setTimeout(function(){
      setPlaylistTimeout();
    }, newPlaylistTimeoutTime);

  }
  else{
    console.log("SETTING REEL TIMEOUT");
    resetReelTimeout();
  }
}

function setPlaylistTimeout(){

  console.log("SETTING");

  // CLEAR THE TIMEOUT IF IT EXISTS.

  clearTimeoutCalled(playlistTimeout);

  // DETERMINE PLAYLIST TIMEOUT;

  var itemTimeout = 0;

  if(currentPlaylist.projects[currentProjectIndex].video == 'true'){
    console.log("!");
    checkVideoState();
    // itemTimeout = projectVideoDiv.duration * 1000; // add 5 seconds to the timeout
  }
  else{
    itemTimeout = imageTimeoutTime;
    playlistTimeout = setTimeout(function(){
      console.log("COUNT " + playedPlaylistProjectCount)
      nextItemOnPlaylist();
      console.log("TIMEOUT " + itemTimeout);
    }, itemTimeout);
  }


}

function clearTimeoutCalled(timeoutName){
  if(timeoutName != ''){
    clearTimeout(timeoutName);
  }
}

function clearAllTimeOuts(){
  clearTimeout(reelTimeout);
  clearTimeout(playlistTimeout);
  clearTimeout(transitionTimeout);
}

// MARK: PAUSE/PLAY TIMEOUT FUNCTIONS

function pauseVideoTimeout(){
  clearTimeoutCalled(playlistTimeout);
  setPausePlayReturnToReelTimeout();
  console.log("PAUSE");

}

function restartVideoTimeout(){
  clearTimeoutCalled(reelTimeout);

  // DETERMINE REMAINING TIME LEFT OF VIDEO AND SUBTRACT IT FROM THE TOTAL AND ADD 4.5 SECONDS.
  console.log("PLAY");
  var remainingVideoTimeout = (projectVideoDiv.duration - projectVideoDiv.currentTime)*1000;
  console.log(remainingVideoTimeout)
  playlistTimeout = setTimeout(function(){
    nextItemOnPlaylist();
  }, remainingVideoTimeout);
}

// MARK: REEL TIMEOUT FUNCTIONS

function resetReelTimeout(){
  clearTimeoutCalled(reelTimeout);
  setReturnToReelTimeout();

}

function setPausePlayReturnToReelTimeout(){
    reelTimeout = setTimeout(function(){
      socket.emit("playReel", currentProjectIndex);
    }, pausePlayTimeoutTime);
}

function setReturnToReelTimeout(){
    reelTimeout = setTimeout(function(){
      socket.emit("playReel", currentProjectIndex);
    }, reelTimeoutTime);
}

function playReel(){
  console.log("PLAY REEL");
  currentProjectIndex = 0;
  playedPlaylistProjectCount = 0;
  currentPlaylist = playlistList[0];
  setProjectInformation();
  setPlaylistTimeout();
}

// MARK: VIDEO FUNCTIONS

function checkVideoState(){
  if(projectVideoDiv.readyState == 4){
    restartVideoTimeout()
  }
  else{
    setTimeout(function(){
      checkVideoState();
    }, 50);
  }
}




// GRAVEYARD
function setProjectInformationOLD(){

  projectName.innerHTML = currentPlaylist.projects[currentProjectIndex].title;
  rgaOffice.innerHTML =   setOfficeAttributedString();

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

function addProjectVideoOLD(){

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
    projectVideoDiv.loop = true;
  }
  else{
    projectVideoDiv.loop = false;
  }

}


function setPlaylistTimeoutOLD(){

  // CLEAR THE TIMEOUT IF IT EXISTS.

  clearTimeoutCalled(playlistTimeout);

  // DETERMINE PLAYLIST TIMEOUT;

  var itemTimeout = 0;

  if(projectVideo[currentProjectIndex] == 'true'){
    checkVideoState();
    // itemTimeout = projectVideoDiv.duration * 1000; // add 5 seconds to the timeout
  }
  else{
    itemTimeout = imageTimeoutTime;
    playlistTimeout = setTimeout(function(){
      console.log("COUNT " + playedPlaylistProjectCount)
      nextItemOnPlaylist();
    }, itemTimeout);
  }

  console.log("TIMEOUT " + itemTimeout);

}
