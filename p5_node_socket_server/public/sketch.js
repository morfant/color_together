//================================ Global ================================
// staging
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
var stage = LOGGING_IN;

// constant
var ORI_X_MIN = 0;
var ORI_X_MAX = 360;
var ACC_X_MIN = 0;
var ACC_X_MAX = 100;
var ACC_Z_MIN = -100;
var ACC_Z_MAX = 100;

var NUM_IMAGES = 29;
var NUM_SHAPE_VAR = 5;
var NUM_COLOR_VAR = 5;
var NUM_TEXT_VAR = 12;

// socket.io
var socket = io.connect();

// graph
var bufferBallsOri = [[[],[],[]], [[],[],[]], [[],[],[]], [[],[],[]]]; // [ballID][axis: x, y, z]
var bufferBallsAcc = [[[],[],[]], [[],[],[]], [[],[],[]], [[],[],[]]];
var bufferBallsVel = [[[],[],[]], [[],[],[]], [[],[],[]], [[],[],[]]];
var bufferBallsG = [[[],[],[]], [[],[],[]], [[],[],[]], [[],[],[]]];
var bufLen = 512;
var plotSize = 5;
var scaleY = 3;

var bloom = 0;


// logged in
var logId = "";
var uniqueVarShape = 0;
var uniqueVarColor = 0;
var uniqueVarTextIdx = 0;

// catch_ball_1
var oneIsFirstTime = true;
var drawFirstBotany = 0;
var fourIsFirstTime = true;

// ending
var endingMakeWhite = false;
var endingBackCol = 0;
var endingBackSat = 0;

// logged out
var loggedOutBlinking = false;
var loggedOutIsFirstTime = true;

// botany
var var_shape, var_color;
var variantBotany = 1;
var n = 0;
var c = 4;
var botany_max = 300;
var botany_space = 5;
var botany_theta = 137.5;
var botany_color_base = 155;
var botany_ellipse_x = 5;
var botany_ellipse_y = 6;
var botany_sat_base = 40;
var botany_sat_div = 1;
var botany_orientation = 0;
var botany_count = 0;
var botany_count_limit = 600;
var botany_frameDiv = 15;

// images
var imgs = [];  // Declare variable 'img'.
// var changeImage = 0;
var img_random_idx = 0;
var imgPaddingH, imgPaddingV;
var image_alpha = 125;
var drawImages = 0;
var drawText = 0;

// text ball
var sentance = [];
var tsNormal = 20;
var tsLarge = tsNormal*1.5;

// multi
// var rectColor = ["LightBlue", "LightSlateGray", "DarkSlateGray", "RosyBrown", "Teal"];
var rectColor = [];

var seq;
var synths = [];
var loops = [];
var notes = ["C3", "D3", "E1", "F3", "G3"];
var durs = ["8n", "16n", "8n", "16n", "8n"];
var intervals = ["4n", "4n", "4n", "4n", "4n"];
var vols = [];

var blinkCoverAlpha = [0, 0, 0, 0, 0];

