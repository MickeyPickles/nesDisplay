// SIZE VARIABLES

var viewHeight = window.innerHeight;
var viewWidth = window.innerWidth;

var projectDivHeight = 0.9*viewHeight - 0.025*viewWidth;

var infoDivHeight = 0.1*viewHeight - 0.025*viewWidth;

// S3 VARIABLES
// NOTE: GO TO S3.JS TO SEE ALL THE FUNCTIONS

var awsS3 = new awsS3;

//*****************************************  PROJECT VARIABLES *************************************** //

// PROJECT FOLDERS: A VARIABLE USED TO VISUALISE THE PROJECT FOLDERS ON AWS
var projectFolders = [];
 // PROTOTYPE DISPLAY LIST: A VARIABLE TO CAPTURE ALL THE 'prototypeDisplayProject' THAT COULD BE SHOWN. NOTE: GO TO S3.JS FOR MORE.
var prototypeDisplayList = [];
//  PLAYLIST DISPLAY LIST: A VARIABLE TO CAPTURE ALL THE 'prototypeDisplayList' THAT COULD BE SHOWN. NOTE: GO TO S3.JS FOR MORE.
var playlistList = [];

// PARAMETERS USED TO TRACK CURRENT PLAYLIST & PROJECT INDEX WITHIN THE PLAYLIST
var currentPlaylist = 0;
var currentProjectIndex = 0;
var playedPlaylistProjectCount = 0;

var singleProject = 0


//***************************************** TIMEOUT VARIABLES *************************************** //

// REEL TIMEOUT - USED TO LET THE DISPLAY KNOW WHEN TO GO BACK TO THE REEL.
var reelTimeout = '';
// PLAYLIST TIMEOUT - USED TO LET THE DISPLAY KNOW WHEN TO SWITCH TO THE NEXT PROJECT.
var playlistTimeout = '';
// PLAYLIST TIMEOUT - USED TO EASE THE TRANSITION BETWEEN PROJECTS
var transitionTimeout = '';

// VARIABLES INDICATING THE SPECIFIC TIMES THAT EACH TIMEOUT SHOULD TAKE.
var reelTimeoutTime = 3000;        // TIME AFTER A COMPLETE PLAYLIST BEFORE RETURNING TO THE REEL
var pausePlayTimeoutTime = 120000;  // TIME AFTER A PAUSE BEFORE RETURNING TO THE REEL

var imageTimeoutTime = 20000;       // TIME AN IMAGE SHOULD BE SHOWN BEFORE GOING TO THE NEXT PROJECT / REEL
var videoTimeoutTime = 0;           // VARIABLE USED TO CALCULATE THE VIDEO TIMEOUT TIME.
var transitionTime = 1000;          // TRANSITION TIME BETWEEN PROJECTS.

//***************************************** SOCKET IO VARIABLES *************************************** //

var socket = io('localhost:5000');  // THE STRING IS THE WEBPAGE THAT WE ARE USING. http://sample-env-1.c8yskffcqp.us-east-1.elasticbeanstalk.com/


//***************************************** FRONT END DISPLAY ELEMENTS *************************************** //

var projectDiv;                   // USED TO SHOW THE PROJECT IF IMAGE (NO VIDEO)
var projectVideoDiv;              // USED TO SHOW THE PROJECT IF VIDEO
var videoSource;                  // USED TO TELL THE DISPLAY WHAT THE VIDEO SOURCE IS
var projectName;                  // USED TO LAYOUT THE PROJECT NAME
var projectInfoDiv;               // USED TO LAYOUT THE PROJECT INFORMATION (OFFICE AND NAME)
var rgaOffice;                    // USED TO LAYOUT THE PROJECT OFFICE NAME
var rgaCube;                      // USED TO LAYOUT THE R/GA CUBE    NOTE: THIS IS NO LONGER IN USE.
var transitionDiv;                // USED AS A DIV TO EASE THE TRANSITION WHILST MATCHING THE DESIGN
var transitionInfoDiv;            // USED AS A WHITE BAR DIV TO EASE THE TRANSITION WHILST MATCHING THE DESIGN

