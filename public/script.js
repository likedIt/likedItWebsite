var text;

window.onload=function(){
    var button = document.getElementById("getRequestTry");
    button.addEventListener("click", denemeFonsksiyonu);

    text = document.getElementById("paragraph").textContent;

    var button2 = document.getElementById("postRequestTry");
    button2.addEventListener("click", denemeFonsksiyonu2);
}


function denemeFonsksiyonu(){
    $.get("/deneme", function(data){
        if(!data){
            console.log("Error");
        }
        console.log("Received data from get:");
        console.log(data);
    });
}

function denemeFonsksiyonu2(){
    $.post("/deneme2", 
    {
       elem1: text
    },
    function(data){
        if(!data){
            console.log("Error");
        }
        console.log("Received data from post:");
        console.log(data);
    });
}