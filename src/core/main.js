$(function() {
    mainInit();
});

var Stage;
var StageWidth = 960;
var StageHeight = 640;
var GameScale = 1;
var TargetFrameRate = 60;
var FrameLength = 1000 / TargetFrameRate;

var ImageRoot = "./lib/images/";
var SoundRoot = "./lib/sounds/";

var GameStatus;
var GameScore = 0;
var SignalGeneration = [];

const GameState = {
    "PRELOADING": 1, "PRELOADED": 2,
    "RUNNING": 10
};

const NodeType = {
    "ROOT": 1, 
    "INTERSECTION": 2,
    "ENDLEFT": 3, "ENDRIGHT": 4, "ENDCENTER": 5, "ENDLEFTNULL": 6, "ENDRIGHTNULL": 7
};
const SignalType = {
    "POSITIVE": 1, "POSTEMPORARY": 2, "NEGATIVE": 3, "BURNOUT": 4
};
const SignalMessage = {
    "MOVELEFT": 1, "MOVERIGHT": 2, "MOVECENTER": 3,
    "OFFSIDESLEFT": 4, "OFFSIDESRIGHT": 5
};
const WorkItemState = {
    "INACTIVE": 1, "BUILDING": 2, "ACTIVE": 3, "CLEARING": 4
};

function mainInit() {
    Stage = new createjs.Stage("gameCanvas", { "antialias": false });
    Stage.enableMouseOver(20);
    createjs.Ticker.framerate = TargetFrameRate;

    gameCanvas.setAttribute("tabindex", "0");
    gameCanvas.addEventListener("mouseover", function() {
        gameCanvas.focus();
    }, false);
    gameCanvas.addEventListener("focusout", function() {
        // gameCanvas.focus();
    }, false);
    gameCanvas.addEventListener("focus", function() {
        // gameCanvas.focus();
    }, false);
};

function playSound(soundName, vol) {
    var soundInstance = new Howl({
        src: [SoundRoot + soundAssets[soundName]], oop: false, volume: vol
    });
    soundInstance.play();
}

