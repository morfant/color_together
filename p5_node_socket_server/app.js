

// stage labels
var GRAPH = -1;
var LOGGING_IN = 0;
var CATCH_BALL_1 = 1;
var CATCH_BALL_2 = 2;
var CATCH_BALL_3 = 3;
var CATCH_BALL_4 = 4;
var CATCH_BALL_ENDDING = 5;
var LOGGED_OUT = 6;
var MULTI = 7;

// stage holder
var stage = MULTI;

var STATUS_NOT_STOPPED = 1;
var STATUS_STOPPED = 0;
var ENDING_CATCH_BALL_LIMIT = 20;
var ENDING_BALL_ID = 10;
var SOUND_OFF_ID = 11;

// libs
var express = require('express')
var app = express()
var socket = require('socket.io')
var osc = require('osc')
var server = app.listen(3000, "0.0.0.0");
var io = socket(server);
var socketClientList = [];
var socketClientListTemp = [];



// osc(udp)
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 50000,
    metadata: true
});
udpPort.open();


// control sc server directly
// udpPort.send({
//     address: "/s_new",
//     args: [
//         {
//             type: "s",
//             value: "default"
//         },
//         {
//             type: "i",
//             value: 100
//         }
//     ]
// }, "127.0.0.1", 57110);


// 4 balls each has 3 axis
var acc_obj = [{}, {}, {}, {}];
var ori_obj = [{}, {}, {}, {}];
var prev_ori_obj = [{}, {}, {}, {}];

var angvel_x_buffer = [[0], [0], [0], [0]];
var angvel_y_buffer = [[0], [0], [0], [0]];
var angvel_z_buffer = [[0], [0], [0], [0]];

var acc_x_buffer = [[0], [0], [0], [0]];
var acc_y_buffer = [[0], [0], [0], [0]];
var acc_z_buffer = [[0], [0], [0], [0]];

var acc_x_prev = [[0], [0], [0], [0]];
var acc_y_prev = [[0], [0], [0], [0]];
var acc_z_prev = [[0], [0], [0], [0]];

var acc_x_cur = [[0], [0], [0], [0]];
var acc_y_cur = [[0], [0], [0], [0]];
var acc_z_cur = [[0], [0], [0], [0]];

var vel_x_prev = [[0], [0], [0], [0]];
var vel_y_prev = [[0], [0], [0], [0]];
var vel_z_prev = [[0], [0], [0], [0]];

var vel_x_cur = [[0], [0], [0], [0]];
var vel_y_cur = [[0], [0], [0], [0]];
var vel_z_cur = [[0], [0], [0], [0]];

var vel_x = [[0], [0], [0], [0]];
var vel_y = [[0], [0], [0], [0]];
var vel_z = [[0], [0], [0], [0]];

var count_x = [[0], [0], [0], [0]];
var count_y = [[0], [0], [0], [0]];
var count_z = [[0], [0], [0], [0]];

// boolean
var isStop = [false, false, false, false];
var isRotating = [false, false, false, false];
var isFlying = [false, false, false, false];
var isPrint_not_stopped = [false, false, false, false];
var isPrint_stopped = [false, false, false, false];
var hasBallFlown = [false, false, false, false];
var CATCH_BALL_2_started = false;

// counter
var flyingCount = [0, 0, 0, 0];
var socketIdxCnt = 0;
var endingCatchBallCount = 0; // will work only on ball_3




// Enable keystroke input
var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        console.log("server down...");
        process.exit();
    } else {
        if (key === '0') {
            console.log("Go to LOGGING_IN");
            stage = LOGGING_IN;
            CATCH_BALL_2_started = false;
            endingCatchBallCount = 0;
            io.emit('setStage', {value: stage});
        } else if (key === '1') {
            console.log("Go to CATCH_BALL_1");
            stage = CATCH_BALL_1;
            // io.emit('setStage', {value: stage});
        } else if (key === '2') {
            console.log("Go to CATCH_BALL_2");
            stage = CATCH_BALL_2;
            io.emit('setStage', {value: stage});
        } else if (key === '3') {
            console.log("Go to CATCH_BALL_3");
            stage = CATCH_BALL_3;
            io.emit('setStage', {value: stage});
        } else if (key === '4') {
            console.log("Go to CATCH_BALL_4");
            stage = CATCH_BALL_4;
            io.emit('setStage', {value: stage});
        } else if (key === '5') {
            console.log("Go to CATCH_BALL_ENDING");
            stage = CATCH_BALL_ENDDING;
            io.emit('setStage', {value: stage});
        } else if (key === '6') {
            console.log("Go to LOGGEED_OUT");
            stage = LOGGED_OUT;
            io.emit('setStage', {value: stage});
        } else if (key === '9') {
            console.log("Go to GRAPH");
            stage = GRAPH;
            io.emit('setStage', {value: stage});
        } else if (key === 'z') {
            console.log("current stage: " + stage);
        } else if (key === '7') {
            console.log("Go to MULTI");
            stage = MULTI;
            io.emit('setStage', {value: stage});
        }

    }
    // write the key to stdout all normal like
    // process.stdout.write( key );
});




// server static files : index.html, sketch.js...
app.use(express.static('public'));

// http://guswnsxodlf.github.io/enable-CORS-on-express
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
})

app.get('/id/:id/x/:x/y/:y', function (req, res) {
    // console.log(req.params);
    io.emit('control', req.params);
    res.send(req.params);
}) 



/*
// handle HTTP get method 
app.get('/posx/:x/posy/:y/posz/:z', function (req, res) {
    // console.log(req.params);
    io.emit('pos', req.params);
    res.send(req.params);
}) 

app.get('/orix/:x/oriy/:y/oriz/:z', function (req, res) {
    // console.log(req.params);
    io.emit('orient', req.params);
    res.send(req.params);
})

app.get('/update/:data', function (req, res) {
    // console.log(req.params['data']);
    io.emit('updateBackground', req.params['data']);
    res.send(req.params);
}) 
*/



