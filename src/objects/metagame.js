define("MetaGame", ['Point'], function(Point) {

    class MetaGame {
        
        constructor() {
            this.metagameContainer = new createjs.Container();

            this.player;
            this.stations = [];
            this.activeStation;

            this.boundsWidth = 468;

            this.workGenerationInterval = 25000;
            this.workGenerationCountdown = this.workGenerationInterval / 5;

            this.drawDisplay();
            this.drawCursor();
        }
        drawDisplay() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["Background"]], 
                "frames": {"width": 468, "height": 632, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            var bg = new createjs.Sprite(spriteSheet);
            this.metagameContainer.addChild(bg);

            this.player = new Player();
            this.player.playerContainer.x = this.boundsWidth / 2 - this.player.size.X / 2;
            this.player.playerContainer.y = 244;
            this.metagameContainer.addChild(this.player.playerContainer);

            for (let x = 28; x <= 416; x += 36) {
                var station = new Station(new Point(x, 356), 0);
                this.stations.push(station);
                this.metagameContainer.addChild(station.stationContainer);
                x += 52;
            }
        }
        drawCursor() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["StationCursor"]], 
                "frames": {"width": 44, "height": 44, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.cursor = new createjs.Sprite(spriteSheet);
            this.cursor.y = 486;
            this.cursor.gotoAndPlay("idle");
        }

        update(deltaTime) {

            this.player.update(deltaTime);
            
            if (this.player.playerContainer.x < 0)
                this.player.playerContainer.x = 0;
            else if (this.player.playerContainer.x + this.player.size.X > this.boundsWidth)
                this.player.playerContainer.x = this.boundsWidth - this.player.size.X;

            for (let i = 0; i < this.stations.length; i++) {
                if (this.stations[i] == this.activeStation)
                    continue;
                this.stations[i].update();
            }

            this.checkStationStatus();
            this.updateWorkGeneration(deltaTime);

            if (this.activeStation) {
                this.activeStation.reduceStationWork(deltaTime);
                if (!this.activeStation.stationHasWork()) {
                    this.setStationWorkComplete();
                }
            }
        }

        setStationWorkComplete() {
            if (this.activeStation.generatingWork) {
                this.activeStation.generatingWork = false;
                this.workGenerationCountdown -= 5000;
            }
        }

        changePlayerMovement(message) {
            if (message === SignalMessage.MOVELEFT) {
                this.player.sendDirectionMessage("left");
            }
            else if (message === SignalMessage.MOVECENTER) {
                this.player.sendDirectionMessage("idle");
            }
            else if (message === SignalMessage.MOVERIGHT) {
                this.player.sendDirectionMessage("right");
            }
        }

        checkStationStatus() {
            var foundStation;
            for (let i = 0; i < this.stations.length; i++) {
                if (this.player.playerContainer.x > this.stations[i].location.X)
                    continue;

                if (this.player.playerContainer.x <= this.stations[i].location.X &&
                    this.player.playerContainer.x + this.player.size.X >= this.stations[i].location.X + this.stations[i].size.X) {
                        foundStation = this.stations[i];
                }
            }

            if (foundStation) {
                if (!this.activeStation) {
                    this.metagameContainer.addChild(this.cursor);
                    this.cursor.x = foundStation.location.X + (foundStation.size.X / 2 - 22);
                }
                
                this.activeStation = foundStation;
            }
            else {
                if (this.metagameContainer.contains(this.cursor))
                    this.metagameContainer.removeChild(this.cursor);
                this.activeStation = null;
            }
        }

        updateWorkGeneration(deltaTime) {
            this.workGenerationCountdown -= deltaTime;

            if (this.workGenerationCountdown <= 0) {
                this.workGenerationCountdown = this.workGenerationInterval;

                var stationRoulette = [];
                for (let i = 0; i < this.stations.length; i++) {
                    if (!this.stations[i].stationHasWork() && this.stations[i] !== this.activeStation)
                        stationRoulette.push(this.stations[i]);
                }

                if (stationRoulette.length == 0)
                    return;
                var rouletteSpin = Math.floor( Math.random() * stationRoulette.length);
                stationRoulette[rouletteSpin].generateWork();
            }

        }

    }

    class Player {
        constructor() {
            this.playerContainer = new createjs.Container();
            this.size = new Point(84, 188);
            this.maxSpeed = 0.5;
            this.speedIncrement = 0.15;
            this.currentSpeed = 0;
            this.state = "idle";

            this.drawPlayer();
        }
        drawPlayer() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["Player"]], 
                "frames": {"width": this.size.X, "height": this.size.Y, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.playerSprite = new createjs.Sprite(spriteSheet);
            this.playerSprite.gotoAndPlay("idle");

            this.playerContainer.addChild(this.playerSprite);
        }

        update(deltaTime) {

            this.playerContainer.x += this.currentSpeed * (deltaTime / 16);
        }

        sendDirectionMessage(direction) {
            if (this.state === direction) {
                if (direction == "left")
                    this.currentSpeed -= this.speedIncrement;
                else if (direction == "right")
                    this.currentSpeed += this.speedIncrement;
                
                if (this.currentSpeed < -this.maxSpeed)
                    this.currentSpeed = -this.maxSpeed;
                else if (this.currentSpeed > this.maxSpeed)
                    this.currentSpeed = this.maxSpeed;
            }
            else {
                if (direction == "left")
                    this.currentSpeed = -this.speedIncrement;
                else if (direction == "right")
                    this.currentSpeed = this.speedIncrement;
                else
                    this.currentSpeed = 0;
            }

            this.state = direction;
        }

    }

    class Station {
        constructor(location, startingWork = 0) {
            this.location = location;
            this.stationContainer = new createjs.Container();
            this.size = new Point(52, 120);
            this.generatingWork = false;
            
            this.workItems = [];
            this.overloadCount = 0;

            this.drawStation();
            this.drawWorkItems(startingWork);
        }
        drawStation() {
            var spriteSheet = new createjs.SpriteSheet({
                "images": [gameAssets["Station"]], 
                "frames": {"width": this.size.X, "height": this.size.Y, "regX": 0, "regY": 0, "count": 1},
                animations: { idle: 0 }
            });
            this.stationSprite = new createjs.Sprite(spriteSheet);
            this.stationSprite.gotoAndPlay("idle");

            this.stationContainer.addChild(this.stationSprite);
            this.stationContainer.x = this.location.X;
            this.stationContainer.y = this.location.Y;
        }
        drawWorkItems(startingWork) {
            var x = 8;
            var y = 100;

            for (let i = 0; i < 5; i++) {
                var item = new WorkItem(startingWork > 0);
                item.workContainer.x = x;
                item.workContainer.y = y;
                this.stationContainer.addChild(item.workContainer);
                this.workItems.push(item);

                if (startingWork > 0)
                    startingWork -= 1;
                y -= 16;
            }
        }

        generateWork() {
            this.generatingWork = true;
        }
        update() {
            if (this.generatingWork) {
                var count = 0;

                for (let i = 0; i < this.workItems.length; i++) {
                    var item = this.workItems[i];
                    if (item.status === WorkItemState.ACTIVE) {
                        continue;
                    }
                    else {
                        item.increaseWork();
                        count += 1;
                        this.overloadCount = 0;
                        return;
                    }
                }

                if (count == 0) {
                    this.updateOverloadedStation();
                }
            }
        }
        updateOverloadedStation() {
            for (let j = 0; j < this.workItems.length; j++) {
                this.workItems[j].alarmAnimation();
            }

            this.overloadCount += 1;
            if (this.overloadCount >= 240) {
                this.overloadCount = 0;
                SignalGeneration.push({"node": "Root", "type": SignalType.NEGATIVE });
            }
        }

        reduceStationWork(deltaTime) {
            for (let i = this.workItems.length - 1; i >= 0; i--) {
                var item = this.workItems[i];
                if (item.status !== WorkItemState.INACTIVE) {
                    item.reduceWork();
                    return;
                }
            }
        }

        stationHasWork() {
            for (let i = this.workItems.length - 1; i >= 0; i--) {
                var item = this.workItems[i];
                if (item.status !== WorkItemState.INACTIVE) {
                    return true;
                }
            }

            return false;
        }
    }

    class WorkItem {
        constructor(active = false) {
            this.workContainer = new createjs.Container();
            this.active = active;
            this.status = active ? WorkItemState.ACTIVE : WorkItemState.INACTIVE;
            this.frameCount = 0;

            this.drawShapes();
        }
        drawShapes() {
            this.workShape = new createjs.Shape();
            this.workShape.y = 12;
            this.workShape.graphics.beginFill("#ff004d").drawRect(0, 0, 36, 12);
            if (!this.active)
                this.workShape.scaleY = 0;
            else
                this.workShape.scaleY = -1;

            this.alarmShape = new createjs.Shape();
            this.alarmShape.graphics.beginFill("#fff1e8").drawRect(0, 0, 36, 12);
            this.alarmShape.alpha = 0;

            this.freeShape = new createjs.Shape();
            this.freeShape.graphics.beginFill("#00e436").drawRect(0, 0, 36, 12);

            this.workContainer.addChild(this.freeShape, this.workShape, this.alarmShape);
        }

        alarmAnimation() {
            this.frameCount += 1;
            if (this.frameCount % 11 == 0) {
                this.alarmShape.alpha = (this.alarmShape.alpha == 1 ? 0 : 1);
                this.frameCount = 0;
            }
        }
        increaseWork() {
            if (this.status === WorkItemState.INACTIVE)
                this.status = WorkItemState.BUILDING;

            this.workShape.scaleY -= 0.005;

            if (this.workShape.scaleY <= -1) {
                this.workShape.scaleY = -1;
                this.active = true;
                this.status = WorkItemState.ACTIVE;
            }
        }
        reduceWork() {
            if (this.status === WorkItemState.BUILDING)
                this.status = WorkItemState.CLEARING;

            this.workShape.scaleY += 0.01;
            this.alarmShape.alpha = 0;

            if (this.workShape.scaleY >= 0) {
                this.workShape.scaleY = 0;
                this.active = false;
                this.status = WorkItemState.INACTIVE;

                SignalGeneration.push({"node": "Root", "type": SignalType.POSTEMPORARY });
            }
        }

    }

    return MetaGame;
});
