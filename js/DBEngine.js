//var DBE = (function() {
//    var name = "";
//    
//    return {
//        method: function() {
//            
//        }
//    }
//})();

var DbNameManager = (function(){
    var entities = {};
    return {
        add: function(object) {
            if(!object.name) console.log("Object must have a name.");
            if(entities[object.name]) console.log("Object must have a unique name.");
            entities[object.name] = object;
        },
        remove: function(object) {
            delete entities[object.name];
        },
        lookup: function(name) {
            return entities[name];
        }
    }
})();

var DbE = (function() {    
    return {
        nameManager: DbNameManager,
        allocateEntity: function() {
            return new DbEntity();
        }
    }
})();

function DbEntity() {
    var components = {};
    return {
        name: ""
    }
    
}

function DbComponent(b) {
    var a = b;
    alert(a);
}

DbComponent.prototype = {
    constructor: DbComponent,
    alert: function() {
        //alert(this.a);
    }
}

//new DbComponent(6).alert();