require([], function() {

    $(function() {
        GameStatus = GameState.PRELOADING;
        initGame();
    });

    function initGame() {
        createjs.Ticker.addEventListener("tick", updateGame);
    }

    var gameBG;
    var gameArea;
    var gameUI;

    var gameDate;
    var lastFrameTimestamp;

    function updateGame() {
        if (!isFinishedLoading()) {
            return;
        }
        else if (GameStatus === GameState.PRELOADING) {
            GameStatus = GameState.PRELOADED;
            launchGame();
        }
        else if (GameStatus === GameState.RUNNING) {
            var currentTime = gameDate.getTime();
            var deltaTime = currentTime - lastFrameTimestamp;
            lastFrameTimestamp = currentTime;
            
            runGame(deltaTime);
        }
    }

    function launchGame() {
        gameDate = new Date();
        lastFrameTimestamp = gameDate.getTime();

        gameBG = new createjs.Shape();
        gameBG.graphics.beginFill("#000000").drawRect(0, 0, StageWidth, StageHeight);
        gameArea = new createjs.Container();
        gameUI = new createjs.Container();

        Stage.addChild(gameBG, gameArea, gameUI);

        // set up game objects

        // add event listeners

        GameStatus = GameState.RUNNING;
    }

    function runGame(deltaTime) {

    }

});