function blinkRect(idx, dur) {
    rectColor[idx][2] = 0; // brightness
}
//================================ setup() ================================
function setup() {

    createCanvas(innerWidth-20, innerHeight-20);
    angleMode(DEGREES);


    colorMode(HSB);
    rectColor = [[195, 53, 79], [210, 14, 53], [180, 25, 25], [0, 25, 65], [180, 100, 25]];

    // load images
    for (var i = 0; i < 29; i++) {
        imgs[i] = loadImage("assets/" + i + ".jpg");
    }

    imgPaddingH = innerWidth/8;
    imgPaddingV = innerHeight/8;


    // sentances
    sentance[0]="폭탄이비행기에서풀리면비행기의수평속도와같은수평속도로포물선궤도를따라간다.폭탄은비행기바로밑으로떨어집니다(파선).폭탄이땅위의어떤높이에서폭발하면조각의질량중심은원래의포물선궤도(주황색곡선)를따른다.운동량은보존됩니다.즉,폭발직전의각조각에대한매스의곱과벡터의합은폭발직후의운동량과같습니다";
    sentance[1]="영국의시리아인권전망대는일요일296명으로총사망자를기록했다.폭발물과파편으로가득찬용기폭탄이수요일Jisreen과KfarBatna마을의정부공습에사용되었다고한다.화요일에Ghouta동부전역의적어도10개마을과마을에대한폭격이이어진다.시리아국영TV는다마스쿠스동부의정부관리지역에살고있는적어도6명이이른주동부에서총격을받은포탄들에의해이번주초에살해됐다고보도했다.시리아군은포탄이발사된지역에서\"정밀타격\"을실시했다고밝혔다.";
    sentance[2]="시리아정부가3일째치열한공격으로다마스쿠스반란군장례식장에서박격포와폭탄이비가내리고있다.현지수사당국은월요일밤까지하룻밤사이에동부Ghouta에서격렬한포격,로켓공격및공습으로150명이넘는사람들이사망했습니다.시리아천문대는48시간만에사망자가250명으로늘어났다고밝혔다.많은시체가여전히잔해아래에갇혀있습니다.압도적인응급처치요원은부상당한사람들의요구에부응하기위해고군분투하고있습니다.";
    sentance[3]="아이야드,27세나가원하는모두는폭격이멈추고,나의이웃사람및나가자란거리와Ghouta에서체재하기위한것이다.이것은우리의고향입니다.우리는파괴와재건을다룰수있습니다.우리는단지머물고싶습니다.모하메드,27세,사진작가폭탄테러는오전11시에시작됐고,발견된첫번째시체인,친구의아들은오후6시에있었습니다.Taaqi,30,구조대원어제밤에그들이폭탄테러에안전했는지확인하기위해돌아왔습니다.모든이웃이파괴되었습니다.그들이살아있거나죽었는지전혀모르겠습니다.Hamzi,24,구급요원당신이누군가를구할때최대2분이남았습니다.이정권은보통같은지역을두번연속적으로폭파하여구조작업원에게두번째공격을가하는것을목표로삼고있다.폭탄으로부상당한한남자가2월20일Douma에있는의료시설에서도움을기다리고있다.MohammedBadra-EPA-EFE/Shutterstock";
    sentance[4]="미행정부와파키스탄당국은민간인의공격으로인한사망자는거의없다고공개적으로주장했다.[정화가필요하다]누출된군사문서에따르면사망자의대다수가의도된표적이아니며사망자의약13%가의도된표적이되었다,81%는다른\"무장세력\"이고,6%는민간인이다.[18][19]요격당한언론인에따르면이문서를유출한소식통에따르면94%의무장세력사망자중일부는군사력이있는남성이포함된것으로알려졌다.원본은이사실에대한아무런증거도제시하지않았지만이러한주장은문서자체에서확인되지않았음에도불구하고명확하게입증된바있다.민간인사망자수의추정치는158에서965사이다.[6][10]국제앰네스티는많은희생자가무장하지않았으며일부파업은전쟁범죄에해당될수있음을발견했다.";
    sentance[5]="인권단체인'희생자(Retrieve)'가실시한무인항공기폭격에대한대중의자료에대한새로운분석은운영자가특정개인을목표로삼을때라도(바락오바마가\"표적살해\"라고부르는가장집중된노력)사람들은종종여러번공격할필요가있습니다.41명의남성을죽이려는시도로11월24일현재1,147명의사망자가발생했습니다.";
    sentance[6]="양국전역의무인항공기폭격대상자41명을대상으로한자료에따르면각자가여러번살해된것으로보도되었다.그들중7명은여전히​​살아있다고믿어집니다.다른사람,HajiOmar의지위는알려지지않았습니다.무인항공기를3번​​공격한아부우바이다알마스리(AbuUbaidahal-Masri)는나중에간염으로여겨지는자연원인으로사망했다.";
    sentance[7]="나는전투폭격기로활주폭격정밀도를높이기위해레벨폭격의기본발리스틱에들어가기로결정했습니다.그래서이글에서는다른것들을떨어뜨려서죽게만드는기본수학을여러분과공유할것입니다.)우선우리는우리의탑재물에작용하는힘-중력과공기저항을이해해야합니다.저항력을무시할것입니다.왜냐하면폭탄의항력계수를알지못하고폭탄공격이낮은수준에서이루어지기때문에어쨌든속도가느려지는시간이별로없습니다.그래서우리의폭탄은중력에의해아래쪽으로가속됩니다.";
    sentance[8]="미국의정보분석가들에따르면,북한은또한미사일에맞도록핵탄두를충분히가지고있다.9월2일,미국은가장강력한핵장치를시험했지만,미국이히로시마에떨어뜨린폭탄의7배에달하는폭발적인폭발을보였다.";
    sentance[9]="미국은2004년6월부터파키스탄에무인항공기로폭격했다.CIA는미국특수부대의무인항공기가파키스탄의무인항공기에대한독점기밀유지를끝낸2016년5월까지미국의모든무인항공기에대한공격을담당했다.파키스탄정부를전복하려는아프간탈레반과파키스탄탈레반,TTP등국내테러분자들을포함해알카에다와그동맹국을겨냥한폭격이벌어졌습니다.여성과어린이를포함한수백명의시민들과테러집단의고위직도사망했다.그러나더많은사람들이죽임을당한상태는아직알려지지않았습니다.그들은무명으로죽고,단지데이터세트의소스자료의대부분을차지하는언론보도에서\"전투적인\"것으로기록됩니다.그러나그들이무장단체에속해있는지여부는분명하지않습니다.";
    sentance[10]="전체데이터국은해마다파키스탄,아프가니스탄,소말리아,예멘에서미국의폭격에대한이야기의타임라인을발표합니다.파키스탄에대한2018년일정은아래와같습니다.다른모든타임라인링크는여기에서찾을수있습니다.우리는또한각국의사상자수를나타내는스프레드시트를게시합니다.파키스탄전체시트를다운로드할수있습니다.";
    sentance[11]="목표를초과하면표식에대한정보를얻기위해센서폭탄을떨어뜨립니다.파워블록과미사일포탑을찾습니다.미사일폭발은정말로열심히펀치를하고폭탄궤적을왜곡하여목표를망치고우리는먼저그들을제거하기를원합니다.그리드정보를얻으면운동폭탄으로전환하고정밀폭격을시작합니다.위에서언급한것처럼먼저미사일포탑을목표로삼습니다.적기지에원자로또는배터리클러스터가하나만있는경우표적이되어야합니다.그러면노크를사용하는전력이포탑과함께눈금을사용할수없게됩니다.";

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

            /*
            function triggerSynth(time, note, dur) {
                console.log("triggerSynth()");
                console.log(time + "/" + note + "/" + dur);
                synth.triggerAttackRelease(note, dur, time);
            }


            Tone.Transport.schedule(triggerSynth, 0, 200, 1.0);
            Tone.Transport.schedule(triggerSynth, 1, 300, 1.0);
            Tone.Transport.schedule(triggerSynth, 2, 400, 1.0);
            Tone.Transport.schedule(triggerSynth, 3, 500, 1.0);
            Tone.Transport.schedule(triggerSynth, 4, 600, 1.0);

            // Tone.Transport.schedule(triggerSynth, 1);
            // Tone.Transport.schedule(triggerSynth, 2);
            // Tone.Transport.schedule(triggerSynth, 3);
            // Tone.Transport.schedule(triggerSynth, 4);

            Tone.Transport.loopEnd = '1m';
            // Tone.Transport.loop = true;
            */
            
            /*
            seq = new Tone.Sequence(function(time, note){
                console.log(time);
                console.log(note);
                synth.triggerAttackRelease(note, time);
            }, ["C3", "D3", "C3", "E3", "G3"], ["4n", "8n", "4n", "8n", "8n"]);
            */

            /*
            var note = new Tone.Event(function(time, pitch) {
                console.log(time);
                console.log(pitch);
                synth.triggerAttackRelease(pitch, "16n", time)
            }, "c2");

            note.set({
                "loop": true,
                "loopEnd": "2n"
            });


            Tone.Transport.toggle();
            note.start(0)
            note.stop("4m")
            */


            /*
            Tone.Transport.toggle();
            var part = new Tone.Part(function(time, pitch){
                console.log(time);

            synth.triggerAttackRelease(pitch, "1", time);
                }, [["0", "C#3"], ["1", "G3"], ["2", "G#3"], ["3", "C3"]]);


            part.start("0");
            */




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
                    blinkCoverAlpha[i]-=25.5;
                }


                colorMode(HSB);
                fill(color(rectColor[i][0], rectColor[i][1], rectColor[i][2]));
                rect(i * width/5, 0, width/5, height);

                colorMode(RGB);
                fill(255, blinkCoverAlpha[i]);
                rect(i * width/5, 0, width/5, height);
            }


            break;
        case GRAPH:

            // vertical center line
            colorMode(RGB);
            background(0);
            stroke(255);
            line(0, height/2, width, height/2);

            noStroke();

            // colorMode(HSB);
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < bufferBallsOri[i][0].length; j++) {

                    // Orientation
                    fill("Blue");
                    ellipse(j, height/2 - bufferBallsOri[i][0][j] * scaleY, plotSize/2, plotSize/2);
                    fill("Coral");
                    // fill((255/(i+1)) + 30, 100, 100);
                    ellipse(j, height/2 - bufferBallsOri[i][1][j] * scaleY, plotSize/2, plotSize/2);
                    fill("Crimson");
                    // fill((255/(i+1)) + 60, 100, 100);
                    ellipse(j, height/2 - bufferBallsOri[i][2][j] * scaleY, plotSize/2, plotSize/2);


                    // Acceleration
                    // fill((255/(i+1)), 100, 100);
                    // ellipse(j, height/2 - bufferBallsAcc[i][0][j] * scaleY, plotSize/2, plotSize/2);
                    // fill((255/(i+1)) + 20, 100, 100);
                    // ellipse(j, height/2 - bufferBallsAcc[i][1][j] * scaleY, plotSize/2, plotSize/2);
                    // fill((255/(i+1)) + 40, 100, 100);
                    // ellipse(j, height/2 - bufferBallsAcc[i][2][j] * scaleY, plotSize/2, plotSize/2);


                    // Velocity ? : using integral
                    // fill((155/(i+1)), 10, 100);
                    // ellipse(j, height/2 - bufferBallsVel[i][0][j] * scaleY, plotSize/2, plotSize/2);
                    // fill((155/(i+1)) + 20, 10, 100);
                    // ellipse(j, height/2 - bufferBallsVel[i][1][j] * scaleY, plotSize/2, plotSize/2);
                    // fill((155/(i+1)) + 40, 10, 100);
                    // ellipse(j, height/2 - bufferBallsVel[i][2][j] * scaleY, plotSize/2, plotSize/2);

                    // Gravity
                    // fill("DarkBlue");
                    // ellipse(j, height/2 - bufferBallsG[i][0][j] * scaleY, plotSize/2, plotSize/2);
                    // fill("DarkGrey");
                    // ellipse(j, height/2 - bufferBallsG[i][1][j] * scaleY, plotSize/2, plotSize/2);
                    // fill("DarkGreen");
                    // ellipse(j, height/2 - bufferBallsG[i][2][j] * scaleY, plotSize/2, plotSize/2);

                    // var sumG = Math.abs(bufferBallsG[i][0][j]) + Math.abs(bufferBallsG[i][1][j]) + Math.abs(bufferBallsG[i][2][j]);
                    // fill("DeepPink");
                    // ellipse(j, height/2 - sumG * scaleY, plotSize/2, plotSize/2);


                }
            }
            break;


        case LOGGING_IN:

            // boolean reset
            oneIsFirstTime = true;
            fourIsFirstTime = true;
            loggedOutIsFirstTime = true;
            drawFirstBotany = 0;
            botany_count = 0;

            background(0);
            textAlign(CENTER);
            
            var ts = innerWidth/8;
            textSize(ts/2);
            colorMode(HSB);
            fill(random(255), 100, 100);
            text("Id: " + logId, innerWidth/2, innerHeight/2 - ts/2);

            textSize(ts);
            colorMode(RGB);
            fill(255);
            text("Logged In", innerWidth/2, innerHeight/2 + ts/2);

            //reset boolean
            oneIsFirstTime = true;
            n = 0;
            break;

        case CATCH_BALL_1:
            // draw botany all at once
            // draw frame by frame or all at once?

            if (oneIsFirstTime) {
                // erase logged in text
                background(0);
                var_shape = getRandomInt(5);
                // console.log("sh: " + var_shape);
                var_color = getRandomInt(5);
                // console.log("cl: " + var_color);
                oneIsFirstTime = false;
            }

            colorMode(HSB);
            
            // botany variation
            var k, s, rmin, rmax;
            switch(var_shape) {
                case 0:
                    k = 137.3;
                    s = 3;
                    rmin = 6; rmax = 9;
                    break;
                case 1:
                    k = 137.5;
                    s = 2.5;
                    rmin = 1; rmax = 3;
                    break;
                case 2:
                    k = 137.6;
                    s = 1.3;
                    rmin = 4; rmax = 5;
                    break;
                case 3:
                    k = 137.7;
                    s = 3;
                    rmin = 3; rmax = 8;
                    break;
                case 4:
                    k = 137.8;
                    s = 2.9;
                    rmin = 2; rmax = 4;
                    break;
 
                default:
                    k = 137.6;
                    s = 2;
                    rmin = 4; rmax = 8;
                    break;
            }


            var a = n * k;
            var r = c * sqrt(n);

            var x = s * r * cos(a) + innerWidth/2;
            var y = s * r * sin(a) + innerHeight/2;

            noStroke();
                
            switch(var_color) {
                case 0:
                    fill(55, 50 + 50 * cos(a/3), 100);
                    break;
                case 1:
                    fill(5, 40 + 40 * cos(a/2), 100);
                    break;
                case 2:
                    fill(155, 70 + 30 * cos(a/2), 100);
                    break;
                case 3:
                    fill(random(255), 90 + 10 * cos(a/3), 100);
                    break;
                case 4:
                    fill(40, 30 + 50 * cos(a/3), 100);
                    break;

                default:
                    fill(155, 100 * cos(a/3), 100);
                    break;
            }

            ellipse(x, y, random(rmin, rmax), random(rmin, rmax+2));    

            n+=1;

            break;

        case CATCH_BALL_2:
            // botany + rotation by ball orientation of which ball? as a team of specific ball?
            // botany color, shape variation
            background(0);
            colorMode(HSB);
    
            push();
            translate(innerWidth/2, innerHeight/2);

            // rotate
            // var r = frameCount*10 % 360;
            rotate(botany_orientation);
            // console.log(r);

            // noise random values
            if (variantBotany == 1) {
                console.log("in variation");
                botany_max = 30 + random(600);
                botany_theta = 137 + random(0.8);
                botany_space = random(4);
                botany_color_base = getRandomInt(255);
                botany_sat_base = getRandomInt(80);
                botany_sat_div = 1 + getRandomInt(4);
                botany_ellipse_x = random(4, 8);
                botany_ellipse_y = random(4, 10);
                variantBotany = 0;
            }

            if (drawFirstBotany == 1) {
                // fill(155, 100 * cos(a/3) * 255, 200);
                for (var i = 0; i < botany_max; i+=1) {

                    // var a = i * 135.6;
                    var a = i * botany_theta;
                    var r = c * sqrt(i);

                    var x = botany_space * r * cos(a); 
                    var y = botany_space * r * sin(a);

                    fill(botany_color_base, botany_sat_base + (100 - botany_sat_base) * cos(a/botany_sat_div), 10 + 100 * ((botany_max - i)/botany_max));

                    ellipse(x, y, botany_ellipse_x, botany_ellipse_y);    
            
                }
            }
            pop();

            break;


        case CATCH_BALL_3: 
            // botany + trajectory images : when ball is flying
            // botany color, shape variation
            background(0);
            colorMode(HSB);
            imageMode(CENTER);

            push();
            translate(innerWidth/2, innerHeight/2);

            // rotate
            // var r = frameCount*10 % 360;
            rotate(botany_orientation);
            // console.log(r);

            // noise random values
            if (variantBotany == 1) {
                console.log("in variation");
                botany_max = 30 + random(600);
                botany_theta = 137 + random(0.8);
                botany_space = random(4);
                botany_color_base = getRandomInt(255);
                botany_sat_base = getRandomInt(80);
                botany_sat_div = 1 + getRandomInt(4);
                botany_ellipse_x = random(4, 8);
                botany_ellipse_y = random(4, 10);
                variantBotany = 0;
            }

            if (drawImages == 0) {
                for (var i = 0; i < botany_max; i+=1) {

                    // var a = i * 135.6;
                    var a = i * botany_theta;
                    var r = c * sqrt(i);

                    var x = botany_space * r * cos(a); 
                    var y = botany_space * r * sin(a);

                    fill(botany_color_base, botany_sat_base + (100 - botany_sat_base) * cos(a/botany_sat_div), 10 + 100 * ((botany_max - i)/botany_max));

                    ellipse(x, y, botany_ellipse_x, botany_ellipse_y);    
            
                }
            }
            pop();

            // trajectory images
            if (drawImages == 1) {
                // tint is not working : why?
                // tint(255, image_alpha); // Apply transparency without changing color
                // tint(255, 10); // Apply transparency without changing color
                image(imgs[img_random_idx], innerWidth/2, innerHeight/2, innerWidth*6/8, innerHeight*6/8);
            }


            break;

        case CATCH_BALL_4:
            // when ball stop: text botany (frame by frame) / when ball flying: char changes as ellipse

            if (fourIsFirstTime) {
                botany_count = 0;
                fourIsFirstTime = false;
                console.log("sh: " + uniqueVarShape);
                console.log("cl: " + uniqueVarColor);
                console.log("textidx: " + uniqueVarTextIdx);
            }
            
            background(0);
            colorMode(HSB);


            // botany variation
            var k, s, rmin, rmax;
            switch(uniqueVarShape) {
                case 0:
                    k = 137.3;
                    s = 3;
                    rmin = 6; rmax = 9;
                    break;
                case 1:
                    k = 137.5;
                    s = 2.5;
                    rmin = 1; rmax = 3;
                    break;
                case 2:
                    k = 137.6;
                    s = 4;
                    rmin = 4; rmax = 5;
                    break;
                case 3:
                    k = 137.7;
                    s = 3;
                    rmin = 3; rmax = 8;
                    break;
                case 4:
                    k = 137.8;
                    s = 2.9;
                    rmin = 2; rmax = 4;
                    break;
 
                default:
                    k = 137.6;
                    s = 2;
                    rmin = 4; rmax = 8;
                    break;
            }


            push();
            translate(innerWidth/2, innerHeight/2);
            
            // Don't rotate : for more readable condition
            // rotate(botany_orientation);

            if (frameCount % botany_frameDiv == 0) {
                botany_count++;
            }

            for (var i = 0; i < botany_count; i+=1) {

                // var a = i * 135.6;
                var a = i * k;
                var r = c * sqrt(i);

                var x = s * 2 * r * cos(a); 
                var y = s * 2 * r * sin(a);


                // noStroke();
                    
                switch(uniqueVarColor) {
                    case 0:
                        fill(55, 50 + 50 * cos(a/3), 100);
                        break;
                    case 1:
                        fill(5, 40 + 40 * cos(a/2), 100);
                        break;
                    case 2:
                        fill(155, 70 + 30 * cos(a/2), 100);
                        break;
                    case 3:
                        fill(random(255), 90 + 10 * cos(a/3), 100);
                        break;
                    case 4:
                        fill(40, 30 + 50 * cos(a/3), 100);
                        break;

                    default:
                        fill(155, 100 * cos(a/3), 100);
                        break;
                }



                if (drawText == 1) {
                    // text
                    var curChar = sentance[uniqueVarTextIdx][i%sentance[0].length];

                    textSize(tsNormal);

                    // Highlighting
                    var highlightText = ['폭', '탄', '격', '발', '공', '습'];
                    // if (curChar === '폭' || curChar === '탄' || curChar === '격' || curChar === '발' || curChar === '공' || curChar === '습') {
                    if (highlightText.includes(curChar)){
                        fill(5, 100, 100);
                        textSize(tsLarge);
                    };

                    text(curChar, x, y);

                } else {
                    // ellipse
                    ellipse(x, y, tsNormal/2, tsNormal/2 - 1);    
                }
        
            }

            pop();


            break;

        case CATCH_BALL_ENDDING:
            // text ball rotation with 1 ball
            if (endingMakeWhite) {
                colorMode(RGB);
                // background(0, 0, 100);
                background(0);
                endingBackCol = 200;
            } else {
                colorMode(HSB);
                background(endingBackCol, endingBackSat, 100);
            };

            // text ball
            push();
            translate(innerWidth/2, innerHeight/2);

            // rotate
            var r = frameCount % 360 * 2;
            r = r * (noise(frameCount/40) - 0.5);
            rotate(r);
            // console.log(r);

            // noise random values
            // var max = noise(frameCount/20) * 600;
            var max = noise(frameCount/20) * (endingBackCol * 4);
            var ka = 134 + noise(frameCount/30) * 1.7;
            var space = 1 + noise(frameCount/30) * 3;
            var ts = 8 + noise(frameCount/40) * 12;


            // fill(155, 100 * cos(a/3) * 255, 200);
            for (var i = 0; i < max; i+=1) {

                // var a = i * 135.6;
                var a = i * ka;
                var r = c * sqrt(i);

                var x = space * r * cos(a); 
                var y = space * r * sin(a);


                fill(155, 100 * cos(a/3) * 255, 10 + 100 * ((max - i)/max));
                var curChar = sentance[uniqueVarTextIdx][i%sentance[uniqueVarTextIdx].length];

                textSize(ts);

                // Highlighting
                var highlightText = ['폭', '탄', '격', '발', '공', '습'];
                if (highlightText.includes(curChar)){
                    fill(5, 100, 100);
                    textSize(ts*2);
                };

                text(curChar, x, y);
                // vertex(x, y);
        
            }

            pop();
            break;

        case LOGGED_OUT:

            if (loggedOutIsFirstTime) {
                botany_count = 0;
                loggedOutIsFirstTime = false;
                console.log("sh: " + uniqueVarShape);
                console.log("cl: " + uniqueVarColor);
                console.log("textidx: " + uniqueVarTextIdx);
            }
            
            background(255);
            colorMode(HSB);

            // make static
            uniqueVarShape = 1;

            // botany variation
            var k, s, rmin, rmax;
            switch(uniqueVarShape) {
                case 0:
                    k = 137.3;
                    s = 3;
                    rmin = 6; rmax = 9;
                    break;
                case 1:
                    k = 137.5;
                    s = 2.5;
                    rmin = 1; rmax = 3;
                    break;
                case 2:
                    k = 137.6;
                    s = 1.8;
                    rmin = 4; rmax = 5;
                    break;
                case 3:
                    k = 137.7;
                    s = 3;
                    rmin = 3; rmax = 8;
                    break;
                case 4:
                    k = 137.8;
                    s = 2.9;
                    rmin = 2; rmax = 4;
                    break;
 
                default:
                    k = 137.6;
                    s = 2;
                    rmin = 4; rmax = 8;
                    break;
            }


            push();
            translate(innerWidth/2, innerHeight/2);
            
            if (frameCount % botany_frameDiv == 0) {
                botany_count++;
            }
            // if (botany_count > botany_count_limit) botany_count = botany_count_limit;

            for (var i = 0; i < botany_count; i+=1) {

                // var a = i * 135.6;
                var a = i * k;
                var r = c * sqrt(i);

                var x = s * r * cos(a); 
                var y = s * r * sin(a);

                // noFill();
                // stroke(0);
                noStroke();
                fill(0);
                ellipse(x, y, tsNormal/2, tsNormal/2 - 1);    
        
            }

            pop();


            colorMode(RGB);
            textAlign(CENTER);
            
            var ts = innerWidth/8;
            textSize(ts);

            if (frameCount % 30 == 0) loggedOutBlinking = !loggedOutBlinking;

            noFill();
            // if (loggedOutBlinking) fill(0, 0) 
            if (loggedOutBlinking) stroke(0, 0) 
            // else fill(0, 255);
            else stroke(0, 255);

            text("Logged Out", innerWidth/2, innerHeight/2);

            break;

        default:
            break;
    }

 
}


