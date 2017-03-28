
//**************************************************************************************************** //
//**************************************** DOCUMENTATION  ******************************************** //
//**************************************************************************************************** //

// DOCUMENTATION ON HOW TO SETUP
// http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html#getting-started-browser-create-bucket
// S3 FUNCTIONS DOCUMENTATION ON:
// http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

//**************************************************************************************************** //
//***************************************** AWS VARIABLES ******************************************** //
//**************************************************************************************************** //

// AWS VARIABLES

var roleARN = "arn:aws:iam::212853009695:role/prototypeWebDisplay";
var bucketName = 'prototypedisplay';
var bucketRegion = 'us-east-1'; // http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
var IdentityPoolId = 'us-east-1:112d0d2f-84a0-4eb1-bb48-f8723b8edd1e';
var s3;
var baseURL = 'https://s3.amazonaws.com/prototypedisplay/'

// the parent of all s3 prototype functions
var awsS3 = function(){};

//**************************************************************************************************** //
//*********************************** DISPLAY SPECIFIC CLASSES  ************************************** //
//**************************************************************************************************** //

/*
  @Class: Prototype Display Project
  @Constructor: Creates a Prototype Display Project with the following Params
  @param: Title {String} - Project Title
  @param: Office {String} - R/GA Office that took part in the project
  @param: Image Url {String} - Project Image URL
  @param: Video {String} - "True/False" - Tells the display if a video is shown
  @param: Videro URL {String} - Project Video URL
*/

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

/*
  @Class: Prototype Display Playlist
  @Constructor: Creates a Prototype Display Project with the following Params
  @param: Title {String} - Playlist Title
  @param: Projects [prototypeDisplayProject] - An array of relevant Prototype Display projects
*/

class prototypeDisplayPlaylist{

  constructor(title, projectsArray){
    this.title = title;
    this.projects = projectsArray;
    return this;
  }
}

//**************************************************************************************************** //
//****************************************** AWS CLASSES  ******************************************** //
//**************************************************************************************************** //

/*
  @Function: configure
  A function that signs into AWS with the relevant information

  @return: Null
*/

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

/*
  @Function: getProjectFolders
  A function that gets all the project folders from the display s3 bucket.

  @Callback: Returns {Array} of all the project folders in AWS as {String}
*/

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

/*
  @Function: getDisplayList
  A function that gets the display list json from aws.

  @Callback: Returns {JSON} that represents all the projects that can be shown.
*/

awsS3.prototype.getDisplayList = function(callbackFunction){

  var prototypeDisplayList = {};

  var url = "	https://s3.amazonaws.com/prototypedisplay/displayList.json"

  $.getJSON(url, function(data){
    prototypeDisplayList = data;
  }).then(function(){
    callbackFunction(prototypeDisplayList);
  });

}

/*
  @Function: getInformationForAllProjects
  A function that uses the display list to get all the projects and turns them into prototypeStudioProjects

  @Param: displayList - The response from @Function: 'getDisplayList'.
  @Param: projectFolders - The response from @Function: 'getProjectFolders'

  @Callback: Returns {[prototypeStudioProjects]} that represents all the projects that can be shown.
*/

awsS3.prototype.getInformationForAllProjects = function(displayList, projectFolders, callbackFunction){

  var prototypeStudioProjects = [];   // Create a blank array for the projects

  // Create two instances for the two reel projects that form the highlight reel playlist.
  var firstHero = new prototypeDisplayProject('Tap Tablet to Start', 'R/GA', '', baseURL + '00_Reel/hero.jpg', 'true', baseURL + '00_Reel/hero.mp4');
  prototypeStudioProjects.push(firstHero);

  var secondHero = new prototypeDisplayProject('Tap Tablet to Start', 'R/GA', '', 'https://s3.amazonaws.com/prototypedisplay/00_Reel/hero.jpg', 'true',  'https://s3.amazonaws.com/prototypedisplay/00_Reel/heroII.mp4');
  prototypeStudioProjects.push(secondHero);
  console.log(secondHero);


  // Begin loading projects based on the displaylist. Initially at 1, as folder 0 will always be the Reel and must be ignored.
  getJSONFiles(1, displayList.projects, projectFolders,baseURL, prototypeStudioProjects, callbackFunction);
}

/*
  @Function: getJSONFiles
  A function that gets each projects info.json and uses that to create the neccesary project.

  @Param: x -  Used to make this function 'synchronous' and represents the index of the project folders that is currently being analysed.
  @Param: displayList - The response from @Function: 'getDisplayList'.
  @Param: projectFolders - The response from @Function: 'getProjectFolders'
  @Param: aURL - The baseURL for the the prototype display S3 bucket. NOTE: This is found at the top of this folder.
  @Param: prototypeStudioProjects - The array of prototypeStudioProject's that will eventually be returned.

  @Callback: Returns {[prototypeStudioProjects]} that represents all the projects that can be shown.
*/

