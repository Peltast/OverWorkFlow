$(function() {
    init();
});

var imageManifest;
var soundManifest;
var assetLoader;

var manifestTotal;
var loadCount = 0;

var gameAssets = [];
var soundAssets = [];

function init() {
    
    imageManifest = [];
    soundManifest = [];

    manifestTotal = imageManifest.length + soundManifest.length;

    assetLoader = new createjs.LoadQueue(false);
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