//================================== socket.io handler ==================================
// socket.io callback

// orientation
socket.on('ori0', function(_data) {
    storeOrientation(0, _data);
});

socket.on('ori1', function(_data) {
    // console.log("get ori of ball 1 from client()");
    // console.log(_data);
    storeOrientation(1, _data);
});

socket.on('ori2', function(_data) {
    // console.log("get ori of ball 2 from client()");
    // console.log(_data);
    storeOrientation(2, _data);
});

socket.on('ori3', function(_data) {
    // console.log("get ori of ball 3 from client()");
    // console.log(_data);
    storeOrientation(3, _data);
});


// acc
socket.on('acc0', function(_data) {
    // console.log("get acc from client()")
    // console.log(_data);
    storeAcceleration(0, _data);
});

socket.on('acc1', function(_data) {
    // console.log("get acc of ball 1 from client()");
    // console.log(_data);
    storeAcceleration(1, _data);
});

socket.on('acc2', function(_data) {
    // console.log("get acc of ball 2 from client()");
    // console.log(_data);
    storeAcceleration(2, _data);
});

socket.on('acc3', function(_data) { 
    // console.log("get acc of ball 3 from client()");
    // console.log(_data);
    storeAcceleration(3, _data);
});

// ========== STAGING ==========
socket.on('setStage', function(_data) {
    // console.log("Go to stage " + _data.value);
    stage = parseInt(_data.value);
});