// socket.io callback
io.on('connection',  function(socket) {

    // for (var i = 0; i < 4; i++) {
    //     ballIsOn[i] = ballIsOn[i] + 1;
    //     console.log(ballIsOn[i]);
    // }

    var id = socket.id;
    console.log('new connection: ' + id);

    socketClientList.push(id);
    socketClientListTemp.push(id);
    console.log(socketClientList);

    // emit to client that has specific socket id.
    // echo to client
    io.to(id).emit('loggedIn', id);
    io.to(id).emit('setStage', {value: stage}); // send current state


    socket.on('disconnect', function () {
        console.log('disconnected: ' + id);

        var index = socketClientList.indexOf(id);
        if (index > -1) {
            socketClientList.splice(index, 1);
            socketClientListTemp.splice(index, 1);
        }
        console.log(socketClientList);

    });


    socket.on('ball_0', function(data){

        var ballID = 0;

        // split by '|'
        var o = data.split('|')[0]; // orientation
        var a = data.split('|')[1]; // accelerometer
        // var g = data.split('|')[2]; // accelerometer
        // console.log("ori: " + o);
        // console.log("acc: " + a);

        ori_obj[ballID] = makeOriObj(o, 3); // it should change to be more simple process.
        acc_obj[ballID] = makeAccObj(a, 2); // (obj, threshold to zero)
        // g_obj[ballID] = makeGObj(g, 1); // (obj, threshold to zero)

        // console.log(acc_obj[ballID]);

        if (stage == GRAPH) {
            // send for drawing graph
            io.emit('acc'+ballID, acc_obj[ballID]);
            io.emit('ori'+ballID, ori_obj[ballID]);
            // io.emit('g'+ballID, g_obj[ballID]);
        }

        if (stage == LOGGING_IN) {
            socketIdxCnt = 0;
        }

        if (stage != LOGGED_OUT) {
            isRotating[ballID] = checkSpin(ballID, 20, 20);
            isStop[ballID] = checkStop(ballID, 1, 10);
        }

        // ********** WHEN BALL IS STOP ********** 
        if (isStop[ballID] && !isRotating[ballID]) {
            isFlying[ballID] = false;

            if (!isPrint_stopped[ballID]){
                console.log("ball " + ballID + " is stopped!!!!")
                isPrint_stopped[ballID] = true;
                isPrint_not_stopped[ballID] = false;
            }

            // osc to supercollider
            // SOUND
            udpPort.send({
                address: "/isBallStopped",
                args: [
                    // { type: "i", value: ballID },
                    // { type: "i", value: STATUS_STOPPED },
                    { type: "i", value: stage}, // 0, 1, 2, 3, 4, 5, 6
                    { type: "i", value: STATUS_STOPPED },
                    // { type: "i", value: endingCatchBallCount} // set amp using count
                ]
            }, "127.0.0.1", 57120);


            // VISUAL - on stop
            if (stage == CATCH_BALL_1) {
                // console.log("stage CATCH_BALL_1");

                if (hasBallFlown[ballID]) {
                    // emit to all client sequencely
                    var id = socketClientList[socketIdxCnt];
                    var len = socketClientList.length;

                    if (socketIdxCnt < len) {
                        console.log(id);
                        io.to(id).emit('setStage', {value: CATCH_BALL_1});
                        socketIdxCnt++;
                    } else {
                        socketIdxCnt = 0;
                    }

                    console.log(socketIdxCnt + "/" + len);
                    hasBallFlown[ballID] = false;
                }

            } else if (stage == CATCH_BALL_2) {
                if (hasBallFlown[ballID]) {
                    // broadcast
                    io.emit('variantBotany', {value: 1});
                    hasBallFlown[ballID] = false;
                }
            } else if (stage == CATCH_BALL_3) {
                if (hasBallFlown[ballID]) {
                    // broadcast
                    io.emit('variantBotany', {value: 1});
                    io.emit('drawImages', {value: 0, _alpha: 0}); // trajectory images
                    hasBallFlown[ballID] = false;
                }
            } else if (stage == CATCH_BALL_4) {
                // broadcast
                // if (ballID == 2) io.emit('drawText', {value: 1});
                io.emit('drawText', {value: 1});
            } else if (stage == CATCH_BALL_ENDDING) {
                // broadcast
                // ori_obj.x can not be 1000. This is a sign about it.
                io.emit('setBackground', {value: 1000}); // make background color as white

                if (hasBallFlown[ballID]) {
                    endingCatchBallCount++;
                    // console.log("endingCatchBallCount: " + endingCatchBallCount);
                    hasBallFlown[ballID] = false;
                }

                if (endingCatchBallCount > (ENDING_CATCH_BALL_LIMIT + 1)) {

                    // final falling
                    // sound off
                    udpPort.send({
                        address: "/isBallStopped",
                        args: [
                            { type: "i", value: SOUND_OFF_ID}
                        ]
                    }, "127.0.0.1", 57120);

                    // chage stage
                    stage = LOGGED_OUT;
                    io.emit('setStage', {value: LOGGED_OUT});

                } else if (endingCatchBallCount > ENDING_CATCH_BALL_LIMIT) {

                    // console.log("over limit count")
                    // SOUND
                    udpPort.send({
                        address: "/isBallStopped",
                        args: [
                            { type: "i", value: ENDING_BALL_ID}, // specific number for represent over count limit
                            { type: "i", value: STATUS_STOPPED} 
                        ]
                    }, "127.0.0.1", 57120);
                }
            }  
        } else {

            // ********** WHEN BALL IS FLYING ********** 

            isFlying[ballID] = true;
            if (!isPrint_not_stopped[ballID]){
                console.log("ball " + ballID + " is NOT stopped!!");
                isPrint_not_stopped[ballID] = true;
                isPrint_stopped[ballID] = false;
            }

            // SOUND
            udpPort.send({
                address: "/isBallStopped",
                args: [
                    // { type: "i", value: ballID},
                    { type: "i", value: stage}, // 0, 1, 2, 3, 4, 5, 6
                    { type: "i", value: STATUS_NOT_STOPPED },
                    { type: "f", value: acc_obj[ballID].x },
                    { type: "f", value: acc_obj[ballID].y },
                    { type: "f", value: acc_obj[ballID].z },
                    { type: "f", value: ori_obj[ballID].x },
                    { type: "f", value: ori_obj[ballID].y },
                    { type: "f", value: ori_obj[ballID].z },

                ]
            }, "127.0.0.1", 57120);


            if (stage == CATCH_BALL_1) {

                hasBallFlown[ballID] = true;
            } else if (stage == CATCH_BALL_2) {

                if (!CATCH_BALL_2_started){
                    io.emit('drawFirstBotany', {value: 1});
                    CATCH_BALL_2_started = true;
                } 

                hasBallFlown[ballID] = true;
                io.emit('setRotation', {value: ori_obj[ballID].x});

            } else if (stage == CATCH_BALL_3) {
                hasBallFlown[ballID] = true;
                // if (isMultipleBallFlying() == true) {
                    // io.emit('multipleBallFlying', {value: 1});
                    io.emit('drawImages', {value: 1, _alpha: ori_obj[ballID].x});
                // }

            }

            else if (stage == CATCH_BALL_4) {
                // if (ballID == 2) io.emit('drawText', {value: 0});
                io.emit('drawText', {value: 0});
                // io.emit('setRotation', {value: ori_obj[ballID].x});
            }

            else if (stage == CATCH_BALL_ENDDING) {
                // broadcast
                var sumAcc = Math.abs(acc_obj[ballID].x) + Math.abs(acc_obj[ballID].y) + Math.abs(acc_obj[ballID].z);
                io.emit('setBackground', {value: sumAcc});
                hasBallFlown[ballID] = true;
            } 

        }

    });

    socket.on('ball_1', function(data){

        var ballID = 0;

        // split by '|'
        var o = data.split('|')[0]; // orientation
        var a = data.split('|')[1]; // accelerometer
        // var g = data.split('|')[2]; // accelerometer
        // console.log("ori: " + o);
        // console.log("acc: " + a);

        ori_obj[ballID] = makeOriObj(o, 3); // it should change to be more simple process.
        acc_obj[ballID] = makeAccObj(a, 2); // (obj, threshold to zero)
        // g_obj[ballID] = makeGObj(g, 1); // (obj, threshold to zero)

        // console.log(acc_obj[ballID]);

        if (stage == GRAPH) {
            // send for drawing graph
            io.emit('acc'+ballID, acc_obj[ballID]);
            io.emit('ori'+ballID, ori_obj[ballID]);
            // io.emit('g'+ballID, g_obj[ballID]);
        }

        if (stage == LOGGING_IN) {
            socketIdxCnt = 0;
        }

        if (stage != LOGGED_OUT) {
            isRotating[ballID] = checkSpin(ballID, 20, 20);
            isStop[ballID] = checkStop(ballID, 1, 10);
        }

        // ********** WHEN BALL IS STOP ********** 
        if (isStop[ballID] && !isRotating[ballID]) {
            isFlying[ballID] = false;

            if (!isPrint_stopped[ballID]){
                console.log("ball " + ballID + " is stopped!!!!")
                isPrint_stopped[ballID] = true;
                isPrint_not_stopped[ballID] = false;
            }

            // osc to supercollider
            // SOUND
            udpPort.send({
                address: "/isBallStopped",
                args: [
                    { type: "i", value: stage},
                    { type: "i", value: STATUS_STOPPED },
                    // { type: "i", value: endingCatchBallCount} // set amp using count
                ]
            }, "127.0.0.1", 57120);


            // VISUAL - on stop
            if (stage == CATCH_BALL_1) {
                // console.log("stage CATCH_BALL_1");

                if (hasBallFlown[ballID]) {
                    // emit to all client sequencely
                    var id = socketClientList[socketIdxCnt];
                    var len = socketClientList.length;

                    if (socketIdxCnt < len) {
                        console.log(id);
                        io.to(id).emit('setStage', {value: CATCH_BALL_1});
                        socketIdxCnt++;
                    } else {
                        socketIdxCnt = 0;
                    }

                    console.log(socketIdxCnt + "/" + len);
                    hasBallFlown[ballID] = false;
                }

            } else if (stage == CATCH_BALL_2) {
                if (hasBallFlown[ballID]) {
                    // broadcast
                    io.emit('variantBotany', {value: 1});
                    hasBallFlown[ballID] = false;
                }
            } else if (stage == CATCH_BALL_3) {
                if (hasBallFlown[ballID]) {
                    // broadcast
                    io.emit('variantBotany', {value: 1});
                    io.emit('drawImages', {value: 0, _alpha: 0}); // trajectory images
                    hasBallFlown[ballID] = false;
                }
            } else if (stage == CATCH_BALL_4) {
                // broadcast
                // if (ballID == 2) io.emit('drawText', {value: 1});
                io.emit('drawText', {value: 1});
            } else if (stage == CATCH_BALL_ENDDING) {
                // broadcast
                // ori_obj.x can not be 1000. This is a sign about it.
                io.emit('setBackground', {value: 1000}); // make background color as white

                if (hasBallFlown[ballID]) {
                    endingCatchBallCount++;
                    // console.log("endingCatchBallCount: " + endingCatchBallCount);
                    hasBallFlown[ballID] = false;
                }

                if (endingCatchBallCount > (ENDING_CATCH_BALL_LIMIT + 1)) {

                    // final falling
                    // sound off
                    udpPort.send({
                        address: "/isBallStopped",
                        args: [
                            { type: "i", value: SOUND_OFF_ID}
                        ]
                    }, "127.0.0.1", 57120);

                    // chage stage
                    stage = LOGGED_OUT;
                    io.emit('setStage', {value: LOGGED_OUT});

                } else if (endingCatchBallCount > ENDING_CATCH_BALL_LIMIT) {

                    // console.log("over limit count")
                    // SOUND
                    udpPort.send({
                        address: "/isBallStopped",
                        args: [
                            { type: "i", value: ENDING_BALL_ID}, // specific number for represent over count limit
                            { type: "i", value: STATUS_STOPPED} 
                        ]
                    }, "127.0.0.1", 57120);
                }
            }  
        } else {

            // ********** WHEN BALL IS FLYING ********** 

            isFlying[ballID] = true;
            if (!isPrint_not_stopped[ballID]){
                console.log("ball " + ballID + " is NOT stopped!!");
                isPrint_not_stopped[ballID] = true;
                isPrint_stopped[ballID] = false;
            }

            // SOUND
            udpPort.send({
                address: "/isBallStopped",
                args: [
                    { type: "i", value: stage },
                    { type: "i", value: STATUS_NOT_STOPPED },
                    { type: "f", value: acc_obj[ballID].x },
                    { type: "f", value: acc_obj[ballID].y },
                    { type: "f", value: acc_obj[ballID].z },
                    { type: "f", value: ori_obj[ballID].x },
                    { type: "f", value: ori_obj[ballID].y },
                    { type: "f", value: ori_obj[ballID].z },

                ]
            }, "127.0.0.1", 57120);


            if (stage == CATCH_BALL_1) {

                hasBallFlown[ballID] = true;
            } else if (stage == CATCH_BALL_2) {

                if (!CATCH_BALL_2_started){
                    io.emit('drawFirstBotany', {value: 1});
                    CATCH_BALL_2_started = true;
                } 

                hasBallFlown[ballID] = true;
                io.emit('setRotation', {value: ori_obj[ballID].x});

            } else if (stage == CATCH_BALL_3) {
                hasBallFlown[ballID] = true;
                // if (isMultipleBallFlying() == true) {
                    // io.emit('multipleBallFlying', {value: 1});
                    io.emit('drawImages', {value: 1, _alpha: ori_obj[ballID].x});
                // }

            }

            else if (stage == CATCH_BALL_4) {
                // if (ballID == 2) io.emit('drawText', {value: 0});
                io.emit('drawText', {value: 0});
                // io.emit('setRotation', {value: ori_obj[ballID].x});
            }

            else if (stage == CATCH_BALL_ENDDING) {
                // broadcast
                var sumAcc = Math.abs(acc_obj[ballID].x) + Math.abs(acc_obj[ballID].y) + Math.abs(acc_obj[ballID].z);
                io.emit('setBackground', {value: sumAcc});
                hasBallFlown[ballID] = true;
            } 

        }

    });


    // socket.on('ball_1', function(data){

    //     var ballID = 1;
    //     // console.log("ball_0");
    //     // console.log(data);

    //     // split by '|'
    //     var o = data.split('|')[0]; // orientation
    //     var a = data.split('|')[1]; // accelerometer
    //     // var g = data.split('|')[2]; // accelerometer
    //     // console.log("ori: " + o);
    //     // console.log("acc: " + a);

    //     ori_obj[ballID] = makeOriObj(o, 3); // it should change to be more simple process.
    //     acc_obj[ballID] = makeAccObj(a, 2); // (obj, threshold to zero)
    //     // g_obj[ballID] = makeGObj(g, 1); // (obj, threshold to zero)

    //     // console.log(acc_obj[ballID]);

    //     if (stage == GRAPH) {
    //         // send for drawing graph
    //         io.emit('acc'+ballID, acc_obj[ballID]);
    //         io.emit('ori'+ballID, ori_obj[ballID]);
    //         // io.emit('g'+ballID, g_obj[ballID]);
    //     }

    //     if (stage == LOGGING_IN) {
    //         socketIdxCnt = 0;
    //     }

    //     if (stage != LOGGED_OUT) {
    //         isRotating[ballID] = checkSpin(ballID, 20, 20);
    //         isStop[ballID] = checkStop(ballID, 1, 10);
    //     }

    //     // when ball is stop..
    //     if (isStop[ballID] && !isRotating[ballID]) {
    //         isFlying[ballID] = false;

    //         if (!isPrint_stopped[ballID]){
    //             console.log("ball " + ballID + " is stopped!!!!")
    //             isPrint_stopped[ballID] = true;
    //             isPrint_not_stopped[ballID] = false;
    //         }

    //         // osc to supercollider
    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_STOPPED },
    //                 // { type: "i", value: endingCatchBallCount} // set amp using count
    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - on stop
    //         if (stage == CATCH_BALL_1) {
    //             // console.log("stage CATCH_BALL_1");

    //             if (hasBallFlown[ballID]) {
    //                 // emit to all client sequencely
    //                 var id = socketClientList[socketIdxCnt];
    //                 var len = socketClientList.length;

    //                 if (socketIdxCnt < len) {
    //                     console.log(id);
    //                     io.to(id).emit('setStage', {value: CATCH_BALL_1});
    //                     socketIdxCnt++;
    //                 } else {
    //                     socketIdxCnt = 0;
    //                 }

    //                 console.log(socketIdxCnt + "/" + len);
    //                 hasBallFlown[ballID] = false;
    //             }

    //         } else if (stage == CATCH_BALL_2) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_3) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 io.emit('drawImages', {value: 0, _alpha: 0}); // trajectory images
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_4) {
    //             // broadcast
    //             if (ballID == 2) io.emit('drawText', {value: 1});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast
    //             // ori_obj.x can not be 1000. This is a sign about it.
    //             // io.emit('setBackground', {value: 1000}); // make background color as white

    //             if (hasBallFlown[ballID]) {
    //                 // endingCatchBallCount++;
    //                 // console.log("endingCatchBallCount: " + endingCatchBallCount);
    //                 hasBallFlown[ballID] = false;
    //             }

                
    //             // if (endingCatchBallCount > (ENDING_CATCH_BALL_LIMIT + 1)) {
    //             //     // final falling
    //             //     // sound off
    //             //     udpPort.send({
    //             //         address: "/isBallStopped",
    //             //         args: [
    //             //             { type: "i", value: SOUND_OFF_ID}
    //             //         ]
    //             //     }, "127.0.0.1", 57120);

    //             //     // chage stage
    //             //     stage = LOGGED_OUT;
    //             //     io.emit('setStage', {value: LOGGED_OUT});

    //             // } else if (endingCatchBallCount > ENDING_CATCH_BALL_LIMIT) {

    //             //     // console.log("over limit count")
    //             //     // SOUND
    //             //     udpPort.send({
    //             //         address: "/isBallStopped",
    //             //         args: [
    //             //             { type: "i", value: ENDING_BALL_ID}, // specific number for represent over count limit
    //             //             { type: "i", value: STATUS_STOPPED} 
    //             //         ]
    //             //     }, "127.0.0.1", 57120);

    //             // }
                
    //         }  

    //     } else {

    //         isFlying[ballID] = true;
    //         if (!isPrint_not_stopped[ballID]){
    //             console.log("ball " + ballID + " is NOT stopped!!");
    //             isPrint_not_stopped[ballID] = true;
    //             isPrint_stopped[ballID] = false;
    //         }

    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_NOT_STOPPED },
    //                 { type: "f", value: acc_obj[ballID].x },
    //                 { type: "f", value: acc_obj[ballID].y },
    //                 { type: "f", value: acc_obj[ballID].z },
    //                 { type: "f", value: ori_obj[ballID].x },
    //                 { type: "f", value: ori_obj[ballID].y },
    //                 { type: "f", value: ori_obj[ballID].z },

    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - flying
    //         if (stage == CATCH_BALL_1) {

    //             hasBallFlown[ballID] = true;
    //         } else if (stage == CATCH_BALL_2) {

    //             if (!CATCH_BALL_2_started){
    //                 io.emit('drawFirstBotany', {value: 1});
    //                 CATCH_BALL_2_started = true;
    //             } 

    //             hasBallFlown[ballID] = true;
    //             io.emit('setRotation', {value: ori_obj[ballID].x});

    //         } else if (stage == CATCH_BALL_3) {
    //             hasBallFlown[ballID] = true;
    //             // if (isMultipleBallFlying() == true) {
    //                 // io.emit('multipleBallFlying', {value: 1});
    //                 io.emit('drawImages', {value: 1, _alpha: ori_obj[ballID].x});
    //             // }

    //         } else if (stage == CATCH_BALL_4) {
    //             if (ballID == 2) io.emit('drawText', {value: 0});
    //             // io.emit('setRotation', {value: ori_obj[ballID].x});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast
    //             // var sumAcc = Math.abs(acc_obj[ballID].x) + Math.abs(acc_obj[ballID].y) + Math.abs(acc_obj[ballID].z);
    //             // io.emit('setBackground', {value: sumAcc});
    //             hasBallFlown[ballID] = true;
    //         } 

    //     }

    // });


    // socket.on('ball_2', function(data){

    //     var ballID = 2;
    //     // console.log("ball_0");
    //     // console.log(data);

    //     // split by '|'
    //     var o = data.split('|')[0]; // orientation
    //     var a = data.split('|')[1]; // accelerometer
    //     // var g = data.split('|')[2]; // accelerometer
    //     // console.log("ori: " + o);
    //     // console.log("acc: " + a);

    //     ori_obj[ballID] = makeOriObj(o, 3); // it should change to be more simple process.
    //     acc_obj[ballID] = makeAccObj(a, 2); // (obj, threshold to zero)
    //     // g_obj[ballID] = makeGObj(g, 1); // (obj, threshold to zero)

    //     // console.log(acc_obj[ballID]);

    //     if (stage == GRAPH) {
    //         // send for drawing graph
    //         io.emit('acc'+ballID, acc_obj[ballID]);
    //         io.emit('ori'+ballID, ori_obj[ballID]);
    //         // io.emit('g'+ballID, g_obj[ballID]);
    //     }

    //     if (stage == LOGGING_IN) {
    //         socketIdxCnt = 0;
    //     }

    //     if (stage != LOGGED_OUT) {
    //         isRotating[ballID] = checkSpin(ballID, 20, 20);
    //         isStop[ballID] = checkStop(ballID, 1, 10);
    //     }

    //     // when ball is stop..
    //     if (isStop[ballID] && !isRotating[ballID]) {
    //         isFlying[ballID] = false;

    //         if (!isPrint_stopped[ballID]){
    //             console.log("ball " + ballID + " is stopped!!!!")
    //             isPrint_stopped[ballID] = true;
    //             isPrint_not_stopped[ballID] = false;
    //         }

    //         // osc to supercollider
    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_STOPPED },
    //                 // { type: "i", value: endingCatchBallCount} // set amp using count
    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - on stop
    //         if (stage == CATCH_BALL_1) {
    //             // console.log("stage CATCH_BALL_1");

    //             if (hasBallFlown[ballID]) {
    //                 // emit to all client sequencely
    //                 var id = socketClientList[socketIdxCnt];
    //                 var len = socketClientList.length;

    //                 if (socketIdxCnt < len) {
    //                     console.log(id);
    //                     io.to(id).emit('setStage', {value: CATCH_BALL_1});
    //                     socketIdxCnt++;
    //                 } else {
    //                     socketIdxCnt = 0;
    //                 }

    //                 console.log(socketIdxCnt + "/" + len);
    //                 hasBallFlown[ballID] = false;
    //             }

    //         } else if (stage == CATCH_BALL_2) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_3) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 io.emit('drawImages', {value: 0, _alpha: 0}); // trajectory images
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_4) {
    //             // broadcast
    //             if (ballID == 2) io.emit('drawText', {value: 1});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast
    //             // ori_obj.x can not be 1000. This is a sign about it.


    //             // for demo on school of everyone
    //             io.emit('setBackground', {value: 1000}); // make background color as white

    //             if (hasBallFlown[ballID]) {
    //                 // endingCatchBallCount++;
    //                 // console.log("endingCatchBallCount: " + endingCatchBallCount);
    //                 hasBallFlown[ballID] = false;
    //             }

                
    //             // for just demo on School of everyone
    //             if (endingCatchBallCount > (ENDING_CATCH_BALL_LIMIT + 1)) {
    //                 // final falling
    //                 // sound off
    //                 udpPort.send({
    //                     address: "/isBallStopped",
    //                     args: [
    //                         { type: "i", value: SOUND_OFF_ID}
    //                     ]
    //                 }, "127.0.0.1", 57120);

    //                 // chage stage
    //                 stage = LOGGED_OUT;
    //                 io.emit('setStage', {value: LOGGED_OUT});

    //             } else if (endingCatchBallCount > ENDING_CATCH_BALL_LIMIT) {

    //                 // console.log("over limit count")
    //                 // SOUND
    //                 udpPort.send({
    //                     address: "/isBallStopped",
    //                     args: [
    //                         { type: "i", value: ENDING_BALL_ID}, // specific number for represent over count limit
    //                         { type: "i", value: STATUS_STOPPED} 
    //                     ]
    //                 }, "127.0.0.1", 57120);

    //             }
                
    //         }  

    //     } else {

    //         isFlying[ballID] = true;
    //         if (!isPrint_not_stopped[ballID]){
    //             console.log("ball " + ballID + " is NOT stopped!!");
    //             isPrint_not_stopped[ballID] = true;
    //             isPrint_stopped[ballID] = false;
    //         }

    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_NOT_STOPPED },
    //                 { type: "f", value: acc_obj[ballID].x },
    //                 { type: "f", value: acc_obj[ballID].y },
    //                 { type: "f", value: acc_obj[ballID].z },
    //                 { type: "f", value: ori_obj[ballID].x },
    //                 { type: "f", value: ori_obj[ballID].y },
    //                 { type: "f", value: ori_obj[ballID].z },

    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - flying
    //         if (stage == CATCH_BALL_1) {

    //             hasBallFlown[ballID] = true;
    //         } else if (stage == CATCH_BALL_2) {

    //             if (!CATCH_BALL_2_started){
    //                 io.emit('drawFirstBotany', {value: 1});
    //                 CATCH_BALL_2_started = true;
    //             } 

    //             hasBallFlown[ballID] = true;
    //             io.emit('setRotation', {value: ori_obj[ballID].x});

    //         } else if (stage == CATCH_BALL_3) {
    //             hasBallFlown[ballID] = true;
    //             // if (isMultipleBallFlying() == true) {
    //                 // io.emit('multipleBallFlying', {value: 1});
    //                 io.emit('drawImages', {value: 1, _alpha: ori_obj[ballID].x});
    //             // }

    //         } else if (stage == CATCH_BALL_4) {
    //             if (ballID == 2) io.emit('drawText', {value: 0});
    //             // io.emit('setRotation', {value: ori_obj[ballID].x});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast

    //             // for demo on school of everyone
    //             var sumAcc = Math.abs(acc_obj[ballID].x) + Math.abs(acc_obj[ballID].y) + Math.abs(acc_obj[ballID].z);
    //             io.emit('setBackground', {value: sumAcc});

    //             hasBallFlown[ballID] = true;
    //         } 

    //     }

    // });



    // socket.on('ball_3', function(data){

    //     var ballID = 3;
    //     // console.log("ball_0");
    //     // console.log(data);

    //     // split by '|'
    //     var o = data.split('|')[0]; // orientation
    //     var a = data.split('|')[1]; // accelerometer
    //     // var g = data.split('|')[2]; // accelerometer
    //     // console.log("ori: " + o);
    //     // console.log("acc: " + a);

    //     ori_obj[ballID] = makeOriObj(o, 3); // it should change to be more simple process.
    //     acc_obj[ballID] = makeAccObj(a, 2); // (obj, threshold to zero)
    //     // g_obj[ballID] = makeGObj(g, 1); // (obj, threshold to zero)

    //     // console.log(acc_obj[ballID]);

    //     if (stage == GRAPH) {
    //         // send for drawing graph
    //         io.emit('acc'+ballID, acc_obj[ballID]);
    //         io.emit('ori'+ballID, ori_obj[ballID]);
    //         // io.emit('g'+ballID, g_obj[ballID]);
    //     }

    //     if (stage == LOGGING_IN) {
    //         socketIdxCnt = 0;
    //     }

    //     if (stage != LOGGED_OUT) {
    //         isRotating[ballID] = checkSpin(ballID, 20, 20);
    //         isStop[ballID] = checkStop(ballID, 1, 10);
    //     }

    //     // when ball is stop..
    //     if (isStop[ballID] && !isRotating[ballID]) {
    //         isFlying[ballID] = false;

    //         if (!isPrint_stopped[ballID]){
    //             console.log("ball " + ballID + " is stopped!!!!")
    //             isPrint_stopped[ballID] = true;
    //             isPrint_not_stopped[ballID] = false;
    //         }

    //         // osc to supercollider
    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_STOPPED },
    //                 { type: "i", value: endingCatchBallCount} // set amp using count
    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - on stop
    //         if (stage == CATCH_BALL_1) {
    //             // console.log("stage CATCH_BALL_1");

    //             if (hasBallFlown[ballID]) {
    //                 // emit to all client sequencely
    //                 var id = socketClientList[socketIdxCnt];
    //                 var len = socketClientList.length;

    //                 if (socketIdxCnt < len) {
    //                     console.log(id);
    //                     io.to(id).emit('setStage', {value: CATCH_BALL_1});
    //                     socketIdxCnt++;
    //                 } else {
    //                     socketIdxCnt = 0;
    //                 }

    //                 console.log(socketIdxCnt + "/" + len);
    //                 hasBallFlown[ballID] = false;
    //             }

    //         } else if (stage == CATCH_BALL_2) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_3) {
    //             if (hasBallFlown[ballID]) {
    //                 // broadcast
    //                 io.emit('variantBotany', {value: 1});
    //                 io.emit('drawImages', {value: 0, _alpha: 0}); // trajectory images
    //                 hasBallFlown[ballID] = false;
    //             }
    //         } else if (stage == CATCH_BALL_4) {
    //             // broadcast
    //             if (ballID == 2) io.emit('drawText', {value: 1});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast
    //             // ori_obj.x can not be 1000. This is a sign about it.
    //             io.emit('setBackground', {value: 1000}); // make background color as white

    //             if (hasBallFlown[ballID]) {
    //                 endingCatchBallCount++;
    //                 console.log("endingCatchBallCount: " + endingCatchBallCount);
    //                 hasBallFlown[ballID] = false;
    //             }

    //             if (endingCatchBallCount > (ENDING_CATCH_BALL_LIMIT + 1)) {
    //                 // final falling
    //                 // sound off
    //                 udpPort.send({
    //                     address: "/isBallStopped",
    //                     args: [
    //                         { type: "i", value: SOUND_OFF_ID}
    //                     ]
    //                 }, "127.0.0.1", 57120);

    //                 // chage stage
    //                 stage = LOGGED_OUT;
    //                 io.emit('setStage', {value: LOGGED_OUT});

    //             } else if (endingCatchBallCount > ENDING_CATCH_BALL_LIMIT) {

    //                 // console.log("over limit count")
    //                 // SOUND
    //                 udpPort.send({
    //                     address: "/isBallStopped",
    //                     args: [
    //                         { type: "i", value: ENDING_BALL_ID}, // specific number for represent over count limit
    //                         { type: "i", value: STATUS_STOPPED} 
    //                     ]
    //                 }, "127.0.0.1", 57120);

    //             }
                
    //         }  

    //     } else {

    //         isFlying[ballID] = true;
    //         if (!isPrint_not_stopped[ballID]){
    //             console.log("ball " + ballID + " is NOT stopped!!");
    //             isPrint_not_stopped[ballID] = true;
    //             isPrint_stopped[ballID] = false;
    //         }

    //         // SOUND
    //         udpPort.send({
    //             address: "/isBallStopped",
    //             args: [
    //                 { type: "i", value: ballID },
    //                 { type: "i", value: STATUS_NOT_STOPPED },
    //                 { type: "f", value: acc_obj[ballID].x },
    //                 { type: "f", value: acc_obj[ballID].y },
    //                 { type: "f", value: acc_obj[ballID].z },
    //                 { type: "f", value: ori_obj[ballID].x },
    //                 { type: "f", value: ori_obj[ballID].y },
    //                 { type: "f", value: ori_obj[ballID].z },

    //             ]
    //         }, "127.0.0.1", 57120);


    //         // VISUAL - flying
    //         if (stage == CATCH_BALL_1) {

    //             hasBallFlown[ballID] = true;
    //         } else if (stage == CATCH_BALL_2) {

    //             if (!CATCH_BALL_2_started){
    //                 io.emit('drawFirstBotany', {value: 1});
    //                 CATCH_BALL_2_started = true;
    //             } 

    //             hasBallFlown[ballID] = true;
    //             io.emit('setRotation', {value: ori_obj[ballID].x});

    //         } else if (stage == CATCH_BALL_3) {
    //             hasBallFlown[ballID] = true;
    //             // if (isMultipleBallFlying() == true) {
    //                 // io.emit('multipleBallFlying', {value: 1});
    //                 io.emit('drawImages', {value: 1, _alpha: ori_obj[ballID].x});
    //             // }

    //         } else if (stage == CATCH_BALL_4) {
    //             if (ballID == 2) io.emit('drawText', {value: 0});
    //             // io.emit('setRotation', {value: ori_obj[ballID].x});
    //         } else if (stage == CATCH_BALL_ENDDING) {
    //             // broadcast
    //             var sumAcc = Math.abs(acc_obj[ballID].x) + Math.abs(acc_obj[ballID].y) + Math.abs(acc_obj[ballID].z);
    //             io.emit('setBackground', {value: sumAcc});
    //             hasBallFlown[ballID] = true;
    //         } 
    //     }
    // });

});