//**************************************************************************************************** //
//***************************************** ON LOAD FUNCTIONALITY ************************************ //
//**************************************************************************************************** //


(function(){


//***************************************** SOCKET FUNCTIONS *************************************** //

  // FUNCTIONS / COMMANDS THAT ARE CALLED UPON RECIEVING A SIGNAL

  /* NOTE: SAMPLE SOCKET IO MESSAGE:
    @Params: messageName: The name of the event which is recieved by the backend
    @Params: messageData: The data that is recieved from the SocketIO message.

    socket.on(messageName, function(messageData){

    });

  */

    /*
    SOCKET IO COMMAND: 'connect'

    USE: TO LET THE USER (YOU) KNOW WHEN YOU HAVE CONNECTED

    SENDER: N/A
    */

    socket.on('connect', function(){
      console.log("connected")
    });


    /*
    SOCKET IO COMMAND: 'playReel'

    USE: USED TO LET THE DISPLAY KNOW WHEN TO PLAY THE REEL

    SENDER: IPAD / DISPLAY
    */

    socket.on('playReel', function(data){
      console.log(data);
      playReel();
    });

    /*
    SOCKET IO COMMAND: 'project'

    USE: USED TO LET THE DISPLAY KNOW THAT THEY HAVE TO PLAY A SINGLE PROJECT.

    NOTE: THIS COMMAND IS CURRENTLY NOT IN USE AS WE ARE USING PLAYLISTS EXCLUSIVELY
    BUT WILL NEED TO BE INTEGRATED IN THE FUTURE TO ALLOW FOR SPECIFIC PROEJCTS TO
    BE PLAYED.

    NOTE: IT NEEDS TO BE REDONE TO MATCH THE EXISTING ARCHITECTURE.
    SENDER: IPAD
    */

    socket.on('project', function(data){
      console.log("project");
      console.log(data);

      clearAllTimeOuts()    // CLEAR ALL TIMEOUTS

      for(i=0; i<prototypeDisplayList.length; i++){
        console.log("Checking");
        console.log(prototypeDisplayList[i].title)
        if(prototypeDisplayList[i].title == data){
            console.log("Found");
            singleProject = prototypeDisplayList[i];
            showTransitionSlide();
            setTimeout(function(){
              playedPlaylistProjectCount = 0;   // SET THE PLAYLIST PROJECT COUNT TO 0, TO ALLOW THE PLAYLIST TO LOOP
              setSingleProjectInformation();          // SET THE PROJECT INFORMATION FOR RELEVANT PLAYLIST PROJECT
              setSingleProjectTimeout();             // SET THE PLAYLIST TIMEOUT
            },1000);
            break;
        }
      }

    });

    /*
    SOCKET IO COMMAND: 'playPlayListAtIndex'

    USE: TO LET THE DISPLAY KNOW TO PLAY A PROJECT AT A SPECIFIC INDEX.

    SENDER: IPAD
    */

    socket.on('playPlayListAtIndex', function(data){

      console.log(data);

      clearAllTimeOuts();       // CLEAR ALL TIMEOUTS
      showTransitionSlide();    // SHOW TRANSITION SLIDE

      currentProjectIndex = data.index; // SET THE PROJECT INDEX TO MATCH THE PLAYLIST
      for(playlist in playlistList){
        console.log(playlist);
        if(playlistList[playlist].title == data.playlist){  // MATCH THE PLAYLIST TO THE IPAD PLAYLIST
          currentPlaylist = playlistList[playlist];         // SET CURRENT PLAYLIST TO THE MATCHED PLAYLIST

          // SET TIMEOUT TO ALLOW THE TRANSITION SLIDE TO PLAY
          setTimeout(function(){
            playedPlaylistProjectCount = 0;   // SET THE PLAYLIST PROJECT COUNT TO 0, TO ALLOW THE PLAYLIST TO LOOP
            setProjectInformation();          // SET THE PROJECT INFORMATION FOR RELEVANT PLAYLIST PROJECT
            setPlaylistTimeout();             // SET THE PLAYLIST TIMEOUT
          },1000);
        }
      }
    });

    /*
    SOCKET IO COMMAND: 'video'

    USE: TO LET THE DISPLAY KNOW WHEN TO PAUSE OR PLAY A VIDEO

    SENDER: IPAD
    */

    socket.on('video', function(data){
      console.log("video");
      console.log(data);

      if(data == "pauseVideo"){
        // PAUSE
        projectVideoDiv.pause();    // PAUSE THE VIDEO
        pauseVideoTimeout();        // SET PAUSE TIMEOUT TO RESET TO REEL IF NECCESARY

      }
      else{
        // PLAY
        projectVideoDiv.play();     // PLAY VIDEO
        checkVideoState();          // RESET THE VIDEO TIMEOUT TO ALLOW PLAYLIST TO LOOP
      }
    });



    socket.on('disconnect', function(){
      console.log("disconnect")
    });


//***************************************** AWS SETUP *************************************** //

    // NOTE: GO TO S3.JS FOR FULL DOCUMMENTATION

    awsS3.configure(function(){
      awsS3.getProjectFolders(function(data){
          awsS3.getDisplayList(function(displayList){
            awsS3.getInformationForAllProjects(displayList, data, function(s3PrototypeProjects){

                // SET PROJECT FOLDERS TO DATA FROM @FUNCTION: AWSS3.GETPROJECTFOLDERS.
                projectFolders = data;
                // SET DISPLAYLIST TO S3PROTOTYPEPROJECTS FROM  @FUNCTION AWSS3.GETINFORMATIONFROMALLPROJECTS
                prototypeDisplayList = s3PrototypeProjects;

                  awsS3.getPlaylists(function(data){
                    awsS3.getProjectFromDisplayList(prototypeDisplayList, data, function(awsplaylist){
                      // SET PLAYLIST LIST TO DATA FROM  @FUNCTION AWSS3.GETPROJECTSFROMDISPLAYLIST
                      playlistList = awsplaylist;
                      setTimeout(function(){
                        initPage();     // INITIALISE THE DISPLAY AFTER A DELAY TO ENSURE LOADING.
                      }, 500);

                    });
                  });
            });
        });
      })
    });
})();