// ========== LOGGEED_IN ==========
socket.on('loggedIn', function(_data) {
    console.log(_data);
    logId = _data;
    uniqueVarShape = logId.charCodeAt(0) % NUM_SHAPE_VAR;
    uniqueVarColor = logId.charCodeAt(_data.length-1) % NUM_COLOR_VAR;
    uniqueVarTextIdx = logId.charCodeAt(1) % NUM_TEXT_VAR;
    console.log("textidx: " + uniqueVarTextIdx);

});

// ========== 1 ==========
socket.on('drawFirstBotany', function(_data) {
    // console.log(_data);
    drawFirstBotany = _data.value;
});


// ========== 2 ==========
socket.on('drawBotany', function(_data) {
    console.log(_data);
    drawBotany = _data.value;
    var_shape = _data._shape;
    var_color = _data._color;
});

socket.on('variantBotany', function(_data) {
    // console.log(_data);
    variantBotany = _data.value;
});

socket.on('setRotation', function(_data) {
    // console.log(_data);
    botany_orientation = map(_data.value, ORI_X_MIN, ORI_X_MAX, 0, 360);
});


// ========== 3 ==========
socket.on('drawImages', function(_data) {
    drawImages = _data.value;
    image_alpha = map(_data._alpha, ORI_X_MIN, ORI_X_MAX, 0, 360);
    img_random_idx = Math.floor(map(_data._alpha, ORI_X_MIN, ORI_X_MAX, 0, NUM_IMAGES));
    // console.log(img_random_idx);

});

