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
    var components = {};
    return {
        name: "",
        initialize: function(name) {
            this.name = name;
            DbE.getNameManager().add(this);            
        }
    }    
}

function DbComponent(b) {
    var a = b;
    alert(a);
}