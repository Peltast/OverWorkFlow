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
            
            addEventListener("keyup", onKeyUp);
        }
        else if (GameStatus === GameState.RUNNING) {
            var currentTime = new Date().getTime();
            var deltaTime = currentTime - lastFrameTimestamp;
            lastFrameTimestamp = currentTime;

            runGame(deltaTime);
        }
    }
    function onKeyUp(event) {
        if (event.keyCode == 82 && GameStatus === GameState.RUNNING) {
            Stage.removeAllChildren();

            ExecutiveTree = null;
            GameSignals = [];
            SignalGeneration = [];
            GameScore = 0;
            launchGame();
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

        addSignal("Root", SignalType.POSITIVE);
        addSignal("Row3RL", SignalType.POSITIVE);
    }

    function addSignal(startNodeID, signalType) {
        var signal = new Signal(signalType);
        signal.setSignalToNode(ExecutiveTree.nodeMap[startNodeID]);
        GameSignals.push(signal);
        ExecutiveTree.addSignal(signal);
    }
    function removeSignal(signal) {
        ExecutiveTree.removeSignal(signal);
        GameSignals.splice(GameSignals.indexOf(signal), 1);
    }

    function createMetaGame() {
        MetaGameArea = new MetaGame();

        MetaGameArea.metagameContainer.x = 488;
        MetaGameArea.metagameContainer.y = 4;
    }

    function runGame(deltaTime) {
        var removeList = [];
        var negativeSignalCount = 0;

        GameSignals.forEach((signal) => {
            signal.update(deltaTime);

            if (signal.type === SignalType.NEGATIVE)
                negativeSignalCount += 1;

            if (signal.message !== null) {
                handleSignalMessage(signal.message);
                signal.message = null;
            }

            if (signal.targetNode == null) {
                if (signal.type !== SignalType.POSITIVE)
                    removeList.push(signal);

                signal.setSignalToNode(ExecutiveTree.rootNode);
            }
            
        });
        for (let i = 0; i < removeList.length; i++)
            removeSignal(removeList[i]);

        for (let j = 0; j < SignalGeneration.length; j++) {
            if (!SignalGeneration[j].node || !SignalGeneration[j].type)
                continue;

            if (negativeSignalCount >= 6 && SignalGeneration[j].type === SignalType.NEGATIVE)
                continue;

            addSignal(SignalGeneration[j].node, SignalGeneration[j].type);
        }
        SignalGeneration = [];

        ExecutiveTree.update(deltaTime);
        MetaGameArea.update(deltaTime);

        Stage.update();
    }
    
    function handleSignalMessage(message) {
        if (message === SignalMessage.MOVELEFT || message === SignalMessage.MOVECENTER || message === SignalMessage.MOVERIGHT) {
            playSound("SignalConfirm", 0.01);
            MetaGameArea.changePlayerMovement(message);
        }
    }

});

