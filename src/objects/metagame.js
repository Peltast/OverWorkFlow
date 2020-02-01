define("MetaGame", ['Point'], function(Point) {

    class MetaGame {
        
        constructor() {
            this.metagameContainer = new createjs.Container();

            this.player;
            this.stations = [];
            this.activeStation;

            this.boundsWidth = 468;

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

            for (let x = 36; x <= 416; x += 36) {
                var station = new Station(new Point(x, 356));
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

            this.checkStationStatus();
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

    }

    class Player {
        constructor() {
            this.playerContainer = new createjs.Container();
            this.size = new Point(84, 188);
            this.maxSpeed = 0.5;
            this.speedIncrement = 0.1;
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
        constructor(location) {
            this.location = location;
            this.stationContainer = new createjs.Container();
            this.size = new Point(52, 120);

            this.drawStation();
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
    }

    return MetaGame;
});