//========================= functions ========================= 
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function takeSamples(ballID, obj, numSample) {
    acc_x_buffer[ballID].push(obj.x);
    acc_y_buffer[ballID].push(obj.y);
    acc_z_buffer[ballID].push(obj.z);
    if (acc_x_buffer[ballID].length > numSample) acc_x_buffer[ballID].shift();
    if (acc_y_buffer[ballID].length > numSample) acc_y_buffer[ballID].shift();
    if (acc_z_buffer[ballID].length > numSample) acc_z_buffer[ballID].shift();
}

function checkSpin(ballID, bufferLen, thr) {

    var diff_spin_x, diff_spin_y, diff_spin_z;
    diff_spin_x = Math.abs(parseFloat(ori_obj[ballID].x) - parseFloat(prev_ori_obj[ballID].x));
    diff_spin_y = Math.abs(parseFloat(ori_obj[ballID].y) - parseFloat(prev_ori_obj[ballID].y));
    diff_spin_z = Math.abs(parseFloat(ori_obj[ballID].z) - parseFloat(prev_ori_obj[ballID].z));
    // console.log(parseFloat(ori_obj[ballID].x));
    // console.log(diff_spin_x);
    // console.log(diff_spin_y);
    // console.log(diff_spin_z);


    // bufferBallsOri[ball_id][2].push(_data.z);
    // if (bufferBallsOri[ball_id][0].length > bufLen) bufferBallsOri[ball_id][0].shift();

    angvel_x_buffer[ballID].push(diff_spin_x);
    angvel_y_buffer[ballID].push(diff_spin_y);
    angvel_z_buffer[ballID].push(diff_spin_z);
    if (angvel_x_buffer[ballID].length > bufferLen) angvel_x_buffer[ballID].shift();
    if (angvel_y_buffer[ballID].length > bufferLen) angvel_y_buffer[ballID].shift();
    if (angvel_z_buffer[ballID].length > bufferLen) angvel_z_buffer[ballID].shift();

    // console.log(angvel_x_buffer[ballID])

    var sum_angvel_x = angvel_x_buffer[ballID].reduce((a, b) => a + b, 0);
    var sum_angvel_y = angvel_y_buffer[ballID].reduce((a, b) => a + b, 0);
    var sum_angvel_z = angvel_z_buffer[ballID].reduce((a, b) => a + b, 0);
    // console.log(sum_angvel_x);
    // console.log(sum_angvel_y);
    // console.log(sum_angvel_z);
    var avg_angvel_x = sum_angvel_x/bufferLen;
    var avg_angvel_y = sum_angvel_y/bufferLen;
    var avg_angvel_z = sum_angvel_z/bufferLen;
    // console.log(avg_angvel_x);
    // console.log(avg_angvel_y);
    // console.log(avg_angvel_z);

    prev_ori_obj[ballID].x = ori_obj[ballID].x;
    prev_ori_obj[ballID].y = ori_obj[ballID].y;
    prev_ori_obj[ballID].z = ori_obj[ballID].z;


    if (avg_angvel_x < thr && avg_angvel_y < thr && avg_angvel_z < thr) {
        // console.log("NOT spinning!!");
        return false;
    } else {
        // console.log("spinning!!");
        return true;
    }

}