//**************************************************************************************************** //
//***************************************** INTIIAL PAGE SETUP *************************************** //
//**************************************************************************************************** //

/*
  @Function: InitPage
  A FUNCTION THAT SETS UP THE PAGE DIVS WITH THE RELEVANT DIMENSIONS.
  NOTE: MISSING CSS IS IN main.css
*/
function initPage(){

  // CREATION AND STYLING FOR THE PROJECT DIV THAT SHOWS THE IMAGE
  projectDiv = document.createElement('div');
  projectDiv.style.position = 'absolute';
  projectDiv.id = "projectDiv"
  projectDiv.style.width = '100vw';
  projectDiv.style.height = '100vh' //projectDivHeight + 'px';
  projectDiv.style.top = 0;
  projectDiv.style.background = "url("+prototypeDisplayList[currentProjectIndex].imageURL+") no-repeat center";
  document.body.appendChild(projectDiv);

  // CREATION AND STYLING FOR THE DIV THAT HOLDS ALL THE PROJECT INFORMATION
  projectInfoDiv = document.createElement('div');
  projectInfoDiv.id = 'projectInfoDiv';
  projectInfoDiv.style.height = '7.5vh';
  projectInfoDiv.style.width = '100vw';
  projectInfoDiv.style.bottom = '0';
  projectInfoDiv.style.position = 'absolute';
  projectInfoDiv.style.zIndex = 120;
  projectInfoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  document.body.appendChild(projectInfoDiv);

  // CREATION AND STYLING FOR THE DIV THAT HOLDS THE PROJECT NAME
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

  // CREATION AND STYLING FOR THE DIV THAT HOLDS THE R/GA OFFICE
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

  // CREATION AND STYLING FOR THE DIV THAT HOLDS THE R/GA LOGO
  rgaCube = document.createElement('div');
  rgaCube.id = "rgaCube";
  rgaCube.style.width = '3.5vh';
  rgaCube.style.height = '3.5vh';
  rgaCube.style.backgroundColor = 'rgba(232, 16, 48, 1)';
  rgaCube.style.position = 'absolute';
  rgaCube.style.bottom = '2vh';
  rgaCube.style.zIndex = 120;
  rgaCube.style.display = 'none';

  // CREATION AND STYLING FOR THE DIV THAT ACHIEVES THE TRANSITION
  transitionDiv = document.createElement('div');
  transitionDiv.style.position = 'absolute';
  transitionDiv.id = "transitionDiv"
  transitionDiv.style.width = '100vw';
  transitionDiv.style.height = '100vh' //projectDivHeight + 'px';
  transitionDiv.style.top = 0;
  transitionDiv.style.zIndex = 200;
  transitionDiv.style.backgroundColor = 'black';
  document.body.appendChild(transitionDiv);

  // CREATION AND STYLING FOR THE DIV THAT HOLDS WHITE BAR OF THE TRANSITION DIV
  transitionInfoDiv = document.createElement('div');
  transitionInfoDiv.id = 'transitionInfoDiv';
  transitionInfoDiv.style.height = '7.5vh';
  transitionInfoDiv.style.width = '100vw';
  transitionInfoDiv.style.bottom = '0';
  transitionInfoDiv.style.position = 'absolute';
  transitionInfoDiv.style.zIndex = 200;
  transitionInfoDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
  document.body.appendChild(transitionInfoDiv);

  // FADE OUT THE TRANSITION DIV TO ALLOW TRANSITIONS TO OCCUR
  $('#transitionDiv').fadeOut(0);
  $('#transitionInfoDiv').fadeOut(0);

  // PLAY THE REEL.
  playReel();

}

