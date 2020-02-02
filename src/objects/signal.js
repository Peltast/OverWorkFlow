define("Signal", ['Point'], function(Point) {

    class Signal {

        constructor(type) {
            this.location = new Point(0, 0);
            this.signalContainer = new createjs.Container();
            this.targetNode;
            this.currentConnection;
            this.message = null;
            this.spriteSize = new Point(44, 44);

            this.type = type; 

            this.inverseSpeed = 8;
            if (this.type === SignalType.BURNOUT || this.type === SignalType.NEGATIVE)
                this.inverseSpeed = 20;

            this.drawSignal();
        }
        drawSignal() {
            if (this.type === SignalType.BURNOUT) {
                this.spriteSize = new Point(36, 48);
                var spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets["FireSignal"]], 
                    "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 18, "regY": 24, "count": 5},
                    animations: { idle: [0, 4, "idle", .2] }
                });
            }
            else {
                var spriteName = "Signal";
                if (this.type === SignalType.NEGATIVE)
                    spriteName = "NegativeSignal";
                var spriteSheet = new createjs.SpriteSheet({
                    "images": [gameAssets[spriteName]], 
                    "frames": {"width": this.spriteSize.X, "height": this.spriteSize.Y, "regX": 22, "regY": 22, "count": 1},
                    animations: { idle: 0 }
                });
            }

            this.signalSprite = new createjs.Sprite(spriteSheet);
            this.signalSprite.gotoAndPlay("idle");

            this.signalContainer.addChild(this.signalSprite);
        }

        setSignalToNode(node) {
            this.location = node.origin.get();

            this.signalContainer.x = 15 + this.location.X - this.spriteSize.X / 2;
            this.signalContainer.y = 12 + this.location.Y - this.spriteSize.Y / 2;

            var nextNodeData = node.getTargetNodeData();
            if (nextNodeData != null) {
                this.targetNode = nextNodeData.node;
                this.currentConnection = nextNodeData.connection;

                if (this.targetNode.burnedOut) {
                    if (this.type === SignalType.BURNOUT)
                        node.burnNode();
                    else if (this.type === SignalType.NEGATIVE) {
                        playSound("NegativeSignalConfirm", 0.1);
                        node.switchIntersection();
                    }
                    this.targetNode = null;
                }
                else if (this.targetNode.isEndNode() && this.type === SignalType.NEGATIVE) {
                    this.targetNode = null;
                    
                    playSound("NegativeSignalConfirm", 0.1);
                    node.switchIntersection();
                }
            }
            else {
                this.targetNode = null;
                this.currentConnection = null;

                if (this.type === SignalType.BURNOUT)
                    node.burnNode();
            }
        }

        update(deltaTime) {
            var dT = deltaTime / this.inverseSpeed;

            this.rotateSignal();

            if (this.currentConnection) {
                if (this.currentConnection.isBezierCurve()) {
                    this.moveAlongBezierCurve(dT);
                }
                else {
                    this.location.Y += dT;
                    this.signalContainer.y = 12 + this.location.Y - this.spriteSize.Y / 2;
                }

                if (this.hasTraveledConnection()) {
                    this.checkNodeMessage();
                    
                    this.setSignalToNode(this.targetNode);
                }
            }

        }
        rotateSignal() {            
            if (this.type === SignalType.POSITIVE || this.type === SignalType.POSTEMPORARY)
                this.signalContainer.rotation += -5;
            else if (this.type === SignalType.NEGATIVE)
                this.signalContainer.rotation += 10;

            if (this.signalContainer.rotation < -360)
                this.signalContainer.rotation += 360;
            else if (this.signalContainer.rotation > 360)
                this.signalContainer.rotation -= 360;
        }

        checkNodeMessage() {
            if (this.targetNode.burnedOut)
                return;
            
            if (this.targetNode.type === NodeType.ENDLEFT)
                this.message = SignalMessage.MOVELEFT;
            else if (this.targetNode.type === NodeType.ENDRIGHT)
                this.message = SignalMessage.MOVERIGHT;
            else if (this.targetNode.type === NodeType.ENDCENTER)
                this.message = SignalMessage.MOVECENTER;
            else if (this.targetNode.type === NodeType.ENDLEFTNULL)
                this.message = SignalMessage.OFFSIDESLEFT;
            else if (this.targetNode.type === NodeType.ENDRIGHTNULL)
                this.message = SignalMessage.OFFSIDESRIGHT;
        }

        hasTraveledConnection() {
            return this.location.Y >= this.currentConnection.endPoint.Y;
        }

        moveAlongBezierCurve(dT) {
            var start = this.currentConnection.startPoint.get();
            var bezierA = this.currentConnection.lineData["controlA"];
            var bezierB = this.currentConnection.lineData["controlB"];
            var end = this.currentConnection.endPoint.get();

            var deltaY = (this.location.Y + dT) - start.Y;
            var totalDistance = end.Y - start.Y;
            
            var bezierProgress = this.getBezierPoint(deltaY / totalDistance, start, bezierA, bezierB, end);
            this.location.X = bezierProgress.X;
            this.location.Y += dT;
            this.signalContainer.x = 15 + this.location.X - this.spriteSize.X / 2;
            this.signalContainer.y = 12 + this.location.Y - this.spriteSize.Y / 2;
        }
        getBezierPoint(dT, start, c1, c2, end) {
            var tI = (1 - dT);
            var tI2 = tI * tI;
            var tI3 = tI * tI * tI;

            var dX = tI3 * start.X + 3 * tI2 * dT * c1.X + 3 * tI * dT * dT * c2.X + dT * dT * dT * end.X;
            var dY = tI3 * start.Y + 3 * tI2 * dT * c1.Y + 3 * tI * dT * dT * c2.Y + dT * dT * dT * end.Y;

            return new Point(dX, dY);
        }

    }

    return Signal;
});