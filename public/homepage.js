var clientId = '728540624854-0nognns8vuoqlcpqglm0r2nlq7hnkhts.apps.googleusercontent.com';
// var apiKey = 'AIzaSyDPXiX3oJI40hivnGrApNDr-34hlfQyCCU';//AIzaSyDPXiX3oJI40hivnGrApNDr-34hlfQyCCU
// var apiKey = 'AIzaSyDtyr39nJBIwTJbEUgJqWFMaNo8nf2M_GY';
var apiKey = 'AIzaSyChej04EsYDgBBTweAEQiqlQ6PgY6nlpK0';
var scopes = 'profile https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/youtube';
var URL = 'https://www.googleapis.com/youtube/v3/videos'
var currId = 000;
var ready=0;
var token;
var user_name;
var time;
var current;
localStorage.setItem("userName", JSON.stringify(user_name));
function authenticate() {
      
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
        .then(function() { if (gapi.auth2.getAuthInstance().isSignedIn.get() ){
                
                var user = gapi.auth2.getAuthInstance().currentUser.get();
                var profile = auth2.currentUser.get().getBasicProfile();

                var id_token;
                var user_name;
                var surname;
                var e_mail;

            /////token is 1260 characters. it can't be primary key in db. So user ıd will be used as token
                token = user.getAuthResponse().id_token;
                id_token = profile.getId();
                user_name = profile.getGivenName();
                surname = profile.getFamilyName();
                e_mail = profile.getEmail();
                localStorage.setItem("user_name", JSON.stringify(user_name));
                document.getElementById("slideText").innerHTML = "Hi " + user_name + ". You look awesome today! <br /> If you are new, please, visit how to use page!";
                current= JSON.parse(localStorage.getItem("currId"));
                console.log("temp " + current)
                // console.log("temp id " + user.getAuthResponse().id_token)
                if(current==0 || JSON.parse(localStorage.getItem("currId"))== "undefined" || !JSON.parse(localStorage.getItem("currId"))){
                    currId = id_token;
                    console.log("30: "+currId);
                    //$.post("/api/deneme", {curUser: currId}, function(req, res){});
                    localStorage.setItem("currId", JSON.stringify(currId));
                    likes().then(dislikes);
                            
                }else{	
                    document.getElementById("btn_sign").textContent = "Sign Out";
                    currId=JSON.parse(localStorage.getItem("currId"));	
                    //$.post("/api/deneme", {curUser: currId}, function(req, res){});
                    localStorage.setItem("currId", JSON.stringify(currId));
                }
                

                newUser(id_token, user_name, surname, e_mail);
                document.getElementById("btn_sign").textContent = "Sign Out";
            //document.getElementById('btn_sign').textContent= "Sign Out";
          } },
            function(err) { console.error("Error signing in", err); });
}
 
// Handle logout
function handleSignoutClick() {

    //document.getElementById('btn_sign').textContent= "Sign Up";
    user_name="";
    localStorage.setItem("userName", JSON.stringify(user_name));
    document.getElementById("slideText").innerHTML = "Welcome to LikedIt! <br /> If you are new, please, visit how to use page!";
    gapi.auth2.getAuthInstance().signOut();
    currId = 000;
    results = [];
    console.log("46: "+currId);
    $.post("/api/deneme", {curUser: currId}, function(req, res){});
    localStorage.setItem("currId", JSON.stringify(0));
    document.getElementById("btn_sign").textContent = "Sign Up";
    exit();
}


function loadClient() {
    gapi.client.setApiKey(apiKey);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() {},
            function(err) { console.error("Error loading GAPI client for API", err); });
}


function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}


function execute() {
    return gapi.client.youtube.videos.list({
    "part": "snippet,contentDetails,statistics",
    "chart": "mostPopular",
    "maxResults": 6
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                for (let i = 0; i < 6; i++) {
               
                     const video = response.result.items[i];
                     const title = video.snippet.title;
                     const channel = video.snippet.channelTitle;
                     const viewCount = video.statistics.viewCount;

                     document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
                     document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
                     document.getElementById('title' + (i+1)).textContent = title;
                     document.getElementById('channel' + (i+1)).textContent = channel;
                     document.getElementById('viewCount' + (i+1)).textContent = viewCount + " views";
                     document.getElementById('video' + (i+1)).addEventListener("click", onClck, false);
                     document.getElementById('title' + (i+1)).addEventListener("click", onClck, false);
                    
                }
                document.getElementById('channel1').href = "https://tr.linkedin.com/in/elifberilsayli";
                document.getElementById('channel2').href = "https://www.instagram.com/elifberilsayli/";
                document.getElementById('channel3').href = "https://github.com/ElifBerilSayli";
            },
            function(err) { console.error("Execute error", err); });
}

