require(['WireTree', 'Signal'], function(WireTree, Signal) {

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

    var TreeGameArea;
    var MetaGameArea;

    var lastFrameTimestamp;

    var ExecutiveTree;
    var GameSignals = [];

    function updateGame() {
        if (!isFinishedLoading()) {
            return;
        }
        else if (GameStatus === GameState.PRELOADING) {
            GameStatus = GameState.PRELOADED;
            launchGame();
        }
        else if (GameStatus === GameState.RUNNING) {
            var currentTime = new Date().getTime();
            var deltaTime = currentTime - lastFrameTimestamp;
            lastFrameTimestamp = currentTime;

            runGame(deltaTime);
        }
    }

    function launchGame() {
        lastFrameTimestamp = new Date().getTime();

        gameBG = new createjs.Shape();
        gameBG.graphics.beginFill("#ffccaa").drawRect(0, 0, StageWidth, StageHeight);
        gameArea = new createjs.Container();
        gameUI = new createjs.Container();

        Stage.addChild(gameBG, gameArea, gameUI);

        createTreeGame();
        createMetaGame();

        GameStatus = GameState.RUNNING;
    }
    function createTreeGame() {
        var treeGameBG = new createjs.Shape();
        treeGameBG.graphics.beginFill("#1d2b53").drawRect(4, 4, 476,632);
        gameArea.addChild(treeGameBG);
        
        ExecutiveTree = new WireTree();
        ExecutiveTree.treeContainer.x = 220;
        ExecutiveTree.treeContainer.y = StageHeight * .05;
        gameArea.addChild(ExecutiveTree.treeContainer);

        var testSignal = new Signal();
        testSignal.setSignalToNode(ExecutiveTree.nodeMap["Row2Right"]);
        GameSignals.push(testSignal);
        ExecutiveTree.addSignal(testSignal);
    }
    function createMetaGame() {

    }

    function runGame(deltaTime) {

        GameSignals.forEach((signal) => {
            signal.update(deltaTime);

            if (signal.targetNode == null)
                signal.setSignalToNode(ExecutiveTree.rootNode);
        });

        Stage.update();
    }

});

