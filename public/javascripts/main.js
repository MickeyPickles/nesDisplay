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

// DIVS

var projectDiv;
var projectVideoDiv;
var videoSource;
var projectName;
var clientName;
var rgaOffice;

// PROTOVARIABLES



var imageURL = "http://oscardelahera.com/_images/Solace/SolaceHero3By2.jpg";
// var videoURL = 'https://s3.amazonaws.com/prototypedisplay/test.mp4';
var gifURL = 'http://oscardelahera.com/_images/Illusion/anim.gif';

(function(){

    var socket = io('http://localhost:5000');
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

      awsS3.matchProjectNameToIndex(projectTitles, data.toString(), function(projectFound, index){
        console.log(projectFound)
        if(projectFound == true){
          currentProjectIndex = index;
          setProjectInformation();
        }
        else{
          // PROJECT NOT FOUND
        }
      });
    });

    socket.on('video', function(data){
      console.log("video");
      console.log(data);

      if(data == "pauseVideo"){
        // PAUSE
        projectVideoDiv.pause();

      }
      else{
        // PLAY
        projectVideoDiv.play();
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
              console.log("!!")
              console.log(s3ProjectVideo);
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
    // getProjectFolders();
    // addVideoDiv();



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
    projectVideoDiv.poster = projectData[currentProjectIndex];
    projectDiv.style.background = '';
    // videoSource.src = projectVideoURL[currentProjectIndex];
    // videoSource.load()
    // projectVideoDiv.play();
    // projectVideoDiv.style.display = '';
  }
  else{
    projectDiv.style.background = "url("+projectData[currentProjectIndex]+") no-repeat center";
  }
}
