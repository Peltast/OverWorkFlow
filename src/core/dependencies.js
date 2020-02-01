require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    waitSeconds: 200,
    paths: {
        "test": "src/test",

        "game": "src/game"
    }
});

requirejs(['test'], function() {

    requirejs(['game']);
});