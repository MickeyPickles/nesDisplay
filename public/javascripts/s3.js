// DOCUMENTATION ON HOW TO SETUP http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html#getting-started-browser-create-bucket
// S3 FUNCTIONS -> DOCUMENTATION ON http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

// AWS VARIABLES

var roleARN = "arn:aws:iam::212853009695:role/prototypeWebDisplay";
var bucketName = 'prototypedisplay';
var bucketRegion = 'us-east-1'; // http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
var IdentityPoolId = 'us-east-1:112d0d2f-84a0-4eb1-bb48-f8723b8edd1e';
var s3;
var baseURL = 'https://s3.amazonaws.com/prototypedisplay/'


// PROTOTYPE DISPLAY PROJECT

class prototypeDisplayProject {

  constructor(title, office, projectInformation, imageURL, video, videoURL){

    this.title = title;
    this.office = office;
    this.projectInformation = projectInformation;
    this.imageURL = imageURL;
    this.video = video;
    this.videoURL = videoURL;

    return this;
  }
}

class prototypeDisplayPlaylist{

  constructor(title, projectsArray){
    this.title = title;
    this.projects = projectsArray;
    return this;
  }
}

// the parent of all s3 prototype functions
var awsS3 = function(){};


// CONFIGURE S3 FUNCTION
awsS3.prototype.configure = function(callbackFunction){
  AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      regionType:bucketRegion,
      IdentityPoolId: IdentityPoolId
    })
  });

  s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: bucketName}
  });
  callbackFunction(null,'Configure Complete ');
}

awsS3.prototype.getProjectFolders = function(callbackFunction){

  var projectFolders = [];

  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {

        for(i =0; i< data.CommonPrefixes.length; i++){
            projectFolders.push(data.CommonPrefixes[i].Prefix);
        }

          callbackFunction(projectFolders)
      }
    });
}

awsS3.prototype.getDisplayList = function(callbackFunction){

  var prototypeDisplayList = {};

  var url = "	https://s3.amazonaws.com/prototypedisplay/displayList.json"

  $.getJSON(url, function(data){
    prototypeDisplayList = data;
  }).then(function(){
    callbackFunction(prototypeDisplayList);
  });

}



awsS3.prototype.getInformationForAllProjects = function(displayList, projectFolders, callbackFunction){

  var projectTitles =[];
  var rgaOffices = [];
  var projectInformation =[];
  var projectVideo = [];
  var jsonCount = 0;
  var prototypeStudioProjects = [];

  console.log(displayList.projects);

  // PUSH REEL INFORMATION

  projectTitles.push('Tap Tablet to Start');
  rgaOffices.push('R/GA');
  projectInformation.push('');
  projectVideo.push('true');

  var firstHero = new prototypeDisplayProject('Tap Tablet to Start', 'R/GA', '', baseURL + '00_Reel/hero.jpg', 'true', baseURL + '00_Reel/hero.mp4');
  prototypeStudioProjects.push(firstHero);


  getJSONFiles(1, displayList.projects, projectFolders,baseURL, projectTitles, rgaOffices, projectInformation, projectVideo, prototypeStudioProjects, callbackFunction);
}

function getJSONFiles(x, displayList, projectFolders, aURL, projectTitles, rgaOffices, projectInformation, projectVideo, prototypeStudioProjects, callbackFunction){

  if(x < (projectFolders.length)){
    var url = baseURL + projectFolders[x].toString() + 'info.json'

    $.getJSON(url, function(data){

      console.log("DISPLAY LIST : " + displayList);

      console.log(data);
      for(i =0; i<displayList.length; i++){
        if(displayList[i] == data.projectTitle){

          projectTitles.push(data.projectTitle);
          rgaOffices.push(data.rgaOffice);
          projectInformation.push(data.projectInformation);
          projectVideo.push(data.video);

          var currentProject = new prototypeDisplayProject(data.projectTitle, data.rgaOffice, data.projectInformation, '', data.video, '');
          prototypeStudioProjects.push(currentProject);
          break;
        }
        else{
          //DO NOTHING
        }
      }
    }).then(function(){

      getJSONFiles(x+1, displayList, projectFolders,baseURL,projectTitles, rgaOffices, projectInformation, projectVideo, prototypeStudioProjects, callbackFunction);
    });

  }
  else{
    var secondHero = new prototypeDisplayProject('Tap Tablet to Start', 'R/GA', '', 'https://s3.amazonaws.com/prototypedisplay/00_Reel/hero.jpg', 'true',  'https://s3.amazonaws.com/prototypedisplay/00_Reel/heroII.mp4');
    prototypeStudioProjects.push(secondHero);
    console.log(secondHero);
    callbackFunction(projectTitles, rgaOffices, projectInformation, projectVideo, prototypeStudioProjects);
  }


}