//**************************************************************************************************** //
//********************************** PROJECT INFORMATION FUNCTIONS *********************************** //
//**************************************************************************************************** //

/*
  @Function: playReel
  A FUNCTION THAT TELLS THE DISPLAY TO PLAY THE REEL
*/

function playReel(){
  console.log("PLAY REEL");
  clearAllTimeOuts();
  currentProjectIndex = 0;          // SET THE CURRENT PROJECT INDEX TO 0
  playedPlaylistProjectCount = 0;   // SET THE CURRENT PLAYLIST COUNT TO 0
  currentPlaylist = playlistList[0];  // SET THE CURRENT PLAYLIST TO THE REEL PLAYLIST
  setProjectInformation();            // SET THE PROJECT INFORMATION
  setPlaylistTimeout();               // SET THE PLAYLIST TIMEOUT
}

/*
  @Function: setProjectInformation
  A FUNCTION THAT SETS THE PROJECT INFORMATION ON THE DISPLAY
*/

function setProjectInformation(){

  // NOTE: THE CURRENT PLAYLIST SHOULD ALWAYS BE SET.
  if(currentPlaylist != 0) {
    projectName.innerHTML = currentPlaylist.projects[currentProjectIndex].title;    // SET THE TITLE BASED ON THE RELEVANT PROJECT AND PLAYLIST
    rgaOffice.innerHTML =   setOfficeAttributedString(); // STYLIZE THE OFFICE STRING

    // SET THE NEW LOGO POSITION. NOTE: THIS IS NO LONGER IMPLEMENTED
    var newCubePosition = 0.015*viewWidth + $('#rgaOffice').width() + $('#rgaCube').width();
    $('#rgaCube').css('right', newCubePosition);

    console.log(currentPlaylist.projects[currentProjectIndex].video);

    // REMOVE THE PROJECT DIV TO ENSURE THAT THE VIDEO RESETS CORRECTLY, EVEN IF ITS REPLAYING THE RIGHT VIDEO.
    if(document.getElementById('projectVideoDiv') != null){
      removeProjectVideo();
    }

    // ADD A PROJECT VIDEO DIV IF VIDEO IS REQUIRED
    if(currentPlaylist.projects[currentProjectIndex].video == 'true'){
      addProjectVideo();
      projectDiv.style.background = ''
    }
    else{
      projectDiv.style.background = "url("+currentPlaylist.projects[currentProjectIndex].imageURL+") no-repeat center";
    }
  }
  // SET THE REEL TO PLAY
  else{
    projectName.innerHTML = prototypeDisplayList[0].title;
    addProjectVideo();
  }

}