function checkStop(ballID, stopCount, flyCount) {

    // x
    if (acc_obj[ballID].x == 0) { count_x[ballID]++; }
    else { count_x[ballID] = 0; vel_x[ballID] = 1;}
    if (count_x[ballID] >= stopCount) { vel_x[ballID] = 0; }

    // y
    if (acc_obj[ballID].y == 0) { count_y[ballID]++; }
    else { count_y[ballID] = 0; vel_y[ballID] = 1;}
    if (count_y[ballID] >= stopCount) { vel_y[ballID] = 0; }

    // z
    if (acc_obj[ballID].z == 0) { count_z[ballID]++; }
    else { count_z[ballID] = 0; vel_z[ballID] = 1;}
    if (count_z[ballID] >= stopCount) { vel_z[ballID] = 0; }


    // check is stop
    if (vel_x[ballID] == 0 && vel_y[ballID] == 0 && vel_z[ballID] == 0) {
        // return true;
        flyingCount[ballID] = 0;
    } else {
        flyingCount[ballID]++;
        // return false;
    }


    if (flyingCount[ballID] > flyCount) {
        return false;
    } else {
        if (flyingCount[ballID] < 1000){
            return true;
        } else {
            console.log("over max time");
            console.log(flyingCount[ballID]);
            return false;
        }
    }

}