awsS3.prototype.getProjectURLS = function(projectFolders, projectVideo, prototypeProjects, callbackFunction){


  var projectData = [];
  var projectVideoURL = [];


    // GET PROJECT DATA URL AND VIDEO URL

    for(i =0; i<projectFolders.length; i++){

      if(projectFolders[i] == '00_Reel/'){
        var projectDataURL = baseURL + '00_Reel/hero.jpg';
        projectData.push(projectDataURL);

        var projectVideoLink = baseURL + '00_Reel/hero.mp4';
        projectVideoURL.push(projectVideoLink);
      }
      else{
        var projectDataURL = baseURL + projectFolders[i].toString() + 'webContent/hero.jpg';
        projectData.push(projectDataURL);

        prototypeProjects[i].imageURL = projectDataURL;

        console.log(projectVideo)

          if(projectVideo[i] == "true"){
            var projectVideoLink = baseURL + projectFolders[i].toString() + 'webContent/hero.mp4';
            prototypeProjects[i].videoURL = projectVideoLink;
            projectVideoURL.push(projectVideoLink);
          }
          else{
            prototypeProjects[i].videoURL = 'null';
            projectVideoURL.push('null');
          }
      }

      if(i == (projectFolders.length - 1)){
        callbackFunction(projectData, projectVideoURL, prototypeProjects);
      }
    }
}


awsS3.prototype.matchProjectNameToIndex = function(projectTitles, projectName, callbackFunction){

  var foundProject = false;

  for(i = 0; i<projectFolders.length; i++){

    if(projectTitles[i] == projectName){
      foundProject = true;
      callbackFunction(foundProject, i);
      break;
    }

    if(i == (projectFolders.length - 1)){
      if(foundProject == false){
        callbackFunction(foundProject, null);
      }
    }
  }
}


awsS3.prototype.getPlaylists = function(callbackFunction){

  var projectPlaylists = {};
  var prototypeDisplayPlaylists = [];

  var url = "	https://s3.amazonaws.com/prototypedisplay/projectPlaylists.json"

  $.getJSON(url, function(data){
    projectPlaylists = data;
  }).then(function(){

    console.log(projectPlaylists.playlist);

    for (playlist in projectPlaylists.playlist){

      var newPlaylist = new prototypeDisplayPlaylist(projectPlaylists.playlist[playlist].title, projectPlaylists.playlist[playlist].projects)
      prototypeDisplayPlaylists.push(newPlaylist);
    }

    callbackFunction(prototypeDisplayPlaylists);
  });
}

awsS3.prototype.getProjectFromDisplayList = function(prototypeDisplayList, playlistList, callbackFunction){

  var newPlayListList = [];

  newPlayListList.push(new prototypeDisplayPlaylist("Reel Playlist", [prototypeDisplayList[0], prototypeDisplayList[prototypeDisplayList.length -1]]));


  // CREATE THE

  for(playlistCount =0; playlistCount<playlistList.length; playlistCount++){
    console.log("!")

    var newPlaylistProjects = [];

    var currentPlaylist = playlistList[playlistCount].projects;

      for(project in currentPlaylist){

        for(i = 0; i<prototypeDisplayList.length; i++){

          console.log(prototypeDisplayList[i].title)
          console.log(currentPlaylist[project]);
          if(prototypeDisplayList[i].title == currentPlaylist[project]){
            console.log("!")
              newPlaylistProjects.push(prototypeDisplayList[i]);
            }
          }
          console.log("!!")
          console.log(newPlaylistProjects);

        }
        newPlayListList.push(new prototypeDisplayPlaylist(playlistList[playlistCount].title, newPlaylistProjects));

        console.log("check")
        console.log(playlistCount)
        console.log(playlistList.length);

        if(playlistCount == (playlistList.length - 1)){
          console.log("HERE WE ARE");

        callbackFunction(newPlayListList);
        }

    }


}


  //https://s3.amazonaws.com/prototypedisplay/01_Tango/info.json