/*
  @Function: checkVideoState
  A FUNCTION THAT WAITS UNTIL THE VIDEO LOADS BEFORE SETTING THE VIDEO TIMEOUT
*/


function checkVideoState(){
  // CHECK IF VIDEO IS LOADING
  if(projectVideoDiv.readyState == 4){
    restartVideoTimeout()   // SET THE VIDEO TIMEOUT
  }
  // SET A TIMEOUT OF 50MS AND TRY AGAIN.
  else{
    setTimeout(function(){
      checkVideoState();
    }, 50);
  }
}

/*
  @Function: setOfficeAttributedString
  A FUNCTION THAT STYLIZES THE OFFICE STRING
  @return {String} - returns an attributed office string.
*/

function setOfficeAttributedString(){

  // STYLIZE R/GA
  var attributedString = currentPlaylist.projects[currentProjectIndex].office;
  attributedString = attributedString.replace('R/GA', '<span class="rga">R/GA</span>');

  // STYLIZE A PLUS IF IT EXISTS.
  if(attributedString.includes('+')){
    attributedString = attributedString.replace('+', '<span class="plus">+</span>');
  }

  return attributedString;
}

//**************************************************************************************************** //
//**************************************** VIDEO FUNCTIONALITY *************************************** //
//**************************************************************************************************** //

/*
  @Function: addProjectVideo
  A FUNCTION THAT ADDS A VIDEO DIV WITH THE CORRECT PROJECT VIDEO AND POSTER IMAGE
*/

function addProjectVideo(){

  // ADD THE STYLIZED VIDEO DIV TO THE DISPLAY
  projectVideoDiv = document.createElement('video');
  projectVideoDiv.style.position = 'absolute';
  projectVideoDiv.id = "projectVideoDiv"
  projectVideoDiv.style.width = '100vw';
  projectVideoDiv.style.height = '100vh'   //projectDivHeight + 'px';
  projectVideoDiv.style.top = 0;
  projectVideoDiv.style.left = 0;
  projectVideoDiv.style.zIndex = 100;
  projectVideoDiv.autoplay = true;

  // CHECK IF THE PLAYLIST EXISTS AND ADD THE RELEVANT POSTER IMAGE
  if(currentPlaylist != 0) {
    projectVideoDiv.poster = currentPlaylist.projects[currentProjectIndex].imageURL;
  }
  else{
    console.log("!")
  projectVideoDiv.poster = prototypeDisplayList[currentProjectIndex].imageURL;
  }
  document.body.appendChild(projectVideoDiv);


  // CREATE A VIDEO SOURCE AND ADD THE RELEVANT VIDEO.
  videoSource = document.createElement("source");
  videoSource.type = "video/mp4";
  if(currentPlaylist != 0) {
    videoSource.src = currentPlaylist.projects[currentProjectIndex].videoURL;
  }
  else{
    videoSource.src = prototypeDisplayList[currentProjectIndex].videoURL;
  }
  projectVideoDiv.appendChild(videoSource);

  // IF ITS THE REEL, STYLIZE THE INFO BAR TO BE FULL WIDTH.

  if(currentPlaylist == playlistList[0]){
    projectName.style.width = '100vw';
    projectName.style.left = '0';
    projectName.style.textAlign = 'center';
    rgaOffice.style.display =  'none';
    rgaCube.style.display = 'none';
    // projectVideoDiv.loop = true;
  }
  else{
    // DO NOTHING
  }
}

