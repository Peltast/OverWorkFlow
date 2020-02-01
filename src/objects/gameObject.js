define("GameObject", ['Point'], function(Point) {

    class GameObject {

        constructor(x = 0, y = 0) {
            this.X = x;
            this.Y = y;
        }


    }

    

    return GameObject;
});