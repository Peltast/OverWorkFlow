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

            this.nodeColor = "#29adff";
            this.nodeSize = 20;
            
            this.setupTree();
        }

        setupTree() {
            var row1Y = StageHeight * .25 - 50;
            var row2Y = StageHeight * .5 - 50;
            var row3Y = StageHeight * .75 - 50;
            var row4Y = StageHeight * .92 - 50;

            var root = this.createNode("Root", NodeType.ROOT, new Point(0, 0));
            var row1 = this.createNode("Row1", NodeType.INTERSECTION, new Point(0, row1Y));

            var row2Left = this.createNode("Row2Left", NodeType.INTERSECTION, new Point(-100, row2Y));
            var row2Right = this.createNode("Row2Right", NodeType.INTERSECTION, new Point(100, row2Y));
            
            var row3LL = this.createNode("Row3LL", NodeType.INTERSECTION, new Point(-150, row3Y));
            var row3LR = this.createNode("Row3LR", NodeType.INTERSECTION, new Point(-50, row3Y));
            var row3RL = this.createNode("Row3RL", NodeType.INTERSECTION, new Point(50, row3Y));
            var row3RR = this.createNode("Row3RR", NodeType.INTERSECTION, new Point(150, row3Y));

            var row4endLNull = this.createNode("Row4LNull", NodeType.ENDNULL, new Point(-200, row4Y));
            var row4endLeft = this.createNode("Row4endLeft", NodeType.ENDLEFT, new Point(-100, row4Y));
            var row4endCenter = this.createNode("Row4endCenter", NodeType.ENDCENTER, new Point(0, row4Y));
            var row4endRight = this.createNode("Row4endRight", NodeType.ENDRIGHT, new Point(100, row4Y));
            var row4endRNull = this.createNode("Row4RNull", NodeType.ENDNULL, new Point(200, row4Y));

            this.addChildNode(root, row1);

            this.addChildNode(row1, row2Left);
            this.addChildNode(row1, row2Right);
            
            this.addChildNode(row2Left, row3LL);
            this.addChildNode(row2Left, row3LR);
            this.addChildNode(row2Right, row3RL);
            this.addChildNode(row2Right, row3RR);
            
            this.addChildNode(row3LL, row4endLNull);
            this.addChildNode(row3LL, row4endLeft);
            this.addChildNode(row3LR, row4endLeft);
            this.addChildNode(row3LR, row4endCenter);
            this.addChildNode(row3RL, row4endCenter);
            this.addChildNode(row3RL, row4endRight);
            this.addChildNode(row3RR, row4endRight);
            this.addChildNode(row3RR, row4endRNull);

            row1.setIntersection("left");
            row2Left.setIntersection("left");
            row2Right.setIntersection("right");
            row3LL.setIntersection("right");
            row3LR.setIntersection("left");
            row3RL.setIntersection("left");
            row3RR.setIntersection("right");

            this.rootNode = root;
        }

        createNode(id, type, location) {
            if (this.nodeMap[id]) {
                console.log("ERROR: attempted to create duplicate node of ID " + id);
                return;
            }

            var node = new TreeNode(id, type, this.nodeSize, this.nodeColor, location);
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


    }

    class TreeNode {

        constructor(id, type, size, color, location) {
            this.id = id;
            this.type = type;
            this.size = size;
            this.color = color;
            this.location = location;
            this.origin = new Point(location.X + this.size + 2, location.Y + this.size);

            this.nodeContainer = new createjs.Container();
            this.nodeContainer.x = location.X;
            this.nodeContainer.y = location.Y;

            this.childNodeData = [];

            this.orientation = "";
            this.state = "idle";

            this.drawNode();
            if (this.type === NodeType.INTERSECTION)
                this.attachEventListeners();
        }

        drawNode() {
            var spriteSheet;
            var spriteSize = new Point(46, 52);

            if (this.type === NodeType.INTERSECTION) {
                spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets["IntersectionNode"]], 
                    "frames": {"width": spriteSize.X, "height": spriteSize.Y, "regX": 0, "regY": 0, "count": 6},
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
                else if (this.type === NodeType.ENDNULL)
                    spriteName = "ErrorNode";

                spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets[spriteName]], 
                    "frames": {"width": spriteSize.X, "height": spriteSize.Y, "regX": 0, "regY": 0, "count": 1},
                    animations: { idle: 0 }
                });
            }
            
            this.nodeSprite = new createjs.Sprite(spriteSheet);
            this.nodeSprite.gotoAndPlay(this.orientation + this.state);
            // this.nodeSprite.x = -this.size - spriteSize.X / 2;
            // this.nodeSprite.y = -this.size - spriteSize.Y / 2;

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
                    targetNode.setIntersection(targetNode.orientation == "left" ? "right" : "left");
                }
                targetNode.state = "idle";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            });
            this.nodeSprite.on("mouseout", function() {
                if (targetNode.state == "Press") {
                    targetNode.setIntersection(targetNode.orientation == "left" ? "right" : "left");
                }
                targetNode.state = "idle";
                targetNode.nodeSprite.gotoAndPlay(targetNode.orientation + targetNode.state);
            });
        }

        setIntersection(newDirection = "") {
            if (this.type !== NodeType.INTERSECTION)
                return;

            if (newDirection == "left" || newDirection == "right")
                this.orientation = newDirection;

            if (this.childNodeData.length >= 2) {
                this.childNodeData[0].connection.setActive(this.orientation == "left");
                this.childNodeData[1].connection.setActive(this.orientation == "right");
            }
            this.nodeSprite.gotoAndPlay(this.orientation + this.state);
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
            this.connectionLine.graphics.setStrokeStyle(3);
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