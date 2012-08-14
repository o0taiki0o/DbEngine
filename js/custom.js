var world;
var character;
var keys = {};
var onground = true;
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

//
var canvas;
var stage;
var screen_width;
var screen_height;
var bmpAnimation;
var imgMonsterARun = new Image();

function init() {
    canvas = document.getElementById("canvas");

    world = new b2World(new b2Vec2(0, 10), true);

    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;

    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 9;
    bodyDef.position.y = 13;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1000, 0.5);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    //create hero
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1.1, 1.1);
    fixDef.density = 1.0;
    fixDef.friction = 0.6;
    fixDef.restitution = 0.3;
    bodyDef.position.x = 10;
    bodyDef.position.y = 10;
    bodyDef.fixedRotation =true;
    character = world.CreateBody(bodyDef);
    character.CreateFixture(fixDef);
    //hero sensor
    var fixDef2 = new b2FixtureDef;
    var ground_sensor = new b2PolygonShape;
    fixDef2.isSensor = true;
    fixDef2.userData = "groundsensor";
    ground_sensor.SetAsOrientedBox(0.3, 0.3, new b2Vec2(0, 1), 0);
    fixDef2.shape = ground_sensor;
    character.CreateFixture(fixDef2);

    //create listener
    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.BeginContact = function(contact) {
        if(contact.GetFixtureA().GetUserData() == "groundsensor" ||
            contact.GetFixtureB().GetUserData() == "groundsensor") {
            onground = true;
        }
    };

    listener.EndContact = function(contact) {
        if(contact.GetFixtureA().GetUserData() == "groundsensor" ||
            contact.GetFixtureB().GetUserData() == "groundsensor") {
            onground = false;
        }
    }

    world.SetContactListener(listener);

    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(canvas.getContext("2d"));
    debugDraw.SetDrawScale(30.0);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    window.setInterval(update, 1000 / 60);
    
    canvas = document.getElementById("canvas");
    imgMonsterARun.onload = handleImageLoad;
//    imgMonsterARun.onerror = handleImageError;
    imgMonsterARun.src = "img/MonsterARun.png"; 
}

function handleImageLoad(e) {
    startGame();
} 

function startGame() {
    // create a new stage and point it at our canvas:
    stage = new Stage(canvas);
    // grab canvas width and height for later calculations:
    screen_width = canvas.width;
    screen_height = canvas.height;
    // create spritesheet and assign the associated data.
    var spriteSheet = new SpriteSheet({
        // image to use
        images: [imgMonsterARun],
        // width, height & registration point of each sprite
        frames: {
            width: 64, 
            height: 64, 
            regX: 32, 
            regY: 32
        },
        animations: {
            walk: [0, 9, "walk"]
        }
    });
    // create a BitmapAnimation instance to display and play back the sprite sheet:
    bmpAnimation = new BitmapAnimation(spriteSheet);
    // start playing the first sequence:
    bmpAnimation.gotoAndPlay("walk"); //animate
    // set up a shadow. Note that shadows are ridiculously expensive. You could display hundreds
    // of animated rats if you disabled the shadow.
    bmpAnimation.shadow = new Shadow("#454", 0, 5, 4);
    bmpAnimation.name = "monster1";
    bmpAnimation.direction = 90;
    bmpAnimation.vX = 4;
    bmpAnimation.x = 16;
    bmpAnimation.y = 32;
    // have each monster start at a specific frame
    bmpAnimation.currentFrame = 0;
    stage.addChild(bmpAnimation);
    // we want to do some work before we update the canvas,
    // otherwise we could use Ticker.addListener(stage);
    Ticker.addListener(window);
    Ticker.useRAF = true;
    // Best Framerate targeted (60 FPS)
    Ticker.setFPS(60);
} 

function tick() {
    // Hit testing the screen width, otherwise our sprite would disappear
    if (bmpAnimation.x >= screen_width - 16) {
        // We've reached the right side of our screen
        // We need to walk left now to go back to our initial position
        bmpAnimation.direction = -90;
    }

    if (bmpAnimation.x < 16) {
        // We've reached the left side of our screen
        // We need to walk right now
        bmpAnimation.direction = 90;
    }

    // Moving the sprite based on the direction & the speed
    if (bmpAnimation.direction == 90) {
        bmpAnimation.x += bmpAnimation.vX;
    }
    else {
        bmpAnimation.x -= bmpAnimation.vX;
    }

    // update the stage:
    stage.update();
}

function update() {
    if(keys[37] || keys[65]) {
        var speed = -50;
        if(!onground) speed = -20;
        character.ApplyForce(new b2Vec2(speed,0), character.GetWorldCenter());
    }
    if(keys[39] || keys[68]) {
        var speed = 50;
        if(!onground) speed = 20;
        character.ApplyForce(new b2Vec2(speed,0), character.GetWorldCenter());
    }
    if(keys[32] && onground) {
        character.ApplyImpulse(new b2Vec2(0, -9), character.GetWorldCenter());
    }
    world.Step(1/60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();
}

$(function() {
    init();

    $(document).keydown(function(e) {
        keys[e.which] = true;
    });

    $(document).keyup(function(e) {
        delete keys[e.which];
    })
});