function newUser(id, name, sname, mail){ 
  var id_token=id;
  var user_name = name;
  var surname = sname;
  var e_mail = mail;
  currentUserid = id;
  console.log("a: " + currentUserid);
	localStorage.setItem("currentId", JSON.stringify(currentUserid));
  $.post("/api/Userinsert", {idtoken:id_token, uName: user_name, sName: surname, Email: e_mail}, function(req, res){console.log("deneme");});
}
function videoDB(videoId, channel, counter, duration){
  var id= videoId;
  var ch = channel;
  var dr = duration;
  console.log("c: "+counter);
  $.post("/api/Videoinsert", {vID:id, channel: ch, duration: dr}, function(data, status){
    console.log("Data: " + data.wID);
    //localStorage.setItem("wID", data.wID);
    //console.log("vid");
  });

}




