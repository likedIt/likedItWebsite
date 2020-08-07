"use strict";

var express = require("express");
const https = require("https");
var bodyParser = require("body-parser");
var fs = require("fs");
var fsExtra = require("fs-extra");
var cors = require("cors");
var Queue = require("better-queue");
var mysql = require("mysql");
var exec = require("child_process").exec;
const { spawn } = require("child_process");
const redis = require("redis");
const client = redis.createClient();
var app = express();
//var currId

var imageNFP = 50;

const corsm = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
};

app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(
  bodyParser.json({ limit: "500mb", extended: true, parameterLimit: 50000 })
);

/*client.on("error", function(error) {
  console.error(error);
});*/
client.get("watchInfo", function (obj) {
  var watchInfo = [];
  if (obj == null) client.set("watchInfo", JSON.stringify(watchInfo));
});

////////////////////////////////////////////////////--DATABASE PART--////////////////////////////////////////////////////////////////////
var db = mysql.createConnection({
  host: "34.69.69.171",
  user: "root",
  password: "bilkent",
  database: "likedit",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("connected");
});

app.post("/api/Userinsert", corsm, function (request, response) {
  console.log(request.body.idtoken);
  var token = request.body.idtoken;
  var name = request.body.uName;
  var surname = request.body.sName;
  var e_mail = request.body.Email;

  let sqlSearch = `SELECT name FROM User WHERE UserToken = ${request.body.idtoken}`;
  let querySch = db.query(sqlSearch, (err, result) => {
    if (err) throw err;
    //check if the user is new in the system
    if (result[0]) {
      console.log("daha önce giriş yapmış");
    } else {
      let User = {
        UserToken: token,
        name: name,
        surname: surname,
        e_mail: e_mail,
      };
      let sqlIns = "INSERT INTO User SET ?";
      let query = db.query(sqlIns, User, (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    }
  });
});

app.post("/api/currUser", corsm, function (request, response) {
  console.log("current id: " + currId);
  response.send({ currId: currId });
});

app.post("/api/UserVideos", corsm, function (request, response) {
  var id = request.body.currentId;
  let sqlSearch = `SELECT WatchID, videoID,watchDate FROM User_Watch_Videos WHERE UserToken = '${request.body.currentId}'`;
  let querySch = db.query(sqlSearch, (err, result, fields) => {
    if (err) throw err;
    response.send({ result: result });
    //console.log(result);
  });
});

function createModelTable(watchId) {
  let name = watchId + "Model";
  let createModel = `CREATE TABLE ${name} (tag int, ImageSeq int, timestamp varchar(55), neutral DOUBLE(40,2), liked DOUBLE(40,2), notLiked DOUBLE(40,2))`;
  db.query(createModel, (err, result) => {
    if (err) throw err;
  });
  return name;
}
function createGazeTable(watchId) {
  let name = watchId + "Gaze";
  let createGaze = `CREATE TABLE ${name} (X text, Y text)`;
  db.query(createGaze, (err, result) => {
    if (err) throw err;
  });
  return name;
}

function createEmotionTable(watchId) {
  let name = watchId + "Emotion";
  let createEmotion = `CREATE TABLE ${name} (ImageSeq int, timestamp varchar(55), happiness DOUBLE(40,2), anger DOUBLE(40,2), fear DOUBLE(40,2), surprize DOUBLE(40,2), disgust DOUBLE(40,2))`;
  db.query(createEmotion, (err, result) => {
    if (err) throw err;
  });
  return name;
}

function resultTables(watchId) {
  // let OFTable = createOpenFaceTable(watchId);
  let modelTable = createModelTable(watchId);
  let gazeTable = createGazeTable(watchId);
  let emotionTable = createEmotionTable(watchId);

  let sqlUpt = `UPDATE User_Watch_Videos SET gazeTableName  = '${gazeTable}', modelResultsName  = '${modelTable}', emotionResultsName  = '${emotionTable}' WHERE WatchID  = '${watchId}'`;
  let queryUpt = db.query(sqlUpt, (err, resultV, fields) => {
    if (err) throw err;
  });
}

app.post("/api/Videoinsert", corsm, function (request, response) {
  var oldWID = -1;
  let sqlFindOld = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos`;
  let queryFindOld = db.query(sqlFindOld, (err, result, fields) => {
    console.log("172 wid: " + oldWID);
    if (err) throw err;
    oldWID = result[0].ID;
    console.log("172 wid: " + oldWID);
  });
  var videoId = request.body.vID;
  var owner = request.body.channel;
  var time = request.body.duration;
  var currId = request.body.currentId;
  //var watchDate = request.body.date;
  var watchDate = new Date().toISOString().slice(0, 19).replace("T", " "); //new Date();
  console.log("current: " + currId);

  let sqlSearch = `SELECT * FROM Videos WHERE videoID = '${request.body.vID}'`;
  let querySch = db.query(sqlSearch, (err, result, fields) => {
    if (err) throw err;
    //check if the video is new in the system
    if (result[0]) {
      //update the watched number
      var temp = result[0].watchedNumber;
      var newNumber = temp + 1;
      let sqlUpt = `UPDATE Videos SET watchedNumber = ${newNumber} WHERE videoID = '${request.body.vID}'`;
      let queryUpt = db.query(sqlUpt, (err, resultV, fields) => {
        if (err) throw err;
      });
      if (currId == 0) {
        let modelTable = " ";
        let gazeTable = " ";
        let emotionTable = " ";
        let variables = {
          videoID: videoId,
          ImgNum: 0,
          score: 0,
          gazeTableName: gazeTable,
          modelResultsName: modelTable,
          emotionResultsName: emotionTable,
          watchDate: watchDate,
        };
        let sqlInsWatch = "INSERT INTO User_Watch_Videos SET ?";
        let queryInsWatch = db.query(
          sqlInsWatch,
          variables,
          (err, resultUWVI, fields) => {
            if (err) throw err;
            let sqlWid = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos WHERE UserToken = '${currId}'`;
            let queryWid = db.query(sqlWid, (err, result, fields) => {
              if (err) throw err;
              var id = result[0].ID;
              resultTables(id);
            });
          }
        );
      } else {
        let modelTable = " ";
        let gazeTable = " ";
        let emotionTable = " ";
        let variables = {
          UserToken: currId,
          videoID: videoId,
          ImgNum: 0,
          score: 0,
          gazeTableName: gazeTable,
          modelResultsName: modelTable,
          emotionResultsName: emotionTable,
          watchDate: watchDate,
        };
        let sqlInsWatch = "INSERT INTO User_Watch_Videos SET ?";
        let queryInsWatch = db.query(
          sqlInsWatch,
          variables,
          (err, resultUWVI, fields) => {
            if (err) throw err;
            let sqlWid = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos WHERE UserToken = '${currId}'`;
            let queryWid = db.query(sqlWid, (err, result, fields) => {
              if (err) throw err;
              var id = result[0].ID;
              resultTables(id);
            });
          }
        );
      }
    } else {
      //video is new
      let Videos = {
        videoID: videoId,
        ownerID: owner,
        LikeditScore: 0,
        watchedNumber: 1,
        duration: time,
      };
      let sql = "INSERT INTO Videos SET ?";
      let query = db.query(sql, Videos, (err, resultV2, fields) => {
        if (err) throw err;
      });
      if (currId != 0) {
        let modelTable = " ";
        let gazeTable = " ";
        let emotionTable = " ";
        let variables = {
          UserToken: currId,
          videoID: videoId,
          ImgNum: 0,
          score: 0,
          gazeTableName: gazeTable,
          modelResultsName: modelTable,
          emotionResultsName: emotionTable,
          watchDate: watchDate,
        };
        let sqlInsWatch = "INSERT INTO User_Watch_Videos SET ?";
        let queryInsWatch = db.query(
          sqlInsWatch,
          variables,
          (err, resultUWVI, fields) => {
            if (err) throw err;
            let sqlWid = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos WHERE UserToken = '${currId}'`;
            let queryWid = db.query(sqlWid, (err, result, fields) => {
              if (err) throw err;
              var id = result[0].ID;
              resultTables(id);
            });
          }
        );
      } else {
        let modelTable = " ";
        let gazeTable = " ";
        let emotionTable = " ";
        let variables = {
          videoID: videoId,
          ImgNum: 0,
          score: 0,
          gazeTableName: gazeTable,
          modelResultsName: modelTable,
          emotionResultsName: emotionTable,
          watchDate: watchDate,
        };
        let sqlInsWatch = "INSERT INTO User_Watch_Videos SET ?";
        let queryInsWatch = db.query(
          sqlInsWatch,
          variables,
          (err, resultUWVI, fields) => {
            if (err) throw err;
            let sqlWid = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos WHERE UserToken = '${currId}'`;
            let queryWid = db.query(sqlWid, (err, result, fields) => {
              if (err) throw err;
              var id = result[0].ID;
              resultTables(id);
            });
          }
        );
      }
    }
    let sqlFind = `SELECT MAX(WatchID) AS ID FROM User_Watch_Videos WHERE UserToken = '${currId}'`; //WHERE UserToken = '${currId}'
    let queryFind = db.query(sqlFind, (err, result, fields) => {
      if (err) throw err;
      var wID = result[0].ID;
      console.log(wID);
      client.get("watchInfo", function (err, reply) {
        //console.log("Reply from redis: " +  reply);
        console.log("Error in redis: " + err);
        var watchInfo = JSON.parse(reply);
        var infoObject = {
          resultCounter: 0,
          imageNumber: 1,
          timesOfImage: [],
          numberOfImage: [],
          timesOfImageE: [],
          numberOfImageE: [],
        };
        watchInfo[wID] = infoObject;
        client.set("watchInfo", JSON.stringify(watchInfo));
      });
      response.send({ wID: wID });
    });
  });
});
////////////////////////////////////////////////////--END OF THE DATABASE PART--////////////////////////////////////////////////////////////////////

// Queues
var openfaceQueue = new Queue(function (input, cb) {
  var imageNum = input.num;
  var arrayTemp = input.arrayT;
  var arrayTemp2 = [...arrayTemp];
  var arrayNum = input.arrayN;
  var arrayNum2 = [...arrayNum];
  var wID = input.wID;
  var imageNumTemp = input.imageNumTemp;
  var finished = input.finished;
  console.log("Get in queue: " + imageNum + " with wID: " + wID);
  // analyse it with openface
  var cmd =
    "cd " + "/home/elifberilsayli/Openface" + " && ./bin/FaceLandmarkImg";
  var cmd2 = "";
  for (var i = imageNum - imageNumTemp + 1; i < imageNum; i++)
    cmd2 =
      cmd2 +
      ' -f "/home/elifberilsayli/backend/output/' +
      wID +
      "/image" +
      i +
      '.png"';
  //cmd2 = cmd2 + ' -out_dir "/home/elifberilsayli/backend/output/' + wID + '"';
  exec(cmd + cmd2, function (error, stdout, stderr) {
    console.log("error if any:" + error + stderr);
    //console.log('openface output:' + stdout);
    /*dbQueue.push({ output: stdout , tag: 0, arrayT: arrayTemp, arrayN: arrayNum, wID: wID }, function (err, result) {
           console.log( "DB result: " + result );
        });*/
    // send result to dp
    var cmd = "python3 test.py ";
    var arrayOF = stdout.split("END");
    arrayOF.forEach(function (value) {
      var array = value.split(",");
      if (array[1] != null) {
        cmd = cmd + array[676];
        var AU_rcstd = array[676];
        for (var i = 677; i < 693; i++) {
          cmd = cmd + array[i];
          AU_rcstd += array[i];
        }
      }
    });
    //console.log("cmd: " + cmd);
    modelQueue.push({
      tag: 0,
      cmd: cmd,
      imageNum: imageNum,
      wID: wID,
      arrayT: arrayTemp2,
      arrayN: arrayNum2,
      imageNumTemp: imageNumTemp,
      finished: finished,
    });
    cb(null, "openface result: " + stdout + " of: " + wID + "/" + imageNum);
  });
});

var modelQueue = new Queue(function (input, cb) {
  var tag = input.tag;
  var imageNum = input.imageNum;
  var wID = input.wID;
  var imageNumTemp = input.imageNumTemp;
  var arrayTemp = input.arrayT;
  var arrayNum = input.arrayN;
  var finished = input.finished;
  var cmd = input.cmd;
  console.log("Get in model: " + imageNum + " with wID: " + wID);
  exec(cmd, function (error, stdout, stderr) {
    dbModelQueue.push(
      {
        tag: tag,
        output: stdout,
        arrayT: arrayTemp,
        arrayN: arrayNum,
        wID: wID,
        finished: finished,
      },
      function (err, result) {
        console.log("DB Model reuslt: " + result);
      }
    );
    cb(null);
  });
});

var dbModelQueue = new Queue(function (input, cb) {
  var arrayEmo = input.output.split("\n");
  var arrayOfTimes = input.arrayT;
  var arrayOfNumbers = input.arrayN;
  var wID = input.wID;
  var tag = input.tag;
  var tableName = wID + "Model";
  var finished = input.finished;
  arrayEmo.forEach(function (value) {
    var array = value.split(",");

    if (array[0] == "" || array[0] == " " || array[0] == null) {
      //console.log("boş ");
    } else {
      //console.log("boş değil");
      var notLiked = array[0].replace(/\s/g, "");
      var neutral = array[1].replace(/\s/g, "");
      var liked = array[2].replace(/\s/g, "");

      /*for(var i=0; i<array.length; i++)
                console.log("i: "+i + " "+array[i]);*/

      var time = arrayOfTimes.shift();
      var numberOI = arrayOfNumbers.shift();
      let sqlModel = `INSERT INTO ${tableName} SET ?`;
      let variables = {
        tag: tag,
        ImageSeq: numberOI,
        timestamp: time,
        neutral: neutral,
        liked: liked,
        notLiked: notLiked,
      };
      let queryModel = db.query(
        sqlModel,
        variables,
        (err, resultModel, fields) => {
          if (err) throw err;
        }
      );
    }
  });
  if (finished == 1) {
    console.log("Finished!!!");
    var folder1 = "/home/elifberilsayli/backend/output/" + wID;
    fsExtra.remove(folder1, (err) => {
      console.error(err);
    });
    var folder2 = "/home/elifberilsayli/emotion/EmoPy/EmoPy/examples/" + wID;
    fsExtra.remove(folder2, (err) => {
      console.error(err);
    });
    dbScoreQueue.push({ wID: wID });
  }
  cb(null, "DB Model is completed !!");
});

var dbScoreQueue = new Queue(function (input, cb) {
  console.log("SCORE!!!");
  var wID = input.wID;
  var tableName = wID + "Model";

  let sqlAvg = `SELECT AVG (liked) AS avgLiked FROM ${tableName}`;
  let queryAvg = db.query(sqlAvg, (err, resultAvg, fields) => {
    if (err) console.log(err);

    var likedAvg = resultAvg[0].avgLiked;
    let sqlTotalAvg = `UPDATE User_Watch_Videos SET score = '${likedAvg}' WHERE WatchID = '${wID}'`;
    let queryTotalAvg = db.query(sqlTotalAvg, (err, resultTotalAvg, fields) => {
      let sqlVideoAvg = `SELECT videoID, score FROM User_Watch_Videos WHERE WatchID='${wID}' `;
      let queryVideoAvg = db.query(
        sqlVideoAvg,
        (err, resultVideoAvg, fields) => {
          var score = resultVideoAvg[0].score;
          var videoId = resultVideoAvg[0].videoID;
          let getVideoScore = `SELECT LikeditScore FROM Videos WHERE videoID ='${videoId}' `;
          let queryVideo = db.query(
            getVideoScore,
            (err, resultVideo, fields) => {
              var oldScore = resultVideo[0].LikeditScore;
              if (oldScore != 0) {
                var newScore = (score + oldScore) / 2;
              } else var newScore = score;
              var newScore = (score + oldScore) / 2;
              let videoTotalAvg = `UPDATE Videos SET LikeditScore = '${newScore}' WHERE videoID ='${videoId}'`;
              let queryVideoTotal = db.query(
                videoTotalAvg,
                (err, resultVideo, fields) => {
                  if (err) console.log(err);
                  let num = 1;
                  let updateNum = `UPDATE User_Watch_Videos SET ImgNum  = ${num} WHERE WatchID = '${wID}'`;
                  let queryNum = db.query(updateNum, (err, result, fields) => {
                    if (err) console.log(err);
                  });
                  cb(null, "DB Model is completed !!");
                }
              );
            }
          );
        }
      );
    });
  });
});

var emotionQueue = new Queue(function (input, cb) {
  console.log("Get in emotion queue with wID: " + input.wID);
  var imageNum = input.num;
  var wID = input.wID;
  var imageNumTemp = input.imageNumTemp;
  var arrayTemp = input.arrayET; // timestamp
  var arratNum = input.arrayEN; // image sequence
  var finished = input.finished;
  // analyse it emotion model
  var cmd =
    "cd " +
    "/home/elifberilsayli/emotion" +
    "&& . venv/bin/activate" +
    "&& cd /home/elifberilsayli/emotion/EmoPy/EmoPy" +
    "&& python emotion_base.py " +
    imageNumTemp +
    " " +
    wID;

  for (var i = imageNum - imageNumTemp + 1; i <= imageNum; i++)
    cmd = cmd + " image" + i + ".png ";
  exec(cmd, function (error, stdout, stderr) {
    //console.log("Emotion error: " + error + stderr);
    //console.log("Emotion stdout: " + stdout);
    dbEmotionQueue.push(
      {
        output: stdout,
        arrayET: arrayTemp,
        arrayEN: arratNum,
        wID: wID,
        finished: finished,
      },
      function (err, result) {
        console.log("DB Emotion result: " + result);
      }
    );
    cb(null);
  });
});

var dbEmotionQueue = new Queue(function (input, cb) {
  var arrayEmo = input.output.split("\n");
  var finished = input.finished;
  var arrayOfTimes = input.arrayET;
  var arrayOfNumbers = input.arrayEN;
  var wID = input.wID;
  var tableName = wID + "Emotion";
  var sizeIndex = arrayOfTimes.length;
  var helpCounter = 0;
  for (var i = 0; i < sizeIndex; i++) {
    var index1 = i;
    var index2 = helpCounter + sizeIndex;
    var index3 = index2 + 1;
    var index4 = helpCounter + sizeIndex * 3;
    var index5 = index4 + 1;
    var happ = arrayEmo[index1].replace("%", "");
    var anger = arrayEmo[index2].replace("%", "");
    var fear = arrayEmo[index3].replace("%", "");
    var surprize = arrayEmo[index4].replace("%", "");
    var disgust = arrayEmo[index5].replace("%", "");
    //console.log("happ: " + happ + ", anger: " + anger + ", fear: " + fear + "surprize: " + surprize +  "disgust: " + disgust );
    var time = arrayOfTimes.shift();
    var numberOI = arrayOfNumbers.shift();
    let sqlEmo = `INSERT INTO ${tableName} SET ?`;
    let variables = {
      ImageSeq: numberOI,
      timestamp: time,
      happiness: happ,
      anger: anger,
      fear: fear,
      surprize: surprize,
      disgust: disgust,
    };
    let queryEmo = db.query(sqlEmo, variables, (err, resultEmo, fields) => {
      if (err) console.log("Emotion db error if any: " + err);
    });
    helpCounter = helpCounter + 2;
  }
  if (finished == 1) {
    console.log("Finished for emotion");
    dbScoreEmoQueue.push({ wID: wID });
  }
  cb(null, "DB Emotion is completed !!");
});

//avarage happy score hesaplıyo. Emotion modeli işini bitirince çağrılacak!!!!!!!!!!!
var dbScoreEmoQueue = new Queue(function (input, cb) {
  console.log("EMOTION SCORE");
  var wID = input.wID;
  var tableName = wID + "Emotion";

  let sqlEmoAvg = `SELECT AVG (happiness) AS avgHapp, AVG(surprize) AS surpAvg FROM ${tableName}`;
  let queryEmoAvg = db.query(sqlEmoAvg, (err, resultEmoAvg, fields) => {
    if (err) console.log(err);
    console.log("BAŞLADII!!");
    var HappAvg = resultEmoAvg[0].avgHapp;
    var SurprizeAvg = resultEmoAvg[0].surpAvg;
    console.log("happy avg: " + HappAvg);
    console.log("supprize avg: " + SurprizeAvg);
    let sqlEmoTotalAvg = `UPDATE User_Watch_Videos SET happScore = '${HappAvg}', surpScore = '${SurprizeAvg}' WHERE WatchID = '${wID}'`;
    let queryEmoTotalAvg = db.query(
      sqlEmoTotalAvg,
      (err, resultEmoTotalAvg, fields) => {
        let sqlVideoAvg = `SELECT videoID, happScore, surpScore FROM User_Watch_Videos WHERE WatchID='${wID}' `;
        let queryVideoAvg = db.query(
          sqlVideoAvg,
          (err, resultEmoVideoAvg, fields) => {
            var HScore = resultEmoVideoAvg[0].happScore;
            var SurprizeScore = resultEmoVideoAvg[0].surpScore;
            var videoId = resultEmoVideoAvg[0].videoID;
            let getVideoScore = `SELECT happScore, suprScore FROM Videos WHERE videoID ='${videoId}' `;
            let queryVideo = db.query(
              getVideoScore,
              (err, resultEmoVideo, fields) => {
                var oldScoreH = resultEmoVideo[0].happScore;
                var oldScoreS = resultEmoVideo[0].suprScore;
                if (oldScoreH != 0) {
                  var newScoreH = (HScore + oldScoreH) / 2;
                } else var newScoreH = HScore;
                if (oldScoreS != 0) {
                  var newScoreS = (SurprizeScore + oldScoreS) / 2;
                } else var newScoreS = SurprizeScore;
                let videoTotalAvg = `UPDATE Videos SET happScore = '${newScoreH}', suprScore = '${newScoreS}' WHERE videoID ='${videoId}'`;
                let queryVideoTotal = db.query(
                  videoTotalAvg,
                  (err, resultEmoVideo, fields) => {
                    if (err) console.log(err);
                    cb(null, "DB Model is completed !!");
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

var imageQueue = new Queue(function (input, cb) {
  //console.log("Image queue!!");
  var buf = Buffer.from(input.image, "base64");
  var time = input.time;
  var imageNum = input.imageNum;
  var wID = input.wID;
  /*var imageNumber;
    var timesOfImage;
    var numberOfImage;
    var timesOfImageE;
    var numberOfImageE;
    var watchInfo;*/
  client.get("watchInfo", function (err, reply) {
    var watchInfo = JSON.parse(reply);
    //console.log("Buraya giriyo mu " +  watchInfo[wID].imageNumber);
    var imageNumber = watchInfo[wID].imageNumber;
    var timesOfImage = watchInfo[wID].timesOfImage;
    var numberOfImage = watchInfo[wID].numberOfImage;
    var timesOfImageE = watchInfo[wID].timesOfImageE;
    var numberOfImageE = watchInfo[wID].numberOfImageE;

    //console.log("Image number in queue: " + imageNumber);
    timesOfImage.push(time);
    numberOfImage.push(imageNum);
    timesOfImageE.push(time);
    numberOfImageE.push(imageNum);

    //console.log("Image number in queue: " + imageNumber);

    fs.mkdir(
      "/home/elifberilsayli/backend/output/" + wID,
      { recursive: true },
      (err) => {
        if (err) throw err;
        else {
          fs.writeFile(
            "output/" + wID + "/image" + imageNumber + ".png",
            buf,
            function (error) {
              if (error) {
                console.log("error");
                throw error;
              } else {
                //console.log('File created: ' + imageNumber);
                fs.mkdir(
                  "/home/elifberilsayli/emotion/EmoPy/EmoPy/examples/" + wID,
                  { recursive: true },
                  (err) => {
                    if (err) throw err;
                    else {
                      fs.writeFile(
                        "/home/elifberilsayli/emotion/EmoPy/EmoPy/examples/" +
                          wID +
                          "/image" +
                          imageNumber +
                          ".png",
                        buf,
                        function (error) {
                          if (error) {
                            console.log("error");
                            throw error;
                          } else {
                            if (imageNumber % imageNFP == 0) {
                              openfaceQueue.push({
                                wID: wID,
                                num: imageNumber,
                                arrayT: timesOfImage,
                                arrayN: numberOfImage,
                                imageNumTemp: imageNFP,
                                finished: 0,
                              });
                              emotionQueue.push({
                                wID: wID,
                                num: imageNumber,
                                arrayET: timesOfImageE,
                                arrayEN: numberOfImageE,
                                imageNumTemp: imageNFP,
                                finished: 0,
                              });
                              timesOfImage = [];
                              numberOfImage = [];
                              timesOfImageE = [];
                              numberOfImageE = [];
                            }

                            imageNumber++;

                            watchInfo[wID].imageNumber = imageNumber;
                            watchInfo[wID].timesOfImage = timesOfImage;
                            watchInfo[wID].numberOfImage = numberOfImage;
                            watchInfo[wID].timesOfImageE = timesOfImageE;
                            watchInfo[wID].numberOfImageE = numberOfImageE;
                            client.set("watchInfo", JSON.stringify(watchInfo));
                            cb(null);
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  });
});

app.post("/api/trendVideos", corsm, function (request, response) {
  let sqltrend = `SELECT * FROM Videos ORDER BY LikeditScore DESC LIMIT 6`;
  let querytrend = db.query(sqltrend, (err, resultTrend, fields) => {
    if (err) console.log(err);
    console.log(resultTrend);
    response.send({ resultTrend: resultTrend });
  });
});

app.post("/api/happiestVideos", corsm, function (request, response) {
  let sqlHappy = `SELECT * FROM Videos ORDER BY happScore DESC LIMIT 6`;
  let queryHappy = db.query(sqlHappy, (err, resultHappy, fields) => {
    if (err) console.log(err);
    console.log("h: " + resultHappy);
    response.send({ resultHappy: resultHappy });
  });
});

app.post("/api/SurpVideos", corsm, function (request, response) {
  let sqlSurp = `SELECT * FROM Videos ORDER BY suprScore DESC LIMIT 6`;
  let querySurp = db.query(sqlSurp, (err, resultSurp, fields) => {
    if (err) console.log(err);
    response.send({ resultSurp: resultSurp });
  });
});
// API CALLS
// handle post request to download image
app.post("/api/downloadImage", corsm, function (request, response) {
  //console.log("Get post request from client.");

  var blobText = request.body.image;
  var timestamp = request.body.time;
  var imageSeq = request.body.imageNum;
  var wID = request.body.wID;
  if (typeof blobText !== "string") {
    response.sendStatus(400);
    return;
  }
  if (typeof wID == "undefined" && wID == null) {
    response.sendStatus(400);
    return;
  }
  //console.log("wID come with request: " + wID);
  imageQueue.push(
    { time: timestamp, imageNum: imageSeq, wID: wID, image: blobText },
    function (err, result) {
      response.status(200).send("Ok!");
    }
  );
});

app.post("/api/getDuration", corsm, function (request, response) {
  var wid = request.body.watchID;
  console.log("Get duration");
  //console.log("watch: " + wid);
  let sqlDuration = `SELECT Videos.duration FROM Videos INNER JOIN User_Watch_Videos ON User_Watch_Videos.videoID=Videos.videoID WHERE User_Watch_Videos.WatchID = '${wid}'`;
  let queryDuration = db.query(sqlDuration, (err, result, fields) => {
    if (err) throw err;
    if (result[0] != undefined || result[0] != null) {
      var duration = result[0].duration;
      response.send({ duration: duration });
    }
  });
});

app.post("/api/isSuccess", corsm, function (request, response) {
  var wid = request.body.watchID;
  console.log("Get success");

  let ImgNum = `SELECT ImgNum FROM User_Watch_Videos WHERE WatchID='${wid}' `;
  let queryImg = db.query(ImgNum, (err, result, fields) => {
    if (err) console.log(err);
    var imageNumber = result[0].ImgNum;
    response.status(200).send({ imageNumber: imageNumber });
  });
});

// handle post gaze
app.post("/api/gaze", corsm, function (request, response) {
  console.log("Get gaze");
  var arrayX = request.body.arrayX;
  var arrayY = request.body.arrayY;
  //console.log("arrayX "+ arrayX);
  var wID = request.body.wID;
  var xValues = "";
  var yValues = "";
  var tableName = wID + "Gaze";

  if (arrayX) {
    if (arrayY) {
      for (var i = 0; i < arrayX.length; i++) {
        xValues = xValues + arrayX[i] + "\n";
      }
      for (var j = 0; j < arrayY.length; j++) {
        yValues = yValues + arrayY[j] + "\n";
      }

      let variables = { X: xValues, Y: yValues };
      let gazeSql = `INSERT INTO ${tableName} SET ?`;
      let queryGaze = db.query(gazeSql, variables, (err, result, fields) => {
        if (err) throw err;
        var msg = "Gaze DB completed";
        response.send({ msg: msg });
        console.log(msg);
      });
    }
  }
});

// handle getGazeData
app.post("/api/getGazeData", corsm, function (request, response) {
  var wID = request.body.watchID;
  //console.log("w: "+ wID);
  var tableName = wID + "Gaze";
  var arrayX = [];
  var arrayY = [];
  var strX = "";
  var strY = "";

  let dataXSql = `SELECT * FROM ${tableName}`;
  let dataXQuery = db.query(dataXSql, (err, result, fields) => {
    if (result != undefined || result != null) {
      if (result[0] != undefined || result[0] != null) {
        strX = result[0].X;
        strY = result[0].Y;
        //console.log("strX: " + strX);
        //console.log("strY: " + strY);
        arrayX = strX.split("\n");
        arrayY = strY.split("\n");

        response.send({ arrayX: arrayX, arrayY: arrayY });
      }
    }
  });
});

// handle post request to add openface result comming from desktop app to database
app.post("/api/saveToDB", corsm, function (request, response) {
  console.log("Get post request from desktop client.");
  console.log("Data from desktop client: " + request.body.wID);
  var openFaceResult = request.body.OFResult;
  var timeA = request.body.timeArray;
  var numA = request.body.numberArray;
  var wID = request.body.wID;
  var finished = request.body.finished;
  var imageNum = request.body.imageNum;
  var imageNumTemp = request.body.imageNumTemp;
  var arrayTemp2 = [...timeA];
  var arrayNum2 = [...numA];
  console.log("length of array: " + numA.length);
  console.log("length of array2: " + arrayNum2.length);
  // temp ve numı kopyala model queue ye ver
  if (typeof openFaceResult !== "string") {
    response.sendStatus(400);
    return;
  }

  var cmd = "python3 test.py ";
  var arrayOF = openFaceResult.split("END");
  arrayOF.forEach(function (value) {
    var array = value.split(",");
    if (array[1] != null) {
      cmd = cmd + array[676];
      var AU_rcstd = array[676];
      for (var i = 677; i < 693; i++) {
        cmd = cmd + array[i];
        AU_rcstd += array[i];
      }
    }
  });
  modelQueue.push({
    tag: 1,
    cmd: cmd,
    imageNum: imageNum,
    wID: wID,
    arrayT: arrayTemp2,
    arrayN: arrayNum2,
    imageNumTemp: imageNumTemp,
    finished: finished,
  });
});

// handle get request indicating the end of video
app.post("/api/finished", corsm, function (request, response) {
  console.log("FINISHED!!.");
  var wID = request.body.wID;
  /*var watchInfo;
    var imageNumber;
    var timesOfImage;
    var numberOfImage;
    var timesOfImageE;
    var numberOfImageE;*/

  if (typeof wID !== "undefined" && wID !== null) {
    var watchInfo;
    client.get("watchInfo", function (err, reply) {
      var watchInfo = JSON.parse(reply);
      var imageNumber = watchInfo[wID].imageNumber;
      var timesOfImage = watchInfo[wID].timesOfImage;
      var numberOfImage = watchInfo[wID].numberOfImage;
      var timesOfImageE = watchInfo[wID].timesOfImageE;
      var numberOfImageE = watchInfo[wID].numberOfImageE;
      var atemp = imageNumber % imageNFP;
      openfaceQueue.push({
        wID: wID,
        num: imageNumber,
        arrayT: timesOfImage,
        arrayN: numberOfImage,
        imageNumTemp: atemp,
        finished: 1,
      });
      emotionQueue.push({
        wID: wID,
        num: imageNumber,
        arrayET: timesOfImageE,
        arrayEN: numberOfImageE,
        imageNumTemp: atemp,
        finished: 1,
      });
      timesOfImage = [];
      numberOfImage = [];
      timesOfImageE = [];
      numberOfImageE = [];
      watchInfo[wID].timesOfImage = timesOfImage;
      watchInfo[wID].numberOfImage = numberOfImage;
      watchInfo[wID].timesOfImageE = timesOfImageE;
      watchInfo[wID].numberOfImageE = numberOfImageE;
      client.set("watchInfo", JSON.stringify(watchInfo));
      response.status(200).send({ imageNumber: imageNumber });
    });
  }
});

app.post("/api/getEmotionData", corsm, function (request, response) {
  console.log("Get Emotion Data");
  var wID = request.body.watchID;
  if (typeof wID !== "undefined" && wID !== null) {
    //console.log("wID: " + wID);

    var tableName = wID + "Emotion";
    let sqlGetOrder = `SELECT * FROM ${tableName} ORDER BY ImageSeq`;
    let queryGetOrder = db.query(sqlGetOrder, (err, result, fields) => {
      /* for(var i = 0; i<result.length; i++)
            {
                console.log(result[i]);
            }*/
      if (err) throw err;
      response.status(200).send({ result: result });
    });
  }
});

app.post("/api/getModelData", corsm, function (request, response) {
  console.log("Get Emotion Data");
  var wID = request.body.watchID;
  if (typeof wID !== "undefined" && wID !== null) {
    var tableName = wID + "Model";
    let sqlGetOrder = `SELECT * FROM ${tableName} ORDER BY ImageSeq`;
    let queryGetOrder = db.query(sqlGetOrder, (err, result, fields) => {
      if (err) throw err;
      response.status(200).send({ result: result });
    });
  }
});

app.post("/api/logging", corsm, function (request, response) {
  var blobText = request.body.text;
  var fileName = "output/" + request.body.wID + ".txt";
  if (blobText == "create") {
    fs.open(fileName, function (err, file) {
      if (err);
    });
  } else if (blobText == "delete") {
    fs.unlink(fileName, function (err, file) {
      if (err);
    });
  } else {
    fs.appendFile(fileName, blobText, function (err) {
      if (err) console.log(err);
      response.end();
    });
  }
  response.status(200);
  //return;
});

app.post("/api/reading", corsm, function (request, response) {
  var wID = request.body.watchID;
  var fileName = "output/" + wID + ".txt";
  var inside;
  fs.readFile(fileName, function read(err, data) {
    if (err) {
    }
    inside = data;
    console.log("wid: \n" + wID);
    console.log("data: \n" + data);
    response.send({ inside: inside });
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000!");
});