socket.on('imageAlpha', function(_data) {
//   console.log(_data);
    image_alpha = map(_data.value, 0.0, 360.0, 0, 255);
});

// ========== 4 ==========
socket.on('drawText', function(_data) {
    drawText = _data.value;
});


// ========== ENDING ==========
socket.on('setBackground', function(_data) {
    // console.log(_data);
    var d = _data.value;
    if (d != 1000) {
        endingBackCol = map((d), ACC_X_MIN, ACC_X_MAX, 0, 255);
        endingBackSat = noise(d/10) * 100;
        // console.log(endingBackCol);
        // console.log(endingBackSat);
        endingMakeWhite = false;
    } else {
        endingBackCol = d;
        endingMakeWhite = true;
    }
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



//================================== functions ==================================
function storeOrientation(ball_id, _data) {
    bufferBallsOri[ball_id][0].push(_data.x);
    bufferBallsOri[ball_id][1].push(_data.y);
    bufferBallsOri[ball_id][2].push(_data.z);
    if (bufferBallsOri[ball_id][0].length > bufLen) bufferBallsOri[ball_id][0].shift();
    if (bufferBallsOri[ball_id][1].length > bufLen) bufferBallsOri[ball_id][1].shift();
    if (bufferBallsOri[ball_id][2].length > bufLen) bufferBallsOri[ball_id][2].shift();
}

function storeAcceleration(ball_id, _data) {
    bufferBallsAcc[ball_id][0].push(_data.x);
    bufferBallsAcc[ball_id][1].push(_data.y);
    bufferBallsAcc[ball_id][2].push(_data.z);
    if (bufferBallsAcc[ball_id][0].length > bufLen) bufferBallsAcc[ball_id][0].shift();
    if (bufferBallsAcc[ball_id][1].length > bufLen) bufferBallsAcc[ball_id][1].shift();
    if (bufferBallsAcc[ball_id][2].length > bufLen) bufferBallsAcc[ball_id][2].shift();
}

function storeGravity(ball_id, _data) {
    bufferBallsG[ball_id][0].push(_data.x);
    bufferBallsG[ball_id][1].push(_data.y);
    bufferBallsG[ball_id][2].push(_data.z);
    if (bufferBallsG[ball_id][0].length > bufLen) bufferBallsG[ball_id][0].shift();
    if (bufferBallsG[ball_id][1].length > bufLen) bufferBallsG[ball_id][1].shift();
    if (bufferBallsG[ball_id][2].length > bufLen) bufferBallsG[ball_id][2].shift();
}

function storeVelocity(ball_id, _data) {
    bufferBallsVel[ball_id][0].push(_data.x);
    bufferBallsVel[ball_id][1].push(_data.y);
    bufferBallsVel[ball_id][2].push(_data.z);
    if (bufferBallsVel[ball_id][0].length > bufLen) bufferBallsVel[ball_id][0].shift();
    if (bufferBallsVel[ball_id][1].length > bufLen) bufferBallsVel[ball_id][1].shift();
    if (bufferBallsVel[ball_id][2].length > bufLen) bufferBallsVel[ball_id][2].shift();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}



//================================== control function ==================================
function mouseClicked() {

    // img_random_idx = Math.floor((Math.random() * 29));
    // console.log(img_random_idx);
    // drawImage = !drawImage;

    Tone.Transport.toggle();
    console.log("Tone transport toggle");
    // seq.start(0);

    // for (var i = 0; i < 4; i++) {
    //     loops[i].start(0);
    // }

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
    }

    // uncomment to prevent any default behavior
    return false;
  }