function makeOriObj(data, thr) {
    var splited = data.split('/');

    var obj = {
        x : splited[0].split('"')[1], 
        y : splited[1],
        z : splited[2]
    };

    // discrimination : regards too small value as zero.
    for (var key in obj) {
        if ((obj[key] <= thr) && (obj[key] >= -thr)) {
            obj[key] = 0;
        }
    }

    return obj;

}


function makeAccObj(data, thr) {
    var splited = data.split('/');

    var obj = {
        x : splited[0], 
        y : splited[1],
        z : splited[2].split('"')[0]
    };

    // discrimination : regard too small value as zero.
    for (var key in obj) {
        if ((obj[key] <= thr) && (obj[key] >= -thr)) {
            obj[key] = 0;
        }
    }

    return obj;

}


function makeGObj(data, thr) {
    var splited = data.split('/');

    var obj = {
        x : splited[0], 
        y : splited[1],
        z : splited[2].split('"')[0]
    };

    // discrimination : regard too small value as zero.
    for (var key in obj) {
        if ((obj[key] <= thr) && (obj[key] >= -thr)) {
            obj[key] = 0;
        }
    }

    return obj;

}

function getVel(ballID) {
    // console.log("getVel()");
    // console.log( acc_x_prev[ballID] );
    // console.log( acc_x_cur[ballID] );

    // var a = ( Number(acc_x_prev[ballID]) + Number(acc_x_cur[ballID]) >> 1 ); // result as int
    // var a = ( (Number(acc_x_prev[ballID]) + Number(acc_x_cur[ballID]))/2 ); // result as float
    // var a = ( (parseFloat(acc_x_prev[ballID]) + parseFloat(acc_x_cur[ballID])) >> 1 );
    // console.log("sum:" + a);

    // console.log( ((acc_x_prev[ballID] + acc_x_cur[ballID]) >> 1));
    // var d = 0;
    // if (acc_x_prev[ballID] != 0 || acc_x_cur[ballID] != 0) {
    //     d = (acc_x_prev[ballID] + acc_x_cur[ballID]) / 2;
    // }
    // console.log( d );
    // console.log(parseFloat(vel_x_prev[ballID]));
    // console.log(parseFloat(acc_x_prev[ballID]));
    // console.log(parseFloat(acc_x_cur[ballID]));

    // vel_x_cur[ballID] = parseFloat(vel_x_prev[ballID]) + parseFloat(acc_x_prev[ballID]) + ( (parseFloat(acc_x_prev[ballID]) + parseFloat(acc_x_cur[ballID])) >> 1);
    // vel_y_cur[ballID] = parseFloat(vel_y_prev[ballID]) + parseFloat(acc_y_prev[ballID]) + ( (parseFloat(acc_y_prev[ballID]) + parseFloat(acc_y_cur[ballID])) >> 1);
    // vel_z_cur[ballID] = parseFloat(vel_z_prev[ballID]) + parseFloat(acc_z_prev[ballID]) + ( (parseFloat(acc_z_prev[ballID]) + parseFloat(acc_z_cur[ballID])) >> 1);

    vel_x_cur[ballID] = parseFloat(acc_x_prev[ballID]) + ( (parseFloat(acc_x_prev[ballID]) + parseFloat(acc_x_cur[ballID])) >> 1);
    vel_y_cur[ballID] = parseFloat(acc_y_prev[ballID]) + ( (parseFloat(acc_y_prev[ballID]) + parseFloat(acc_y_cur[ballID])) >> 1);
    vel_z_cur[ballID] = parseFloat(acc_z_prev[ballID]) + ( (parseFloat(acc_z_prev[ballID]) + parseFloat(acc_z_cur[ballID])) >> 1);


    // console.log("vel: " + vel_x_cur[ballID]);

    vel_x_prev[ballID] = vel_x_cur[ballID];
    vel_y_prev[ballID] = vel_y_cur[ballID];
    vel_z_prev[ballID] = vel_z_cur[ballID];

    acc_x_prev[ballID] = acc_x_cur[ballID];
    acc_y_prev[ballID] = acc_y_cur[ballID];
    acc_z_prev[ballID] = acc_z_cur[ballID];

}

function isMultipleBallFlying() {

    var cnt = 0;
    for (var i = 0; i < BALL_NUM; i++) {
        if (isFlying[i] == true) cnt++;
    }

    if (cnt >= 2) return true;
    else return false;

}

console.log("<Color together!!> server is running..");

