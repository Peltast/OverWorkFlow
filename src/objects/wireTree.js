define("WireTree", ['Point'], function(Point) {

    class WireTree {

        constructor() {
            this.treeContainer = new createjs.Container();
            this.signalLayer = new createjs.Container();
            this.nodeLayer = new createjs.Container();
            this.connectionLayer = new createjs.Container();
            this.treeContainer.addChild(this.connectionLayer, this.nodeLayer, this.signalLayer);

            this.nodeMap = {};
            this.rootNode;
            this.connections = {};

            this.nodeSize = 20;
            
            this.setupTree();
        }

        setupTree() {
            var row1Y = StageHeight * .22 - 50;
            var row2Y = StageHeight * .35 - 50;
            var row3Y = StageHeight * .55 - 50;
            var row4Y = StageHeight * .75 - 50;
            var row5Y = StageHeight * .92 - 50;

            var root = this.createNode("Root", NodeType.ROOT, new Point(0, 0));
            var row1 = this.createNode("Row1", NodeType.INTERSECTION, new Point(0, row1Y));

            var row2Left = this.createNode("Row2Left", NodeType.INTERSECTION, new Point(-100, row2Y));
            var row2Right = this.createNode("Row2Right", NodeType.INTERSECTION, new Point(100, row2Y));
            
            var row3LL = this.createNode("Row3LL", NodeType.INTERSECTION, new Point(-150, row3Y));
            var row3LR = this.createNode("Row3LR", NodeType.INTERSECTION, new Point(-50, row3Y));
            var row3RL = this.createNode("Row3RL", NodeType.INTERSECTION, new Point(50, row3Y));
            var row3RR = this.createNode("Row3RR", NodeType.INTERSECTION, new Point(150, row3Y));

            var row4_1 = this.createNode("Row4_1", NodeType.INTERSECTION, new Point(-175, row4Y));
            var row4_2 = this.createNode("row4_2", NodeType.INTERSECTION, new Point(-88, row4Y));
            var row4_3 = this.createNode("row4_3", NodeType.INTERSECTION, new Point(0, row4Y));
            var row4_4 = this.createNode("row4_4", NodeType.INTERSECTION, new Point(88, row4Y));
            var row4_5 = this.createNode("row4_5", NodeType.INTERSECTION, new Point(175, row4Y));
            
            var row5_1 = this.createNode("Row5_1", NodeType.ENDLEFT, new Point(-200, row5Y));
            var row5_2 = this.createNode("Row5_2", NodeType.ENDCENTER, new Point(-125, row5Y));
            var row5_3 = this.createNode("Row5_3", NodeType.ENDLEFT, new Point(-40, row5Y));
            var row5_4 = this.createNode("Row5_4", NodeType.ENDRIGHT, new Point(40, row5Y));
            var row5_5 = this.createNode("Row5_5", NodeType.ENDCENTER, new Point(125, row5Y));
            var row5_6 = this.createNode("Row5_6", NodeType.ENDRIGHT, new Point(200, row5Y));

            this.addChildNode(root, row1);

            this.addChildNode(row1, row2Left);
            this.addChildNode(row1, row2Right);
            
            this.addChildNode(row2Left, row3LL);
            this.addChildNode(row2Left, row3LR);
            this.addChildNode(row2Right, row3RL);
            this.addChildNode(row2Right, row3RR);
            
            this.addChildNode(row3LL, row4_1);
            this.addChildNode(row3LL, row4_2);
            this.addChildNode(row3LR, row4_2);
            this.addChildNode(row3LR, row4_3);
            this.addChildNode(row3RL, row4_3);
            this.addChildNode(row3RL, row4_4);
            this.addChildNode(row3RR, row4_4);
            this.addChildNode(row3RR, row4_5);
            
            this.addChildNode(row4_1, row5_1);
            this.addChildNode(row4_1, row5_2);
            
            this.addChildNode(row4_2, row5_2);
            this.addChildNode(row4_2, row5_3);
            
            this.addChildNode(row4_3, row5_3);
            this.addChildNode(row4_3, row5_4);
            
            this.addChildNode(row4_4, row5_4);
            this.addChildNode(row4_4, row5_5);

            this.addChildNode(row4_5, row5_5);
            this.addChildNode(row4_5, row5_6);

            row1.setIntersection("left");
            row2Left.setIntersection("right");
            row2Right.setIntersection("left");

            row3LL.setIntersection("right");
            row3LR.setIntersection("left");
            row3RL.setIntersection("right");
            row3RR.setIntersection("left");
            
            row4_1.setIntersection("right");
            row4_2.setIntersection("left");
            row4_3.setIntersection("left");
            row4_4.setIntersection("right");
            row4_5.setIntersection("left");

            this.rootNode = root;
        }

        createNode(id, type, location) {
            if (this.nodeMap[id]) {
                console.log("ERROR: attempted to create duplicate node of ID " + id);
                return;
            }

            var node = new TreeNode(id, type, this.nodeSize, location);
            this.nodeLayer.addChild(node.nodeContainer);
            
            this.nodeMap[id] = node;
            return node;
        }

        addChildNode(parent, child) {

            var curveData = {};
            if (parent.origin.X !== child.origin.X)
                curveData = this.getConnectionCurve(parent, child);
            var connection = new TreeConnection(parent.origin, child.origin, curveData);
            
            var childData = {"node": child, "connection": connection};
            parent.addChildNode(childData);
            
            this.connections[parent.id + "-" + child.id] = connection;
            this.connectionLayer.addChild(connection.connectionContainer);
        }

        addSignal(newSignal) {
            this.signalLayer.addChild(newSignal.signalContainer);
        }
        removeSignal(oldSignal) {
            this.signalLayer.removeChild(oldSignal.signalContainer);
        }

        getConnectionCurve(parent, child) {
            var deltaY = child.origin.Y - parent.origin.Y;

            var controlA = new Point(parent.origin.X, parent.origin.Y + (deltaY / 3) );
            var controlB = new Point(child.origin.X, parent.origin.Y + (deltaY / 3) );

            return {
                "bezier": true,
                "controlA": controlA,
                "controlB": controlB
            }
        }

        update(deltaTime) {
            for (var id in this.nodeMap) {
                var node = this.nodeMap[id];
                node.update(deltaTime);
            }
        }


    }

    class TreeNode {

        constructor(id, type, size, location) {
            this.id = id;
            this.type = type;
            this.size = size;
            this.spriteSize = new Point(48, 52);
            this.location = location;
            this.origin = new Point(location.X + this.size + 2, location.Y + this.size);

            this.nodeContainer = new createjs.Container();
            this.nodeContainer.x = location.X;
            this.nodeContainer.y = location.Y;

            this.childNodeData = [];

            this.orientation = "";
            this.state = "idle";
            this.burnedOut = false;

            this.burnoutTickTimerThreshold = 2000;
            this.burnoutTickThreshold = 2;
            this.burnoutTickCount = 1;
            this.burnoutLevel = 0;
            this.lastSwitchTime;
            this.cooldownTimer = 0;

            this.drawNode();
            this.drawBurnoutMarkers();
            this.drawBurntNode();
            
            if (this.type === NodeType.INTERSECTION)
                this.attachEventListeners();
        }

        drawNode() {
            var spriteSheet;

            if (this.type === NodeType.INTERSECTION) {
                spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets["IntersectionNode"]], 
                    "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 6},
                    animations: { 
                        idle: 0, leftidle: 0, leftHover: 1, leftPress: 2,
                        rightidle: 3, rightHover: 4, rightPress: 5
                    }
                });
                this.orientation = "left";
            }
            else {
                var spriteName = "";
                if (this.type === NodeType.ROOT)
                    spriteName = "Node";
                else if (this.type === NodeType.ENDLEFT)
                    spriteName = "InputNodeLeft";
                else if (this.type === NodeType.ENDCENTER)
                    spriteName = "InputNode";
                else if (this.type === NodeType.ENDRIGHT)
                    spriteName = "InputNodeRight";
                else if (this.type === NodeType.ENDLEFTNULL || this.type === NodeType.ENDRIGHTNULL)
                    spriteName = "ErrorNode";

                spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets[spriteName]], 
                    "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 1},
                    animations: { idle: 0 }
                });
            }            
            this.nodeSprite = new createjs.Sprite(spriteSheet);
            this.nodeSprite.gotoAndPlay(this.orientation + this.state);

            this.nodeContainer.addChild(this.nodeSprite);
        }

        attachEventListeners() {
            var targetNode = this;
            this.nodeSprite.on("mouseover", function() {
                targetNode.state = "Hover";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            })
            this.nodeSprite.on("mousedown", function() {
                targetNode.state = "Press";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            });
            
            this.nodeSprite.on("click", function() {
                if (targetNode.state == "Press") {
                    playSound("ClickNode", 0.1);
                    targetNode.switchIntersection();
                }
                targetNode.state = "idle";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            });
            this.nodeSprite.on("mouseout", function() {
                if (targetNode.state == "Press") {
                    playSound("ClickNode", 0.1);
                    targetNode.switchIntersection();
                }
                targetNode.state = "idle";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            });
        }

        drawBurnoutMarkers() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["Embers"]], 
                "frames": {"width": 20, "height": 32, "regX": 0, "regY": 0, "count": 8},
                animations: { left: [0, 3, "left", .2], right: [4, 7, "right", .2] }
            });

            this.nwEmber = new createjs.Sprite(spriteSheet);
            this.nwEmber.x = -8;
            this.nwEmber.y = -20;
            this.nwEmber.gotoAndPlay("left");
            this.wEmber = new createjs.Sprite(spriteSheet);
            this.wEmber.x = -20;
            this.wEmber.gotoAndPlay("left");
            this.swEmber = new createjs.Sprite(spriteSheet);
            this.swEmber.x = -12;
            this.swEmber.y = 28;
            this.swEmber.gotoAndPlay("left");
            this.neEmber = new createjs.Sprite(spriteSheet);
            this.neEmber.x = 36;
            this.neEmber.y = -20;
            this.neEmber.gotoAndPlay("right");
            this.eEmber = new createjs.Sprite(spriteSheet);
            this.eEmber.x = 48;
            this.eEmber.gotoAndPlay("right");
            this.seEmber = new createjs.Sprite(spriteSheet);
            this.seEmber.x = 40;
            this.seEmber.y = 28;
            this.seEmber.gotoAndPlay("right");
        }
        drawBurntNode() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["BurntNode"]], 
                "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 0, "regY": 0, "count": 8},
                animations: { idle: 0 }
            });
            this.burntSprite = new createjs.Sprite(spriteSheet);
        }

        removeBurnoutMarkers() {
            this.nodeContainer.removeChild(this.swEmber, this.seEmber, this.wEmber, this.eEmber, this.nwEmber, this.neEmber);
        }
        drawBurnoutLevel(level) {
            if (level < 0 || level > 3)
                return;
            if (level == 0) {
                this.removeBurnoutMarkers();
            }
            else if (level == 1) {
                this.removeBurnoutMarkers();
                this.nodeContainer.addChild(this.swEmber, this.seEmber);
            }
            else if (level == 2) {
                this.removeBurnoutMarkers();
                this.nodeContainer.addChild(this.swEmber, this.seEmber, this.wEmber, this.eEmber);
            }
            else {
                this.nodeContainer.addChild(this.nwEmber, this.wEmber, this.swEmber, this.neEmber, this.eEmber, this.seEmber);
            }
        }

        switchIntersection() {
            this.setIntersection(this.orientation == "left" ? "right" : "left");
        }
        setIntersection(newDirection = "") {
            if (this.type !== NodeType.INTERSECTION)
                return;

            this.checkBurnoutTick();

            if (newDirection == "left" || newDirection == "right")
                this.orientation = newDirection;

            if (this.childNodeData.length >= 2) {
                this.childNodeData[0].connection.setActive(this.orientation == "left");
                this.childNodeData[1].connection.setActive(this.orientation == "right");
            }
            this.nodeSprite.gotoAndPlay(this.orientation + this.state);
        }
        checkBurnoutTick() {
            if (this.burnoutLevel >= 4)
                return;

            var currentTime = new Date().getTime();
            if (!this.lastSwitchTime) {
                this.lastSwitchTime = currentTime;
                return;
            }
            if (currentTime - this.lastSwitchTime < this.burnoutTickTimerThreshold) {
                this.lastSwitchTime = currentTime;
                this.cooldownTimer = 0;

                this.incrementBurnoutTick();
            }
            else
                this.lastSwitchTime = currentTime;
        }
        incrementBurnoutTick() {
            this.burnoutTickCount += 1;

            if (this.burnoutTickCount >= this.burnoutTickThreshold) {
                this.burnoutTickCount = 0;

                this.burnoutLevel += 1;
                playSound("BurnTick", 0.5);

                if (this.burnoutLevel <= 3)
                    this.drawBurnoutLevel(this.burnoutLevel);
                else
                    this.createFireSignal();
            }
        }
        createFireSignal() {
            this.burnoutLevel = 0;
            this.drawBurnoutLevel(this.burnoutLevel);
            playSound("BurnOut", 0.5);

            SignalGeneration.push({"node": this.id, "type": SignalType.BURNOUT });
        }

        burnNode() {
            this.burnedOut = true;

            this.nodeContainer.removeChild(this.nodeSprite);
            this.nodeContainer.addChild(this.burntSprite);
            this.burnoutLevel = 3;
            this.drawBurnoutLevel(3);
            playSound("BurnNode", 0.5);
        }
        coolOffNode() {
            this.burnedOut = false;

            this.nodeContainer.removeChild(this.burntSprite);
            this.nodeContainer.addChild(this.nodeSprite);
        }

        update(deltaTime) {
            this.checkCooldown(deltaTime);
        }
        checkCooldown(deltaTime) {
            if (this.burnoutLevel == 0)
                return;

            this.cooldownTimer += deltaTime;
            var cooldownThreshold = this.burnoutTickTimerThreshold * 2;
            if (this.burnedOut)
                cooldownThreshold *= 2;
            if (this.cooldownTimer >= cooldownThreshold) {
                this.cooldownTimer = 0;

                this.burnoutLevel -= 1;
                this.drawBurnoutLevel(this.burnoutLevel);

                if (this.burnoutLevel == 0 && this.burnedOut)
                    this.coolOffNode();
            }
        }

        addChildNode(childData) {
            this.childNodeData.push(childData);
        }
        
        getTargetNodeData() {
            if (this.childNodeData.length == 1) {
                return this.childNodeData[0];
            }
            else if (this.childNodeData.length == 2 && this.type === NodeType.INTERSECTION) {
                return ( this.orientation == "left" ? this.childNodeData[0] : this.childNodeData[1] );
            }
            else {
                return null;
            }
        }

        isEndNode() {
            return (
                this.type === NodeType.ENDCENTER || this.type === NodeType.ENDLEFT || this.type === NodeType.ENDLEFTNULL ||
                this.type === NodeType.ENDCENTER || this.type === NodeType.ENDRIGHT || this.type === NodeType.ENDRIGHTNULL
            );
        }

    }

    class TreeConnection {

        constructor(startPoint, endPoint, lineData = {}) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.lineData = lineData;

            this.activeColor = "#fff1e8";
            this.inactiveColor = "#5f574f";
            this.active = true;

            this.connectionContainer = new createjs.Container();
            this.drawConnection();
        }
        isBezierCurve() {
            return this.lineData["bezier"];
        }

        drawConnection() {
            if (this.connectionContainer.contains(this.connectionLine))
                this.connectionContainer.removeChild(this.connectionLine);
            
            this.connectionLine = new createjs.Shape();
            this.connectionLine.graphics.setStrokeStyle(4);
            this.connectionLine.graphics.beginStroke(this.active ? this.activeColor : this.inactiveColor);

            if (this.isBezierCurve()) {
                this.drawBezierCurve();
            }
            else {
                this.drawLine();
            }

            this.connectionContainer.addChild(this.connectionLine);
        }
        drawLine() {
            this.connectionLine.graphics.moveTo(this.startPoint.X, this.startPoint.Y);
            this.connectionLine.graphics.lineTo(this.endPoint.X, this.endPoint.Y);
            this.connectionLine.graphics.endStroke();
        }
        drawBezierCurve() {
            var bezierA = this.lineData["controlA"];
            var bezierB = this.lineData["controlB"];

            this.connectionLine.graphics.moveTo(this.startPoint.X, this.startPoint.Y);
            this.connectionLine.graphics.bezierCurveTo(bezierA.X, bezierA.Y, bezierB.X, bezierB.Y, this.endPoint.X, this.endPoint.Y);
            this.connectionLine.graphics.endStroke();
        }

        setActive(active) {
            if (this.active == active)
                return;
            else {
                this.active = active;
                this.drawConnection();
            }
        }

    }



    return WireTree;
});