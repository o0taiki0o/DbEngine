/***
 * <b>Description</b> mode: ExecuteMode
 */

function ShapeFactory(){
    
}
function ScheduleExecutor(mode) {
    var currentMode = mode;
    var execMethods = [];
    var id = null;
    return {
        addCallback: function(callback) {
            execMethods.push(callback);
        },
        removeCallback: function(callback) {
            execMethods.splice(execMethods.indexOf(callback),1);
        },
        start: function(argument1, argument2) {
            var argumentList = Array.prototype.slice.call(arguments);
            if(id == null){
                if(currentMode == ExecutorMode.usingInterval){
                    id = window.setInterval(function() {
                        for(var i = 0; i < execMethods.length; i++){
                            callback = execMethods[i];
                            callback(argumentList);
                        }
                    }, 1000);
                }else{
                    id = window.setTimeout(execMethod,1000);
                }
            }
        }, 
        stop: function() {
            if(currentMode == ExecutorMode.usingInterval){
                window.clearInterval(id);
                console.log("stopped");
            }else{
                window.clearTimeout(id);
                console.log("stopped");
            }
            id = null;
        }
    } 
}
var ExecutorMode = {
    usingTimeout: "timeout",
    usingInterval: "interval"
}

function test(){
    var argumentList = Array.prototype.slice.call(arguments)[0];
    if(argumentList.length > 0){
        for(var i = 0; i < argumentList.length;i++){
            console.log("From function test: "+argumentList[i]);
        }
    }else{
        console.log("Test Function called");
    }
}

function test2(){
    var argumentList = Array.prototype.slice.call(arguments)[0];
    if(argumentList.length > 0){
        for(var i = 0; i < argumentList.length;i++){
            console.log("From function test 2: "+argumentList[i]);
        }
    }else{
        console.log("Test2 Function called");
    }
}
var testSchedule = new ScheduleExecutor(ExecutorMode.usingInterval);
testSchedule.addCallback(test);
testSchedule.addCallback(test2);
function start_test(){
    testSchedule.start();
}

function stop_test(){
    testSchedule.stop();
}