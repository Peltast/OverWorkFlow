require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    waitSeconds: 200,
    paths: {
        "point": "src/objects/point",
        "gameObject": "src/objects/gameObject",

        "wireTree": "src/objects/wireTree",
        "signal": "src/objects/signal",
        "metagame": "src/objects/metagame",

        "game": "src/core/game"
    }
});

requirejs(['point'], function() {

requirejs(['gameObject'], function() {

requirejs(['wireTree', 'signal', 'metagame'], function() {

requirejs(['game']);

});
});
});