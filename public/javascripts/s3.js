// DOCUMENTATION ON HOW TO SETUP http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html#getting-started-browser-create-bucket
// S3 FUNCTIONS -> DOCUMENTATION ON http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

// AWS VARIABLES

var roleARN = "arn:aws:iam::212853009695:role/prototypeWebDisplay";
var bucketName = 'prototypedisplay';
var bucketRegion = 'us-east-1'; // http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
var IdentityPoolId = 'us-east-1:112d0d2f-84a0-4eb1-bb48-f8723b8edd1e';
var s3;
var baseURL = '	https://s3.amazonaws.com/prototypedisplay/'

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



awsS3.prototype.getInformationForAllProjects = function(projectFolders, callbackFunction){

  var projectTitles =[];
  var rgaOffices = [];
  var projectInformation =[];
  var projectVideo = [];
  var jsonCount = 0;

  // PUSH REEL INFORMATION

  projectTitles.push('reel');
  rgaOffices.push('R/GA');
  projectInformation.push('');
  projectVideo.push('true');

  // get JSON files

  getJSONFiles(1, projectFolders,baseURL, projectTitles, rgaOffices, projectInformation, projectVideo, callbackFunction);

}

function getJSONFiles(x, projectFolders, aURL, projectTitles, rgaOffices, projectInformation, projectVideo, callbackFunction){

  if(x < (projectFolders.length)){
    console.log(projectFolders[x]);
    var url = baseURL + projectFolders[x].toString() + 'info.json'

    $.getJSON(url, function(data){
      projectTitles.push(data.projectTitle);
      rgaOffices.push(data.rgaOffice);
      projectInformation.push(data.projectInformation);
      projectVideo.push(data.video);
    }).then(function(){
      getJSONFiles(x+1, projectFolders,baseURL,projectTitles, rgaOffices, projectInformation, projectVideo, callbackFunction);
    });

  }
  else{
    callbackFunction(projectTitles, rgaOffices, projectInformation, projectVideo);
  }


}

awsS3.prototype.getProjectURLS = function(projectFolders, projectVideo, callbackFunction){


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

        console.log(projectVideo)

          if(projectVideo[i] == "true"){
            var projectVideoLink = baseURL + projectFolders[i].toString() + 'webContent/hero.mp4';
            projectVideoURL.push(projectVideoLink);
          }
          else{
            projectVideoURL.push('null');
          }
      }

      if(i == (projectFolders.length - 1)){
        callbackFunction(projectData, projectVideoURL);
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

  //https://s3.amazonaws.com/prototypedisplay/01_Tango/info.json