/*
  @Function: removeProjectVideo
  A FUNCTION THAT REMOVES THE VIDEO DIV TO ENSURE THE VIDEO RESETS PROPERLY AND STLYLIZES THE BAR TO SHOW THE RIGHT INFORMATION.
*/

function removeProjectVideo(){
  var divToRemove = document.getElementById('projectVideoDiv');
  divToRemove.parentNode.removeChild(divToRemove);

  projectName.style.width = 'auto';
  projectName.style.left = '2.5vw';
  projectName.style.textAlign = 'left';
  rgaOffice.style.display =  ''
  rgaOffice.style.textAlign = 'right';
  rgaCube.style.display = '';
}

//**************************************************************************************************** //
//*********************************** TRANSITION FUNCTIONALITY *************************************** //
//**************************************************************************************************** //

/*
  @Function: showTransitionSlide
  A FUNCTION THAT FADES THE TRANSITION SLIDE IN AND OUT TO ALLOW A SMOOTH TRANSITION BETWEEN ELEMENTS
*/

function showTransitionSlide(){

  clearTimeoutCalled(transitionTimeout); // CLEAR TRANSITION TIMEOUT

  // FADE TRANSITION SLIDE IN
  $('#transitionDiv').fadeIn(transitionTime);
  $('#transitionInfoDiv').fadeIn(transitionTime);


  // SET TRANSITION TIMEOUT TO FADE TRANSITION IN.
  transitionTimeout = setTimeout(function(){
    $('#transitionDiv').fadeOut(500);
    $('#transitionInfoDiv').fadeOut(500);
    setProjectInformation();
  }, transitionTime);
}

//**************************************************************************************************** //
//*********************************** PLAYLIST FUNCTIONALITY *************************************** //
//**************************************************************************************************** //

/*
  @Function: nextItemOnPlaylist
  A FUNCTION THAT TELLS THE IPAD AND DISPLAY TO PLAY THE NEXT ITEM IN THE PLAYLIST
*/

function nextItemOnPlaylist(){

  console.log("NEXT ITEM!!");

  // INCREMENT PROJECTCOUNT

  playedPlaylistProjectCount += 1;
  currentProjectIndex += 1;

  // CHECK IF WHOLE PLAYLIST HAS BEEN PLAYED.
  if(playedPlaylistProjectCount < (currentPlaylist.projects.length)){

    // CHECK IF THE PLAYLIST ARRAY NEEDS TO LOOP
    if(currentProjectIndex > (currentPlaylist.projects.length - 1)){
      currentProjectIndex = 0;
    }

    // SHOW THE TRANSITION SLIDE
    showTransitionSlide();

    // TELL THE IPAD TO SWITCH PROJECT
    socket.emit("switchPlaylistProject", currentProjectIndex);

    // SET A TIMEOUT THAT TELLS THE PROJECT TO SET THE PLAYLIST TIMEUT
    var newPlaylistTimeoutTime = transitionTime + 500;
    setTimeout(function(){
      setPlaylistTimeout();
    }, newPlaylistTimeoutTime);

  }
  //IF WHOLE PLAYLIST HAS BEEN PLAYED, RESET TO THE REEL AFTER A TIMEOUT.
  else{
    console.log("SETTING REEL TIMEOUT");
    resetReelTimeout();
  }
}

/*
  @Function: setPlaylistTimeout
  A FUNCTION THAT SETS THE NEXT PLAYLIST TIMEOUT
*/

function setPlaylistTimeout(){

  console.log("SETTING");

  // CLEAR THE TIMEOUT IF IT EXISTS.

  clearTimeoutCalled(playlistTimeout);

  // DETERMINE PLAYLIST TIMEOUT;

  var itemTimeout = 0;

  // CHECK IF A VIDEO EXISTS AND IF SO, SET THE TIMEOUT AFTER ITS LOADED.
  if(currentPlaylist.projects[currentProjectIndex].video == 'true'){
    console.log("!");
    checkVideoState();
  }
  // IF NOT, SET THE IMAGE TIMEOUT AND CALL THE NEXT ITEM ON PLAYLIST AFTER THE TIMEOUT.
  else{
    itemTimeout = imageTimeoutTime;
    playlistTimeout = setTimeout(function(){
      console.log("COUNT " + playedPlaylistProjectCount)
      nextItemOnPlaylist();
      console.log("TIMEOUT " + itemTimeout);
    }, itemTimeout);
  }


}

