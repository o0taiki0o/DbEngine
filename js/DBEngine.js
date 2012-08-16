function DbNameManager(){
    var entities = {};
    return {
        add: function(object) {
            if(!object.name) console.error("Object must have a name.");
            if(entities[object.name]) console.error("Object must have a unique name.");
            entities[object.name] = object;
        },
        remove: function(object) {
            delete entities[object.name];
        },
        lookUp: function(name) {
            return entities[name];
        }
    }
}

var DbE = (function() {
    var dbNameManager = undefined;
    
    function initNameManager() {
        dbNameManager = new DbNameManager();
    }
    return {
        getNameManager: function() {
            if(!dbNameManager) {
                console.error("Name Manager has not been initialized.");
            }
            return dbNameManager;
        },
        allocateEntity: function() {
            return new DbEntity();
        },
        startUp: function() {
            initNameManager();
        }
    }
})();

function DbEntity() {
    var name = "";
    var alias = "";
    var deferring = true;
    var deferredComponents = [];
    var components = {};
    var eventDispatcher = new DbEventDispatcher();
    return {
        initialize: function(name) {
            this.name = name;
            DbE.getNameManager().add(this);            
        // TODO: implement nốt, chưa xong =.=, LOL
        },
        setDeferring: function(deferring) {
        // TODO: implement this
        },
        getDeferring: function() {
            return deferring;
        },
        getEventDispatcher: function() {
            return eventDispatcher;
        },
        destroy: function() {
        // TODO: implement this
        },
        addComponent: function(component, componentName) {
        // TODO: implement this
        },
        removeComponent: function(componentName) {
        // TODO: implement this
        },
        lookupComponentByType: function(type) {
        // TODO: implement this
        },
        lookupComponentsByType: function(type) {
        // TODO: implement this
        },
        lookupComponentByName: function(name) {
        // TODO: implement this
        },
        getProperty: function(propertyReference, defaultValue) {
        // TODO: implement this
        },
        setProperty: function(propertyReference, value) {
        // TODO: implement this
        },
        doesPropertyExist: function(propertyReference) {
        // TODO: implement this
        }
    }    
}

function DbComponent(b) {
    var a = b;
    alert(a);
}

function DbEventDispatcher() {
    var events = {};
    return {
        addListener: function(eventName, callback) {
            var callbacks = events[eventName]? events[eventName]:[];
            callbacks.push(callback);
            events[eventName] = callbacks;
        },
        removeListener: function(eventName, _function) {
            var callbacks = events[eventName];
            if (callbacks) {
                callbacks.remove(_function);
            }
            events[eventName] = callbacks;
        },
        fire: function(eventName, arg1, arg2) {
            var arguments = Array.prototype.slice.call(arguments);
            var name = arguments[0];
            var args = arguments.slice(1, arguments.length);
            var callbacks = events[name];
            if(callbacks) {
                for(var i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];
                    if(callback) {
                        callback.apply(null, args);
                    }
                }
            }
        },
        hasListener: function(eventName) {
            var callbacks = events[eventName]? events[eventName]:[];
            return (callbacks.length > 0);
        }
    }
}

function PropertyReference(propertyExpression) {
    var property = propertyExpression;
    return {
        setProperty: function(name) {
        // TODO: implement this
        },
        getProperty: function() {
        // TODO: implement this
        }
    }
}

/*
// example use of event dispatcher
function dcm(a, b, c, d) {
    console.log(a);
    console.log(b);
    console.log(c);
    console.log(d);
}

var eventDispatcher = new DbEventDispatcher();
eventDispatcher.addListener("dcm", dcm);
eventDispatcher.fire("dcm", "vcl", 20, 30, 40);
console.log(eventDispatcher.hasListener("dcm"));
eventDispatcher.removeListener("dcm", dcm);
eventDispatcher.fire("dcm", "vcl", 20, 30, 40);
console.log(eventDispatcher.hasListener("dcm"));
 */