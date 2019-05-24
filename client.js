var id = 1;
var url = 'http://127.0.0.1:3000/id/' + id;
var px, py, r;


function setup() {
  createCanvas(600, 600);
  
  px = width/2;
  py = height/2;
  r = 50;
  
}

function draw() {
  background(0);
  
  noStroke();
  fill(200, 100, 50);
  ellipse(px, py, r);
  
}

function mouseClicked() {
  px = mouseX;
  py = mouseY;
  
  var tx = round(map(px, 0, width, 0, 100));
  var ty = round(map(py, 0, height, 360, 0));
  
  httpGet(url + "/x/" + tx + "/y/" + ty, function(response) {
    console.log(response);
  });

}