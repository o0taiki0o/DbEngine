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
var debug;
var canvas;
var stage;
var screen_width;
var screen_height;
var bmpAnimation;
var imgMonsterARun = new Image();
var background;
function loadBG(){
    var img = new Image();
    img.src = "img/bg.png"; 
    background = new Bitmap(img);
    background.x = 0;
    background.y = 0;
    stage.addChild(background);
    stage.update();
}

function init() {
    canvas = document.getElementById("canvas");
    debug = document.getElementById("debug");
    // create a new stage and point it at our canvas:
    stage = new Stage(canvas);
    loadBG();
    world = new b2World(new b2Vec2(0, 10), false);
    screen_width = canvas.width;
    screen_height = canvas.height;
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef;

    //create ground
//    bodyDef.type = b2Body.b2_staticBody;
//    bodyDef.position.x = 12;
//    bodyDef.position.y = 11;
//    fixDef.shape = new b2PolygonShape;
//    fixDef.shape.SetAsBox(1, 1);
//    world.CreateBody(bodyDef).CreateFixture(fixDef);
    
    //create ground
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 0;
    bodyDef.position.y = 12.5;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(20, 1);
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
    debugDraw.SetSprite(debug.getContext("2d"));
    debugDraw.SetDrawScale(30.0);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    
    canvas = document.getElementById("canvas");
    imgMonsterARun.onload = handleImageLoad;
    //    imgMonsterARun.onerror = handleImageError;
    imgMonsterARun.src = "img/MonsterARun.png"; 
}

function handleImageLoad(e) {
    startGame();
} 

function startGame() {
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
            walk: [0, 9, "walk",8],
            idle: [0, 0, "idle",4],
            dash: [1,1,"dash",4]
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
    bmpAnimation.vX = 1;
    bmpAnimation.x = 16;
    bmpAnimation.y = 32;
    SpriteSheetUtils.addFlippedFrames(spriteSheet, true, false, false);
    // have each monster start at a specific frame
    bmpAnimation.currentFrame = 0;
    stage.addChild(bmpAnimation);

    // we want to do some work before we update the canvas,
    // otherwise we could use Ticker.addListener(stage);
    Ticker.addListener(window);
    Ticker.useRAF = true;
    // Best Framerate targeted (60 FPS)
    Ticker.setFPS(60);
    window.setInterval(update, 1000 / 60);
} 

function tick() {
    // Hit testing the screen width, otherwise our sprite would disappear
    stage.update();
}

var currentAnimation = "";
var facing = "right";

var dashcount = 0;
function update() {
    var animation = currentAnimation;
    if(character.GetLinearVelocity().x == 0 && character.GetLinearVelocity().y == 0){
        animation = facing == "right" ? "idle_h" : "idle";
    }
    if(keys[37] || keys[65]) {
        if((character.GetPosition().x*30) < 16 ){
            character.SetLinearVelocity(new b2Vec2(0, character.GetLinearVelocity().y));
        }else {
            character.SetLinearVelocity(new b2Vec2(-2, character.GetLinearVelocity().y));
        }
        //        character.ApplyForce(new b2Vec2(speed,0), character.GetWorldCenter());
        animation = "walk";
        facing = "left";
    }
    
    if(keys[39] || keys[68]) {
        if((character.GetPosition().x*30) >= screen_width - 16 ){
            character.SetLinearVelocity(new b2Vec2(0, character.GetLinearVelocity().y));
        }else {
            character.SetLinearVelocity(new b2Vec2(2, character.GetLinearVelocity().y));
        }
        //        character.ApplyForce(new b2Vec2(speed,0), character.GetWorldCenter());
        animation = "walk_h";
        facing = "right";
    }
    
    if(keys[32] && onground) {
        character.ApplyImpulse(new b2Vec2(0, -9), character.GetWorldCenter());
        animation = facing == "right" ? "walk_h" : "walk";
    }
   
    if(keys[90] && onground && dashcount < 30){
//      character.ApplyImpulse(new b2Vec2(facing == "right" ? 10 : -10, 0), character.GetWorldCenter());
        character.SetPosition(new b2Vec2(facing == "right" ? character.GetPosition().x+2 : character.GetPosition().x-2 ,character.GetPosition().y));
        animation = facing == "right" ? "dash_h" : "dash";
//      dashable = false;
        dashcount++;
    }
    
    if(animation != currentAnimation){
        runAnimation(animation);
    }
    
    bmpAnimation.x = character.GetPosition().x * 30;
    bmpAnimation.y = character.GetPosition().y * 30;
    
    world.Step(1/60, 8, 3);
    world.DrawDebugData();
    world.ClearForces();
    if(dashcount >= 30 && (currentAnimation != "dash" || currentAnimation != "dash_h")){
        dashcount = 0;
    }
//    background.x = bmpAnimation.x;
}
function runAnimation(e){
    bmpAnimation.gotoAndPlay(e);
    currentAnimation = e;
}

$(function() {
    init();

    $(document).keydown(function(e) {
        keys[e.which] = true;
        console.log(keys);
    });

    $(document).keyup(function(e) {
        delete keys[e.which];
    })
});