function onClck(){
    var current= JSON.parse(localStorage.getItem("currId"));
    console.log("current: " + current)
    if(current == 0){
        alert('You have to sign up first!');
        authenticate();
        event.preventDefault();
    }
}


function executeTR() {
    
    return gapi.client.youtube.videos.list({
        "part": "snippet,contentDetails,statistics",
        "chart": "mostPopular",
        "regionCode": "TR",
        "maxResults": 6
        })
            .then(function(response) {
                
                    // Handle the results here (response.result has the parsed body).
                    for (let i = 0; i < 6; i++) {

                         const video = response.result.items[i];
                         const title = video.snippet.title;
                         const channel = video.snippet.channelTitle;
                         const viewCount = video.statistics.viewCount;
                         
                         document.getElementById('videoTR' + (i+1)).src = video.snippet.thumbnails.medium.url;
                         document.getElementById('videoTR' + (i+1)).parentElement.href = document.getElementById('titleTR' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
                         document.getElementById('titleTR' + (i+1)).textContent = title;
                         document.getElementById('channelTR' + (i+1)).textContent = channel;
                         document.getElementById('viewCountTR' + (i+1)).textContent = viewCount + " views";
                        
                    }
                },
                function(err) { console.error("Execute error", err); });
                
}

function getselection(){
    timeOpt = document.getElementById("date");
     time = timeOpt.options[timeOpt.selectedIndex].text;

    console.log(time);
    $("#div1").empty();
    hande();
}

var results = [];
var watchIDHande = [];
var watchTimes = [];
function hande() {
    return gapi.client.youtube.videos.list({
        "part": "snippet,contentDetails,statistics",
        "id": results,
        "maxResults": results.length
        })
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).                   
                    today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //As January is 0.
                    var yyyy = today.getFullYear();
                    var dayNum = today.getDay();
                    console.log(time);
                    for (let i = 0; i < results.length; i++) {
                        var day = watchTimes[i].toString().substring(8, 10);
                        var month = watchTimes[i].toString().substring(5, 7);
                        console.log(watchTimes[i]);

                        if(time==="Today" || time==null || time==""){
                            if(day == dd){
                                var div = document.createElement("div");
                                var divInner = document.createElement("div");
                                var divSecondInner = document.createElement("div");
                                var a = document.createElement("a");
                                var img = document.createElement("img");
                                var aTitle = document.createElement("a"); 
                                var h3 = document.createElement("h3");

                                div.class="col-md-4 resent-grid recommended-grid slider-top-grids";
                                div.id="div2_"+(i+1);

                                divInner.class="resent-grid-img recommended-grid-img";
                                divInner.id="div3_"+(i+1);

                                divSecondInner.class="resent-grid-info recommended-grid-info";
                                divSecondInner.id="div3_2_"+(i+1);

                                aTitle.class = "title title-info";
                                aTitle.id="title"+(i+1);
                                

                                img.src="";
                                img.id="video"+(i+1);
                                img.alt="";
                                img.name="";
                                img.ALIGN="left";
                                
                                document.getElementById("div1").appendChild(div);
                                document.getElementById("div2_"+(i+1)).appendChild(divInner);
                                document.getElementById("div2_"+(i+1)).appendChild(divSecondInner);
                                document.getElementById("div3_2_"+(i+1)).appendChild(h3);
                                document.getElementById("div3_"+(i+1)).appendChild(a);
                                h3.appendChild(a);
                                a.appendChild(img);
                                h3.appendChild(aTitle);


                                const video = response.result.items[i];
                                const title = video.snippet.title;
                                const channel = video.snippet.channelTitle;
                                document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
                                document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "feedback.html?id=" + video.id + "&title=" + title + "&w=" + watchIDHande[i];
                                            
                                
                                document.getElementById('video' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                                document.getElementById('title' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                                
                                document.getElementById('title' + (i+1)).innerHTML ="  "+ title;
                                if(watchTimes[i] != null)
                                {
                                    var date = new Date(watchTimes[i]);
                                    document.getElementById('title' + (i+1)).innerHTML += "<br/> Watch Date: " + date.toString().substring(0, 25);
                                }
                            

                            }
                        }else if(time==="All"){
                            var div = document.createElement("div");
                            var divInner = document.createElement("div");
                            var divSecondInner = document.createElement("div");
                            var a = document.createElement("a");
                            var img = document.createElement("img");
                            var aTitle = document.createElement("a"); 
                            var h3 = document.createElement("h3");

                            div.class="col-md-4 resent-grid recommended-grid slider-top-grids";
                            div.id="div2_"+(i+1);

                            divInner.class="resent-grid-img recommended-grid-img";
                            divInner.id="div3_"+(i+1);

                            divSecondInner.class="resent-grid-info recommended-grid-info";
                            divSecondInner.id="div3_2_"+(i+1);

                            aTitle.class = "title title-info";
                            aTitle.id="title"+(i+1);
                            
                            img.src="";
                            img.id="video"+(i+1);
                            img.alt="";
                            img.name="";
                            img.ALIGN="left";
                            
                            document.getElementById("div1").appendChild(div);
                            document.getElementById("div2_"+(i+1)).appendChild(divInner);
                            document.getElementById("div2_"+(i+1)).appendChild(divSecondInner);
                            document.getElementById("div3_2_"+(i+1)).appendChild(h3);
                            document.getElementById("div3_"+(i+1)).appendChild(a);
                            h3.appendChild(a);
                            a.appendChild(img);
                            h3.appendChild(aTitle);


                            const video = response.result.items[i];
                            const title = video.snippet.title;
                            const channel = video.snippet.channelTitle;
                            document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
                            document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "feedback.html?id=" + video.id + "&title=" + title + "&w=" + watchIDHande[i];
                                        
                            
                            document.getElementById('video' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                            document.getElementById('title' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                            
                            document.getElementById('title' + (i+1)).innerHTML ="  "+ title;
                            if(watchTimes[i] != null)
                            {
                                var date = new Date(watchTimes[i]);
                                document.getElementById('title' + (i+1)).innerHTML += "<br/> Watch Date: " + date.toString().substring(0, 25);
                            }
                        }else if(time==="This month"){
                            if(mm==month){
                                var div = document.createElement("div");
                                var divInner = document.createElement("div");
                                var divSecondInner = document.createElement("div");
                                var a = document.createElement("a");
                                var img = document.createElement("img");
                                var aTitle = document.createElement("a"); 
                                var h3 = document.createElement("h3");

                                div.class="col-md-4 resent-grid recommended-grid slider-top-grids";
                                div.id="div2_"+(i+1);

                                divInner.class="resent-grid-img recommended-grid-img";
                                divInner.id="div3_"+(i+1);

                                divSecondInner.class="resent-grid-info recommended-grid-info";
                                divSecondInner.id="div3_2_"+(i+1);

                                aTitle.class = "title title-info";
                                aTitle.id="title"+(i+1);
                                
                                img.src="";
                                img.id="video"+(i+1);
                                img.alt="";
                                img.name="";
                                img.ALIGN="left";
                                
                                document.getElementById("div1").appendChild(div);
                                document.getElementById("div2_"+(i+1)).appendChild(divInner);
                                document.getElementById("div2_"+(i+1)).appendChild(divSecondInner);
                                document.getElementById("div3_2_"+(i+1)).appendChild(h3);
                                document.getElementById("div3_"+(i+1)).appendChild(a);
                                h3.appendChild(a);
                                a.appendChild(img);
                                h3.appendChild(aTitle);


                                const video = response.result.items[i];
                                const title = video.snippet.title;
                                const channel = video.snippet.channelTitle;
                                document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
                                document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "feedback.html?id=" + video.id + "&title=" + title + "&w=" + watchIDHande[i];
                                            
                                
                                document.getElementById('video' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                                document.getElementById('title' + (i+1)).addEventListener("click", function(){onClck2(i);}, false);
                                
                                document.getElementById('title' + (i+1)).innerHTML ="  "+ title;
                                if(watchTimes[i] != null)
                                {
                                    var date = new Date(watchTimes[i]);
                                    document.getElementById('title' + (i+1)).innerHTML += "<br/> Watch Date: " + date.toString().substring(0, 25);
                                }
                            }
                        }
                    }
                },
                function(err) { console.error("Execute error", err); });
}


function onClck2(i){
    event.preventDefault();
    $.post("/api/isSuccess", {watchID:watchIDHande[i]}).success(function(data, status){
        var ready = data.imageNumber;
        if(ready==0){
            alert('Please wait. This analyze is not ready!');
        }
        else{
            window.location.href = document.getElementById('video' + (i+1)).parentElement.href;
        }
    });

    
    // document.getElementById("video"+(i+1)).onclick = function (){
    //     $.post("/api/isSuccess", {watchID:watchIDHande[i]}).success(function(data, status){
    //         var rowNum = data.imageNum;
    //         // var imgArray =  data.imageNumber;//JSON.parse(localStorage.getItem("imgArray"));

    //         // var rowNumInArray = data.imageNumber;
    //         // console.log("rowNum: " + rowNum);
    //         // console.log("rowNumInArray: " + rowNumInArray);
    //         // if( -5 <= (rowNum - rowNumInArray) <= 5)
    //         //     ready = 1;
    //         // console.log("Ready: " + ready);
    //         var ready = data.imageNumber;
    //         if(ready==0)
    //             return confirm('Please wait. This analyze is not ready!');
    //         else
    //             document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "feedback.html?id=" + video.id + "&title=" + title + "&w=" + watchIDHande[i];
    //             document.getElementById('video' + (i+1)).click();
    //     });
        
    // };
    // document.getElementById("title"+(i+1)).onclick = function (){
    //     $.post("/api/isSuccess", {watchID:watchIDHande[i]}).success(function(data, status){
    //         var rowNum = data.imageNum;
    //         //var imgArray =  JSON.parse(localStorage.getItem("imgArray"));
    //         // var rowNumInArray = data.imageNumber;//JSON.parse(localStorage.getItem("imgArray"));
    //         // console.log("rowNum: " + rowNum);
    //         // console.log("rowNumInArray: " + rowNumInArray);
    //         // if(  -5 <= (rowNum - rowNumInArray) <= 5)
    //         //     ready = 1;
    //         // console.log("Ready: " + ready);
    //         var ready = data.imageNumber;
            
    //         if(ready==0)
    //             return confirm('Please wait. This analyze is not ready!');
    //         else
    //             document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "feedback.html?id=" + video.id + "&title=" + title + "&w=" + watchIDHande[i];
    //             document.getElementById('video' + (i+1)).click();
    //     });

    // };
    
}



var trendResults = [];
var scores=[];
var trendView=[];
function trendVideos() {
    return gapi.client.youtube.videos.list({
        "part": "snippet,contentDetails,statistics",
        "id": trendResults,
        "maxResults": 6
    })
    .then(function(response) {
        for (let i = 0; i < 6; i++) {
            console.log(scores[i]);
            var videoScore=scores[i]*100;

            const video = response.result.items[i];
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            
            document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
            document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
            document.getElementById('title' + (i+1)).textContent = title;
            document.getElementById('channel' + (i+1)).textContent = channel;
            document.getElementById('viewCount' + (i+1)).textContent = "Liked: " + videoScore + " %";
            document.getElementById('vviewCount' + (i+1)).textContent = "View: " + trendView[i];
            
        }
    },
    function(err) { console.error("Execute error", err); });
}

var happyResults = [];
var happyScores=[];
var happyView=[];
function happyVideos() {
    return gapi.client.youtube.videos.list({
        "part": "snippet,contentDetails,statistics",
        "id": happyResults,
        "maxResults": 6
    })
    .then(function(response) {
        for (let i = 0; i < 6; i++) {
            console.log(happyScores[i]);
            var videoScore=happyScores[i];

            const video = response.result.items[i];
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            
            document.getElementById('Hvideo' + (i+1)).src = video.snippet.thumbnails.medium.url;
            document.getElementById('Hvideo' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
            document.getElementById('Htitle' + (i+1)).textContent = title;
            document.getElementById('Hchannel' + (i+1)).textContent = channel;
            document.getElementById('HviewCount' + (i+1)).textContent = "Happy: " + videoScore + " %";
            document.getElementById('vHviewCount' + (i+1)).textContent = "View: " + happyView[i];
            
        }
    },
    function(err) { console.error("Execute error", err); });
}
var surpResults = [];
var surpScores=[];
var surpView=[];
function surpVideos(){
    return gapi.client.youtube.videos.list({
        "part": "snippet,contentDetails,statistics",
        "id": surpResults,
        "maxResults": 6
    })
    .then(function(response) {
        for (let i = 0; i < 6; i++) {
            console.log(surpScores[i]);
            var videoScore=surpScores[i];

            const video = response.result.items[i];
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            
            document.getElementById('Svideo' + (i+1)).src = video.snippet.thumbnails.medium.url;
            document.getElementById('Svideo' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
            document.getElementById('Stitle' + (i+1)).textContent = title;
            document.getElementById('Schannel' + (i+1)).textContent = channel;
            document.getElementById('SviewCount' + (i+1)).textContent = "Surprised: " + videoScore + " %" ;
            document.getElementById('vSviewCount' + (i+1)).textContent = "View: " + surpView[i];
            
        }
    },
    function(err) { console.error("Execute error", err); });
}

gapi.load('auth2', function() {
    auth2 = gapi.auth2.init({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/youtube.readonly"
    });
            
    var current= JSON.parse(localStorage.getItem("currId"));
    console.log(current);
    if(window.location.href == 'https://likedit.tk/' || window.location.href == 'https://likedit.tk/index.html')
        if(current != 0)
            loadClient().then(likes).then(dislikes).then(execute).then(executeTR);
        else
            loadClient().then(execute).then(executeTR);
    else if(window.location.href == 'https://likedit.tk/analyze.html'){
        visibility();
    }else if(window.location.href == 'https://likedit.tk/trendsInLikedIt.html'){
        trends();
        happy();
        surp();
    }
});
function happy(){
    $.post("/api/happiestVideos", function(data, status){
        var res = data.resultHappy;
        if(res.length!=0){
            console.log(res)
            for (let index = 0; index < res.length; index++) {
                happyResults.push(res[index].videoID);
                happyScores.push(res[index].happScore);
                happyView.push(res[index].watchedNumber);
            }
            loadClient().then(happyVideos); 
        }
    });
}

function surp(){
    $.post("/api/SurpVideos", function(data, status){
        var res = data.resultSurp;
        if(res.length!=0){
            console.log(res)
            for (let index = 0; index < res.length; index++) {
                surpResults.push(res[index].videoID);
                surpScores.push(res[index].suprScore);
                surpView.push(res[index].watchedNumber);
            }
            loadClient().then(surpVideos); 
        }
    });
}

function trends(){
    $.post("/api/trendVideos", function(data, status){
        var res = data.resultTrend;
        if(res.length!=0){
            console.log(res)
            for (let index = 0; index < res.length; index++) {
                trendResults.push(res[index].videoID);
                scores.push(res[index].LikeditScore);
                trendView.push(res[index].watchedNumber);
                console.log(scores[index]);
            }
            loadClient().then(trendVideos); 
        }
    });
}

function visibility(){

     var currentId = JSON.parse(localStorage.getItem("currId"));
        console.log("ID: " + currentId);

    if(currentId >0) {
        $.post("/api/UserVideos", {currentId:JSON.parse(localStorage.getItem("currId"))}, function(data, status){
            console.log("loc stor: "+JSON.parse(localStorage.getItem("currId")));
            console.log(data.result);
            // localStorage.setItem("results", JSON.stringify(data.result));
            var res = data.result;
            if(res.length!=0){
                if(res.length > 50)
                    res.splice(1,res.length-18);
                // var data = JSON.parse(localStorage.getItem("results"));
                console.log(res)
                if(res.length!=0){
                    console.log("burdaaaa");
                    document.getElementById("videoId").style.visibility="hidden";
                    document.getElementById("clickId").style.visibility="visible";
                    
                }else{
                    document.getElementById("videoId").style.visibility="visible";
                }
                for (let index = 0; index < res.length; index++) {
                    results.push(res[index].videoID);
                    watchIDHande.push(res[index].WatchID);
                    watchTimes.push(res[index].watchDate);
                }
                
                results = results.reverse();
                watchIDHande = watchIDHande.reverse();
                watchTimes = watchTimes.reverse();
                console.log(results);
                console.log(watchIDHande);
                console.log(watchTimes);
                loadClient().then(hande); 
            }
        });
    }
    console.log("Bittim ben")
}
var count=0;


function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

$(function() {
    $("form").on("submit", function(e) {
       e.preventDefault();
       // prepare the request
       return gapi.client.youtube.search.list({
            "part": "snippet",
            order: "viewCount",
            type: "video",
            q: $("#search").val().replace(/%20/g, "+"),
            maxResults: 12,
            publishedAfter: "2015-01-01T00:00:00Z",
       })
       .then(function(response) {
            document.getElementById("searchResult").style.visibility = "visible";
            document.getElementById("searchResult").style.display = "unset";
            // document.getElementById("trends").style.visibility = "hidden";
            document.getElementById("trendsTR").style.visibility = "hidden";
            document.getElementById("trendsTR").style.display = "none";
            document.getElementById('trendVideos').style.visibility = "hidden";
            document.getElementById('trendVideos').style.display = "none";
            exit();
        // Handle the results here (response.result has the parsed body).
        for (let i = 0; i < 6; i++) {
            const video = response.result.items[i];
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            console.log(document.getElementById('video' + (i+1) + 'S'))
            console.log(document.getElementById('video' + (i+1) + 'S').parentElement)

            document.getElementById('video' + (i+1) + 'S').src = video.snippet.thumbnails.medium.url;
            document.getElementById('video' + (i+1)+ 'S').parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id.videoId +"&channel=" + channel + "&title=" + title;// + "&duration=" + duration;
            document.getElementById('title' + (i+1)+ 'S').textContent = title;
            document.getElementById('channel' + (i+1)+ 'S').textContent = channel;
        }
        for (let i = 0; i < 6; i++) {
            const video = response.result.items[i+6];
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            console.log(document.getElementById('video' + (i+1)))
            console.log(document.getElementById('video' + (i+1)).parentElement)

            document.getElementById('video' + (i+1)).src = video.snippet.thumbnails.medium.url;
            document.getElementById('video' + (i+1)).parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id.videoId +"&channel=" + channel + "&title=" + title;// + "&duration=" + duration;
            document.getElementById('title' + (i+1)).textContent = title;
            document.getElementById('channel' + (i+1)).textContent = channel;
        }
    },
    function(err) { console.error("Execute error", err); });
});
});

function likes() {
    return gapi.client.youtube.videos.list({
    "part": "snippet,contentDetails,statistics",
    "myRating": 'like',
    "maxResults": 6,
    })
        .then(function(response) {
            var number = response.result.items.length;
            if(number != 0){
                document.getElementById("liked").style.visibility = "visible";
                document.getElementById("liked").style.display = "unset";
                // Handle the results here (response.result has the parsed body).
                for (let i = 0; i < number && i < 6; i++) {
            
                    const video = response.result.items[i];
                    const title = video.snippet.title;
                    const channel = video.snippet.channelTitle;
                    const viewCount = video.statistics.viewCount;

                    document.getElementById('video' + (i+1) + 'L').src = video.snippet.thumbnails.medium.url;
                    document.getElementById('video' + (i+1) + 'L').parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
                    document.getElementById('title' + (i+1) + 'L').textContent = title;
                    document.getElementById('channel' + (i+1) + 'L').textContent = channel;
                    document.getElementById('viewCount' + (i+1) + 'L').textContent = viewCount + " views";
                    
                }
            }
        },
    function(err) { console.error("Execute error", err); });
}

function dislikes() {
    return gapi.client.youtube.videos.list({
    "part": "snippet,contentDetails,statistics",
    "myRating": "dislike",
    "maxResults": 6,
    })
        .then(function(response) {
            var number = response.result.items.length;
            if(number != 0){
                document.getElementById("disliked").style.visibility = "visible";
                document.getElementById("disliked").style.display = "unset";
                // Handle the results here (response.result has the parsed body).
                for (let i = 0; i < number && i < 6; i++) {
               
                    const video = response.result.items[i];
                    const title = video.snippet.title;
                    const channel = video.snippet.channelTitle;
                    const viewCount = video.statistics.viewCount;

                    document.getElementById('video' + (i+1) + 'D').src = video.snippet.thumbnails.medium.url;
                    document.getElementById('video' + (i+1) + 'D').parentElement.href = document.getElementById('title' + (i+1)).href = "single.html?id=" + video.id +"&channel=" + channel + "&title=" + title;
                    document.getElementById('title' + (i+1) + 'D').textContent = title;
                    document.getElementById('channel' + (i+1) + 'D').textContent = channel;
                    document.getElementById('viewCount' + (i+1) + 'D').textContent = viewCount + " views";
                }
            }
        },
    function(err) { console.error("Execute error", err); });
}

function exit() {
    document.getElementById("liked").style.visibility = "hidden";
    document.getElementById("liked").style.display = "none";
    document.getElementById("disliked").style.visibility = "hidden";
    document.getElementById("disliked").style.display = "none";
}