function getJSONFiles(x, displayList, projectFolders, aURL, prototypeStudioProjects, callbackFunction){

  // check if you have gone through all the projects.
  if(x < (projectFolders.length)){

    var url = baseURL + projectFolders[x].toString() + 'info.json';   // The url for the relevant json file
    var currentFolder = projectFolders[x].toString();                 // The current project folder.

    // Make a request for the current JSON.  @Return: Data - {JSON} with relevant project infromation
    $.getJSON(url,currentFolder, function(data){

      console.log("DISPLAY LIST : " + displayList);
      console.log("CURRENT FOLDER DATA : " + data);

      // Check if the project name matches one in the display list.
      for(i =0; i<displayList.length; i++){
        if(displayList[i] == data.projectTitle){

          // create the relevant image and video urls
          var imageURL = baseURL + currentFolder + 'webContent/hero.jpg';
          var videoURL = baseURL + currentFolder + 'webContent/hero.mp4';
          // create the current project and add it to the array.
          var currentProject = new prototypeDisplayProject(data.projectTitle, data.rgaOffice, data.projectInformation, imageURL, data.video, videoURL);
          prototypeStudioProjects.push(currentProject);
          break;
        }
        else{
          //DO NOTHING
        }
      }
    }).then(function(){
      // once its done, call the function again for the next available project folder.
      getJSONFiles(x+1, displayList, projectFolders,baseURL, prototypeStudioProjects, callbackFunction);
    });

  }
  // If you have gone through all the project folder, return the array.
  else{
    callbackFunction(prototypeStudioProjects);
  }
}

/*
  @Function: getPlaylists
  A function that gets the {JSON} for the playlists that are required for the display

  @Callback: Returns {[prototypeDisplayPlaylist]]} that represents all the playlists for the display with the projects as {String}
*/

awsS3.prototype.getPlaylists = function(callbackFunction){

  var projectPlaylists = {};            // used for to get the JSON response
  var prototypeDisplayPlaylists = [];   // used for the display callback response

  var url = "	https://s3.amazonaws.com/prototypedisplay/projectPlaylists.json"

  // get the playlist JSON file
  $.getJSON(url, function(data){
    projectPlaylists = data;
  }).then(function(){

    // Create a playlist for each playlist in the JSON response
    for (playlist in projectPlaylists.playlist){

      // Create a playlist that uses the JSON response of the title {String} and Projects Array {[String]} and add it to the playlist.
      var newPlaylist = new prototypeDisplayPlaylist(projectPlaylists.playlist[playlist].title, projectPlaylists.playlist[playlist].projects)
      prototypeDisplayPlaylists.push(newPlaylist);
    }
    // Return the Playlist Array
    callbackFunction(prototypeDisplayPlaylists);
  });
}

/*
  @Function: getProjectFromDisplayList
  A function that gets the {JSON} for the playlists that are required for the display

  @Param: prototypeDisplayList - {[prototypeStudioProjects]} Response from @Function: getInformationForAllProjects
  @Param: playlistList - {[prototypeDisplayPlaylist]} Response from @Function: getPlaylists

  @Callback: Returns {[prototypeDisplayPlaylist]]} that represents all the playlists for the display with the projects as {prototypeStudioProjects}
*/

awsS3.prototype.getProjectFromDisplayList = function(prototypeDisplayList, playlistList, callbackFunction){

  var newPlayListList = [];   // create the new playist variable

  // Push the 'Reel' playlist based on the first two projects
  newPlayListList.push(new prototypeDisplayPlaylist("Reel Playlist", [prototypeDisplayList[0], prototypeDisplayList[1]]));

  // loop through the playlist and and add the relevant projects to an array, that will be used to create a new playlist.
  for(playlistCount =0; playlistCount<playlistList.length; playlistCount++){

    var newPlaylistProjects = [];   // create a new array to hold all the relevant projects.
    var currentPlaylist = playlistList[playlistCount].projects; // set the current playlist to the projects from the playlist list.

    // For each project in the current playlist, match it to a project in the prototype displaylist and add it to the array.
      for(project in currentPlaylist){
        for(i = 0; i<prototypeDisplayList.length; i++){
          if(prototypeDisplayList[i].title == currentPlaylist[project]){
              newPlaylistProjects.push(prototypeDisplayList[i]);
            }
          }
        }
        // once you have gone through all the projects, add it to the Playlist List
        newPlayListList.push(new prototypeDisplayPlaylist(playlistList[playlistCount].title, newPlaylistProjects));

        // once you have gone through all the playlist lists, return the new playlistList.
        if(playlistCount == (playlistList.length - 1)){
        callbackFunction(newPlayListList);
        }
    }
}


/*
  @Function: matchProjectNameToIndex
  A function that gets the {prototypeDisplayProject} that is to be shown on the display.
  NOTE: This is currently not active and will be needed to be redesigned for the current ARCHITECTURE and integrated for any single project display projects.

  @Param: projectTitles - {[String]} of all the projects in the display list.
  @Param: projectName - {String} of the project that is to be retrieved.

  @Callback: Returns {Int} the index of the project in the {prototypeDisplayList}
*/


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

  //https://s3.amazonaws.com/prototypedisplay/01_Tango/info.json
