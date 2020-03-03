//================================ Global ================================
// staging
var MULTI = 7;

// stage holder
var stage = MULTI;

// socket.io
var socket = io.connect();


// multi
var fs = false;
var rectColor = [];
var synths = [];
var loops = [];
var notes = ["C3", "D3", "E1", "F3", "G3"];
var durs = ["8n", "16n", "8n", "16n", "8n"];
var intervals = ["4n", "4n", "4n", "4n", "4n"];
var vols = [];
var blinkCoverAlpha = [0, 0, 0, 0, 0];

//================================ setup() ================================
function setup() {

    // createCanvas(innerWidth-20, innerHeight-20);
    createCanvas(windowWidth-20, windowHeight-20);

    colorMode(HSB);
    rectColor = [[195, 53, 79], [210, 14, 53], [180, 25, 25], [0, 25, 65], [180, 100, 25]];

    // set stage - bind to key pressed to control manually
    stage = MULTI;

    synths[0] = new Tone.Synth();
    synths[1] = new Tone.AMSynth();
    synths[2] = new Tone.MembraneSynth();
    synths[3] = new Tone.FMSynth();
    synths[4] = new Tone.PluckSynth();
    vols[0] = new Tone.Volume(-12);
    vols[1] = new Tone.Volume(-12);
    vols[2] = new Tone.Volume(-26);
    vols[3] = new Tone.Volume(-20);
    vols[4] = new Tone.Volume(-12);
    synths[0].chain(vols[0], Tone.Master);
    synths[1].chain(vols[1], Tone.Master);
    synths[2].chain(vols[2], Tone.Master);
    synths[3].chain(vols[3], Tone.Master);
    synths[4].chain(vols[4], Tone.Master);

    loops[0] = new Tone.Loop(function(time) {
        synths[0].triggerAttackRelease(notes[0], durs[0], time);
        blinkCoverAlpha[0] = 255;
    }, "2n");

    loops[1] = new Tone.Loop(function(time) {
        synths[1].triggerAttackRelease(notes[1], durs[1], time);
        blinkCoverAlpha[1] = 255;
    }, "2n");

    loops[2] = new Tone.Loop(function(time) {
        synths[2].triggerAttackRelease(notes[2], durs[2], time);
        blinkCoverAlpha[2] = 255;
    }, "2n");

    loops[3] = new Tone.Loop(function(time) {
        synths[3].triggerAttackRelease(notes[3], durs[3], time);
        blinkCoverAlpha[3] = 255;
    }, "2n");

    loops[4] = new Tone.Loop(function(time) {
        synths[4].triggerAttackRelease(notes[4], durs[4], time);
        blinkCoverAlpha[4] = 255;
    }, "2n");


}


//================================ draw() ================================

function draw() {

    switch(stage) {
        case MULTI:
            colorMode(RGB);
            background(0);
            stroke(255);

            ellipse(width/2, height/2, 100, 100);


            for (var i = 0; i < 5; i++) {

                if (blinkCoverAlpha[i] > 0) {
                    blinkCoverAlpha[i]-=25.5/2; // blinking speed
                }

                colorMode(HSB);
                fill(color(rectColor[i][0], rectColor[i][1], rectColor[i][2]));
                rect(i * width/5, 0, width/5, height);

                // for blinking
                colorMode(RGB);
                fill(255, blinkCoverAlpha[i]);
                rect(i * width/5, 0, width/5, height);
            }


            break;

        default:
            break;
    }

 
}


//================================== socket.io handler ==================================
// socket.io callback


// ========== STAGING ==========
socket.on('setStage', function(_data) {
    // console.log("Go to stage " + _data.value);
    stage = parseInt(_data.value);
});


// ========== 7 ==========
socket.on('control', function(_data) {
    // console.log(_data);
    var id = _data.id;
    var x = _data.x;
    var y = _data.y;


    rectColor[id - 1][0] = y; // hue
    rectColor[id - 1][1] = x; // saturation

    notes[id - 1] = Tone.Frequency(y).toNote();
    intervals[id - 1] = Tone.TimeBase(round(map(x, 0, 100, 1, 16)), "n").toSeconds();
    // console.log(intervals[id -1]);
    loops[id - 1].interval = intervals[id - 1];

});


//================================== control function ==================================
function mouseClicked() {

    console.log("Tone transport toggle");


    synths[0] = new Tone.Synth();
    synths[1] = new Tone.AMSynth();
    synths[2] = new Tone.MembraneSynth();
    synths[3] = new Tone.FMSynth();
    synths[4] = new Tone.PluckSynth();
    vols[0] = new Tone.Volume(-12);
    vols[1] = new Tone.Volume(-12);
    vols[2] = new Tone.Volume(-26);
    vols[3] = new Tone.Volume(-20);
    vols[4] = new Tone.Volume(-12);
    synths[0].chain(vols[0], Tone.Master);
    synths[1].chain(vols[1], Tone.Master);
    synths[2].chain(vols[2], Tone.Master);
    synths[3].chain(vols[3], Tone.Master);
    synths[4].chain(vols[4], Tone.Master);

 
    Tone.Transport.toggle();

    loops[0].start(0)
    loops[1].start(0)
    loops[2].start(0)
    loops[3].start(0)
    loops[4].start(0)

}

function keyTyped() {

    if (key === '0') {
        stage = LOGGING_IN;
    } else if (key === '1') {
        stage = CATCH_BALL_1;
    } else if (key === '2') {
        stage = CATCH_BALL_2;
    } else if (key === '3') {
        stage = CATCH_BALL_3;
    } else if (key === '4') {
        stage = CATCH_BALL_4;
    } else if (key === '5') {
        stage = CATCH_BALL_ENDDING;
    } else if (key === '6') {
        stage = LOGGED_OUT;
    } else if (key === '9') {
        stage = GRAPH;
    } else if (key === 'v') {
        variantBotany = 1;
    } else if (key === '7') {
        stage = MULTI;
    } else if (key === 'f') { // toggle fullscreen
        fs = !fs;
        fullscreen(fs);
    }

    // uncomment to prevent any default behavior
    return false;
  }

function windowResized() {
    resizeCanvas(windowWidth - 20, windowHeight - 20);
}