//**************************************************************************************************** //
//******************************* SINGLE PROJECT FUNCTIONALITY *************************************** //
//**************************************************************************************************** //

function setSingleProjectInformation(){

  // NOTE: THE CURRENT PLAYLIST SHOULD ALWAYS BE SET.
    projectName.innerHTML = singleProject.title;    // SET THE TITLE BASED ON THE RELEVANT PROJECT AND PLAYLIST
    rgaOffice.innerHTML =   setSingleProjectOfficeAttributedString(); // STYLIZE THE OFFICE STRING


    // REMOVE THE PROJECT DIV TO ENSURE THAT THE VIDEO RESETS CORRECTLY, EVEN IF ITS REPLAYING THE RIGHT VIDEO.
    if(document.getElementById('projectVideoDiv') != null){
      removeProjectVideo();
    }

    // ADD A PROJECT VIDEO DIV IF VIDEO IS REQUIRED
    if(singleProject.video == 'true'){
      addSingleProjectVideo();
      projectDiv.style.background = ''
    }
    else{
      projectDiv.style.background = "url("+singleProject.imageURL+") no-repeat center";
    }
}

function setSingleProjectOfficeAttributedString(){
  console.log("SINGLE PROJECT ATT STRING");
  // STYLIZE R/GA
  var attributedString = singleProject.office;
  attributedString = attributedString.replace('R/GA', '<span class="rga">R/GA</span>');

  // STYLIZE A PLUS IF IT EXISTS.
  if(attributedString.includes('+')){
    attributedString = attributedString.replace('+', '<span class="plus">+</span>');
  }

  return attributedString;
}

function addSingleProjectVideo(){

  console.log("Single Project Video");

  // ADD THE STYLIZED VIDEO DIV TO THE DISPLAY
  projectVideoDiv = document.createElement('video');
  projectVideoDiv.style.position = 'absolute';
  projectVideoDiv.id = "projectVideoDiv"
  projectVideoDiv.style.width = '100vw';
  projectVideoDiv.style.height = '100vh'   //projectDivHeight + 'px';
  projectVideoDiv.style.top = 0;
  projectVideoDiv.style.left = 0;
  projectVideoDiv.style.zIndex = 100;
  projectVideoDiv.autoplay = true;

  projectVideoDiv.poster = singleProject.imageURL;

  document.body.appendChild(projectVideoDiv);


  // CREATE A VIDEO SOURCE AND ADD THE RELEVANT VIDEO.
  videoSource = document.createElement("source");
  videoSource.type = "video/mp4";
  if(currentPlaylist != 0) {
    videoSource.src = singleProject.videoURL;
  }
  else{
    videoSource.src = singleProject.videoURL;
  }
  projectVideoDiv.appendChild(videoSource);

  projectName.style.width = 'auto';
  projectName.style.left = '2.5vw';
  projectName.style.textAlign = 'left';
  rgaOffice.style.display =  ''
  rgaOffice.style.textAlign = 'right';
  rgaCube.style.display = '';
  setSingleProjectTimeout();
}

function setSingleProjectTimeout(){

  console.log("SETTING");

  // CLEAR THE TIMEOUT IF IT EXISTS.

  clearTimeout(playlistTimeout);

  // DETERMINE PLAYLIST TIMEOUT;

  var itemTimeout = 0;

  // CHECK IF A VIDEO EXISTS AND IF SO, SET THE TIMEOUT AFTER ITS LOADED.
  if(singleProject.video == 'true'){
    console.log("!");
    checkSingleVideoState();
  }
  // IF NOT, SET THE IMAGE TIMEOUT AND CALL THE NEXT ITEM ON PLAYLIST AFTER THE TIMEOUT.
  else{
    itemTimeout = imageTimeoutTime;
    playlistTimeout = setTimeout(function(){
      resetReelTimeout();
    }, itemTimeout);
  }

}

