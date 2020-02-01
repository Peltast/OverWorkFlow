$(function() {
    mainInit();
});

var Stage;
var StageWidth = 960;
var StageHeight = 640;
var GameScale = 1;

var ImageRoot = "./lib/images/";
var SoundRoot = "./lib/sounds/";

var GameStatus;

const GameState = {
    "PRELOADING": 1, "PRELOADED": 2,
    "RUNNING": 10
}

const NodeType = {
    "ROOT": 1, 
    "INTERSECTION": 2,
    "ENDLEFT": 3, "ENDRIGHT": 4, "ENDCENTER": 5, "ENDNULL": 6
}

function mainInit() {
    Stage = new createjs.Stage("gameCanvas", { "antialias": false });
    Stage.enableMouseOver(20);
    createjs.Ticker.framerate = 60;

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

