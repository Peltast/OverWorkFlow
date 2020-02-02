$(function() {
    preloaderInit();
});

var imageManifest;
var soundManifest;
var assetLoader;

var manifestTotal;
var loadCount = 0;

var gameAssets = {};
var soundAssets = {};

function preloaderInit() {
    
    imageManifest = [
        { "src": "tree/Node.png", id: "Node" },
        { "src": "tree/InputNode.png", id: "InputNode" }, { "src": "tree/InputNodeLeft.png", id: "InputNodeLeft" }, { "src": "tree/InputNodeRight.png", id: "InputNodeRight" },
        { "src": "tree/ErrorNode.png", id: "ErrorNode" },
        { "src": "tree/IntersectionNode.png", id: "IntersectionNode" },
        { "src": "tree/Signal.png", id: "Signal" }, { "src": "tree/NegativeSignal.png", id: "NegativeSignal" },
        { "src": "tree/Embers.png", id: "Embers" }, { "src": "tree/FireSignal.png", id: "FireSignal" },
        { "src": "tree/BurntNode.png", id: "BurntNode" },
        
        { "src": "metadisplay/background.png", id: "Background" },
        { "src": "metadisplay/player.png", id: "Player" }, {"src": "metadisplay/columnCursor.png", id: "ColumnCursor" },
        { "src": "metadisplay/station.png", id: "Station" }, { "src": "metadisplay/stationCursor.png", id: "StationCursor" }
    ];
    soundManifest = [
        { src: "8bit_Beep_alarm_03.wav", id:"WorkAlarm" },
        { src: "8bit_Beep_alarm_02.wav", id:"WorkOverflow" },
        { src: "Select_01.wav", id:"WorkProgress" },
        { src: "Arcade_Positive_Jingle_04_1.wav", id:"WorkComplete" },

        { src: "PP_UI_Select_1_3.wav", id:"ClickNode" },
        { src: "FA_Collect_Coin_1_1.wav", id:"SignalConfirm" },
        { src: "FA_Bad_Item_1.wav", id:"NegativeSingleConfirm" },
        { src: "PP_Jump_1_4.wav", id:"PlayerMove" },

        { src: "PP_Small_Impact_1_3.wav", id:"BurnTick" },
        { src: "PP_Small_Impact_1_2.wav", id:"BurnOut" },
        { src: "8bit_hit_5.wav", id:"BurnNode" }
    ];

    manifestTotal = imageManifest.length + soundManifest.length;

    assetLoader = new createjs.LoadQueue(false);
    assetLoader.addEventListener("complete", handleAssetsLoaded);
    assetLoader.loadManifest(imageManifest, true, ImageRoot);
};

function isFinishedLoading() {
    return (loadCount >= manifestTotal);
}

function handleAssetsLoaded(event) {
    for (let i = 0; i < imageManifest.length; i++) {
        console.log("Loaded asset: " + imageManifest[i].id);
        gameAssets[imageManifest[i].id] = assetLoader.getResult(imageManifest[i].id);
        loadCount += 1;
    }

    loadSounds();
}

function loadSounds() {
    for (let i = 0; i < soundManifest.length; i++) {
        soundAssets[soundManifest[i].id] = soundManifest[i].src + "?v=" + Math.round(1000 * Math.random(1000));
        var sound = new Howl({
            src: [SoundRoot + soundAssets[soundManifest[i].id]],
            loop: false,
            volume: 0
        });
        sound.once('load', function() {
            console.log("Loaded asset: " + soundManifest[i].src);
            loadCount += 1;
        });
    }
}