function checkSingleVideoState(){
  // CHECK IF VIDEO IS LOADING
  if(projectVideoDiv.readyState == 4){
    restartSingleVideoTimeout()   // SET THE VIDEO TIMEOUT
  }
  // SET A TIMEOUT OF 50MS AND TRY AGAIN.
  else{
    setTimeout(function(){
      checkSingleVideoState();
    }, 50);
  }
}

function restartSingleVideoTimeout(){
  clearTimeoutCalled(reelTimeout);

  // DETERMINE REMAINING TIME LEFT OF VIDEO AND SUBTRACT IT FROM THE TOTAL
  var remainingVideoTimeout = (projectVideoDiv.duration - projectVideoDiv.currentTime)*1000;
  console.log(remainingVideoTimeout)
  // SET NEW TIMEOUT
  playlistTimeout = setTimeout(function(){
    resetReelTimeout();
  }, remainingVideoTimeout);
}


//**************************************************************************************************** //
//************************************** TIMEOUT FUNCTIONALITY *************************************** //
//**************************************************************************************************** //

/*
  @Function: clearTimeoutCalled
  A FUNCTION THAT CLEARS A TIMEOUT OF NAME
  @Param: TIMEOUT NAME
*/


function clearTimeoutCalled(timeoutName){
  if(timeoutName != ''){
    clearTimeout(timeoutName);
  }
}

/*
  @Function: clearAllTimeOuts
  A FUNCTION THAT CLEARS ALL TIMEOUTS
*/

function clearAllTimeOuts(){
  clearTimeout(reelTimeout);
  clearTimeout(playlistTimeout);
  clearTimeout(transitionTimeout);
}

/*
  @Function: pauseVideoTimeout
  A FUNCTION THAT CALLS THE RELEVANT ACTIONS TO SET THE PAUSE TIMEOUT
*/

function pauseVideoTimeout(){
  clearTimeoutCalled(playlistTimeout);
  setPausePlayReturnToReelTimeout();
  console.log("PAUSE");

}

/*
  @Function: setPausePlayReturnToReelTimeout
  A FUNCTION THAT SETS THE PAUSE TIMEOUT TO MAKE SURE THAT IT RETURNS TO THE REEL IF ENOUGH TIME PASSES
*/

function setPausePlayReturnToReelTimeout(){
    reelTimeout = setTimeout(function(){
      socket.emit("playReel", currentProjectIndex);
    }, pausePlayTimeoutTime);
}


/*
  @Function: restartVideoTimeout
  A FUNCTION THAT SETS THE NEW VIDEO TIMEOUT, IF THE VIDEO GOES FROM PAUSE TO PLAY
*/

function restartVideoTimeout(){
  clearTimeoutCalled(reelTimeout);

  // DETERMINE REMAINING TIME LEFT OF VIDEO AND SUBTRACT IT FROM THE TOTAL
  var remainingVideoTimeout = (projectVideoDiv.duration - projectVideoDiv.currentTime)*1000;
  console.log(remainingVideoTimeout)
  // SET NEW TIMEOUT
  playlistTimeout = setTimeout(function(){
    nextItemOnPlaylist();
  }, remainingVideoTimeout);
}

/*
  @Function: resetReelTimeout
  A FUNCTION THAT SETS SETS ACTIONS REQUIRED TO RETURN TO THE REEL AFTER A TIMEOUT
*/

function resetReelTimeout(){
  clearTimeoutCalled(reelTimeout);
  setReturnToReelTimeout();

}

/*
  @Function: resetReelTimeout
  A FUNCTION THAT SETS SETS THE TIMEOUT TO RETURN TO THE REEL
*/

function setReturnToReelTimeout(){
    reelTimeout = setTimeout(function(){
      socket.emit("playReel", currentProjectIndex);
    }, reelTimeoutTime);
}
