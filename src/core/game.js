require(['WireTree', 'Signal', 'MetaGame'], function(WireTree, Signal, MetaGame) {

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
        gameArea.addChild(TreeGameArea, MetaGameArea.metagameContainer);

        GameStatus = GameState.RUNNING;
    }
    function createTreeGame() {
        TreeGameArea = new createjs.Container();

        var treeGameBG = new createjs.Shape();
        treeGameBG.graphics.beginFill("#1d2b53").drawRect(4, 4, 476, 632);
        TreeGameArea.addChild(treeGameBG);
        
        ExecutiveTree = new WireTree();
        ExecutiveTree.treeContainer.x = 220;
        ExecutiveTree.treeContainer.y = StageHeight * .05;
        TreeGameArea.addChild(ExecutiveTree.treeContainer);

        addSignal("Row1");
        addSignal("Row2Right");
        addSignal("Row3RL");
    }
    function addSignal(startNodeID) {
        var signal = new Signal();
        signal.setSignalToNode(ExecutiveTree.nodeMap[startNodeID]);
        GameSignals.push(signal);
        ExecutiveTree.addSignal(signal);
    }

    function createMetaGame() {
        MetaGameArea = new MetaGame();

        MetaGameArea.metagameContainer.x = 488;
        MetaGameArea.metagameContainer.y = 4;
    }

    function runGame(deltaTime) {

        GameSignals.forEach((signal) => {
            signal.update(deltaTime);

            if (signal.message !== null) {
                handleSignalMessage(signal.message);
                signal.message = null;
            }

            if (signal.targetNode == null)
                signal.setSignalToNode(ExecutiveTree.rootNode);
            
        });

        MetaGameArea.update(deltaTime);

        Stage.update();
    }
    
    function handleSignalMessage(message) {
        if (message === SignalMessage.MOVELEFT || message === SignalMessage.MOVECENTER || message === SignalMessage.MOVERIGHT) {
            MetaGameArea.changePlayerMovement(message);
        }
    }

});

