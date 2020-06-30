var x;
var y;
var canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
var coords1;
var coords2;

var black = "#000000";
var magenta = "#cf60cf";

var circleColours = new Array();
var handeSize;

console.log(window.innerWidth)
console.log(window.innerHeight)

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth-50;
    canvas.height = window.innerHeight-75;

    if(window.innerWidth > 1900){
        coords1 = [50, canvas.width*1/5, canvas.width*2/5-50, canvas.width*3/5+50, canvas.width*4/5, canvas.width-50];
        coords2 = [50, canvas.height*1/4, canvas.height/2, canvas.height*3/4, canvas.height-35 ];
        handeSize = 30;
    }
    else{
        coords1 = [50, canvas.width*1/5, canvas.width*2/5-50, canvas.width*3/5+50, canvas.width*4/5, canvas.width-50];
        coords2 = [50, canvas.height*1/4+50, canvas.height/2+25, canvas.height*3/4, canvas.height-35 ];
        handeSize = 20;
    }

    for(var i=0; i<(coords1.length*coords2.length); i++){
        circleColours.push("#60cfcf");
    }
    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */    

}


function drawStuff() {
    var prediction = webgazer.getCurrentPrediction();
    if (prediction) {
        x = prediction.x;
        y = prediction.y;
    }
    
    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = black; // Red color
    var txt = "Please, make sure you have proper lighting. Green eyes should fits your eyes. Then, click the blue dots."
    ctx.font = "30px Times New Roman";
    ctx.fillText(txt, (window.innerWidth-ctx.measureText(txt).width)/2, 150);  
    
    

    for(var i = 0; i < coords1.length; i++)
        for(var j = 0; j < coords2.length; j++){
            ctx.fillStyle = circleColours[(i*coords2.length)+j];
            ctx.beginPath();
            ctx.arc(coords1[i], coords2[j], handeSize, 0, Math.PI * 2, true);
            ctx.fill();
        }
    

    ctx.beginPath();
    ctx.arc(x-15, y-15, 15, 0, Math.PI * 2);
    ctx.stroke();

}


function clickFunction(event){
    ctx.fillStyle = black; 
    var xPosition = event.clientX;
    var yPosition = event.clientY;
    var distance = new Array();
    console.log("coor x: " +coords1.length );
    for(var i = 0; i < coords1.length; i++){
        for(var j = 0; j < coords2.length; j++){
            var a = xPosition -coords1[i];
            var b = yPosition - coords2[j];

            var c = Math.sqrt( a*a + b*b );
            distance.push(c);

        }
    }
    console.log("x: "+xPosition+" y: " +yPosition);
    console.log(distance.length);
    var shortest = Math.min(...distance);
    console.log(shortest);
    var index;
    for(var i=0; i<distance.length; i++)
    {
        if(distance[i]==shortest)
            index=i;
    }
    if(shortest<=handeSize+10)
        circleColours[index] = "#000000";
}
resizeCanvas();

// webgazer.clear();
webgazer.setTracker("clmtrackr");

if(window.innerWidth > 1900)
    webgazer.begin(true, 35, 41);
else if (window.innerWidth > 1500)
    webgazer.begin(true, 33, 38.5);
else
    webgazer.begin(true, 33, 37);

// webgazer.showPredictionPoints(true);

// webgazer.showVideo(false);
// webgazer.showFaceOverlay(false);
// webgazer.showFaceFeedbackBox(false);

setInterval(drawStuff, 150); 