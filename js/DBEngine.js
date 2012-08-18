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

var DbObject = Class.extend((function() {
    var name = "";
    var alias = "";
    var owningGroup = null;
    var sets = [];
    return {
        nodeInSet: function(set) {
            if(sets.indexOf(set) != -1)
                return;
            sets.push(set);
        },
        nodeOutOfSet: function(set) {
            var idx = _sets.indexOf(s);
            if(idx == -1) {
                throw new Error("Removed object from set that it isn't in.");
            }
            sets.splice(idx, 1);
        },
        getOwningGroup: function() {
            return owningGroup;
        },
        setOwningGroup: function(group) {
            if(!group)
                throw new Error("Must always be in a group - cannot set owningGroup to null!");
            if(owningGroup)
                owningGroup.removeFromGroup(this);
            owningGroup = group;
            owningGroup.addToGroup(this);
        },
        getName: function()
        {
            return name;
        },
        getAlias: function()
        {
            return alias;
        },
        initialize: function(name, alias)
        {
            // Note the names.
            this.name = name;
            this.alias = alias;
            // Register with the name manager.
            DbE.nameManager.add(this);
            // Put us in the current group if we have no group specified.
            if(owningGroup == null && DbE.currentGroup != this)
                owningGroup = DbE.currentGroup;
        },
        destroy: function()
        {
            // Remove from the name manager.
            DbE.nameManager.remove(this);
            // Remove from any sets.
            while(sets.length) {
                if(sets[sets.length-1].remove(this) == false)
                    sets.pop();
            }
            // Remove from our owning group.
            if(owningGroup) {
                owningGroup.removeFromGroup(this);
                owningGroup = null;
            }
        },
        changeName: function(name) {
            if(name)
            {
                // Remove from the name manager.
                DbE.nameManager.remove(this);
                // Change the name.
                this.name = name;
                // Register with the name manager.
                DbE.nameManager.add(this);
            }
        }
    }
})())

var DbGroup = DbObject.extend((function() {
    var items = [];
    function addToGroup(item) {
        items.push(item);
        return true;
    }
    function removeFromGroup(item) {
        var idx = items.indexOf(item);
        if(idx == -1) {
            return false;
        }
        items.splice(idx, 1);
        return true
    }
    return {
        getItem: function(index) {
            if(index < 0 || index >= items.length)
                return null;
            return items[index];
        },
        getLength: function() {
            return items.length;
        },
        clear: function() {
            // Delete the items we own.
            while(items.length)
                items.destroy();            
        },
        destroy: function() {
            this.clear();
            this._super();           
        }
    }
})())

var DbSet = DbObject.extend((function() {
    var items = [];
    return {
        getItem: function(index) {
            if(items == null)
                return null;
            if(index < 0 || index >= items.length)
                return null;
            return items[index];
        },
        getLength: function() {
            return items ? items.length : 0;
        },
        contains: function(item) {
            if(items == null)
                throw new Error("Accessing destroy()'ed set.");
            return (items.indexOf(item) != -1);
        },
        add: function(item) {
            // Can't add ourselves to ourselves.
            if(item == this)
                return false;
            if(items == null)
                throw new Error("Accessing destroy()'ed set.");
            // Was the item present?
            if(contains(item)) {
                return false;
            }
            // No, add it.
            item.noteInSet(this);
            items.push(item);
            return true;
        },
        remove: function(item) {
            // Can't remove ourselves from ourselves.
            if(item == this)
                return false;
            if(items == null)
            {
                //throw new Error("Accessing destroy()'ed set.");
                console.warn("remove - Removed item from dead PBSet.");
                item.noteOutOfSet(this);
                return true;
            }
            // Is item present?
            var idx = items.indexOf(item);
            if(idx == -1)
                return false;
            // Yes, remove it.
            item.noteOutOfSet(this);
            items.splice(idx, 1);
            return true;
        },
        clear: function() {
            if(items == null)
                throw new Error("Accessing destroy()'ed set.");
            // Delete the items we own.
            while(items.length) {
                items.pop().destroy();
            }
        },
        destroy: function() {
            if(items == null)
                throw new Error("Accessing destroy()'ed set.");
            // Pass control up.
            this._super();

            // Clear out items.
            while(items.length) {
                remove(items.pop());
            }
            items = null;
        }
    }
})())

var DbEntity = DbObject.extend((function() {
    var deferring = true;
    var deferredComponents = [];
    var components = {};
    var eventDispatcher = new DbEventDispatcher();
    function doResetComponents() {
        var oldDefer = deferring;
        deferring = true;
        for(var name in components) {
            var component = components[name];
            if (!component.isRegistered) {
                continue;
            }
            component.reset();
        }
        deferring = oldDefer;
    }
    function doAddComponent(component, componentName) {
        if (componentName == "")
        {
            console.warn("AddComponent - A component name was not specified. This might cause problems later.");
        }

        if (component.owner)
        {
            console.error("AddComponent - The component " + componentName + " already has an owner. (" + name + ")");
            return false;
        }

        if (components[componentName])
        {
            console.error("AddComponent - A component with name " + componentName + " already exists on this entity (" + name + ").");
            return false;
        }

        component.owner = this;
        components[componentName] = component;
        return true;
    }
    function doRemoveComponent(component) {
        if (component.owner != this)
        {
            console.error("AddComponent - The component " + component.name + " is not owned by this entity. (" + name + ")");
            return false;
        }

        if (!components[component.name])
        {
            console.error("AddComponent - The component " + component.name + " was not found on this entity. (" + name + ")");
            return false;
        }

        delete components[component.name];
        return true;
    }
    return {
        initialize: function(name, alias) {
            this._super(name, alias);
            
            deferring = false;
        },
        setDeferring: function(deferring) {
            if(this.deferring == true && deferring == false) {
                // Resolve everything, and everything that that resolution triggers.
                var needReset = true;
                needReset = (deferredComponents.length > 0);
                
                while(deferredComponents.length)
                {
                    var pc = deferredComponents.shift();
                    pc.component.register(this, pc.name);
                }
                // Mark deferring as done.
                _deferring = false;
                // Fire off the reset.
                if(needReset)
                    doResetComponents();
            }
            this.deferring = deferring;
        },
        getDeferring: function() {
            return deferring;
        },
        getEventDispatcher: function() {
            return eventDispatcher;
        },
        destroy: function() {
            // Give listeners a chance to act before we start destroying stuff.
            if(eventDispatcher.hasEventListener("EntityDestroyed")) {
                eventDispatcher.dispatchEvent(new Event("EntityDestroyed"));
            }

            // Unregister our components.
            for(var name in components) {
                var component = components[name];
                if (!component.isRegistered) {
                    component.unRegister();
                }
                delete components[name];
            }
            // Get out of the NameManager and other general cleanup stuff.
            this._super();
        },
        addComponent: function(component, componentName) {
            // Add it to the dictionary.
            if (!doAddComponent(component, componentName))
                return false;
            // If we are deferring registration, put it on the list.
            if(deferring) {
                var p = new PendingComponent();
                p.component = component;
                p.name = componentName;
                deferredComponents.push(p);
                return true;
            }
            // We have to be careful w.r.t. adding components from another component.
            component.register(this, componentName);
            // Fire off the reset.
            doResetComponents();

            return true;
        },
        removeComponent: function(componentName) {
            // Update the dictionary.
            if (!doRemoveComponent(component))
                return;
            // Deal with pending.
            if(component.isRegistered == false) {
                // Remove it from the deferred list.
                for(var i = 0; i < deferredComponents.length; i++) {
                    if( deferredComponents[i].item != component)
                        continue;
                    // TODO: Forcibly call register/unregister to ensure onAdd/onRemove semantics?
                    deferredComponents.splice(i, 1);
                    break;
                }
                return;
            }
            component.unregister();
            doResetComponents();
        },
        lookupComponentByType: function(type) {
            for (var component in components) {
                if (component instanceof type) {
                    return component;
                }
            }
            return null;
        },
        lookupComponentsByType: function(type) {
            var list = [];
            for (var component in components)
            {
                if (component instanceof type) {
                    list.push(component);
                }
            }

            return list;
        },
        lookupComponentByName: function(name) {
            return components[name];
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
})())

var DbComponent = Class.extend((function DbComponent(b) {
    var isRegistered = false;
    var owner = null;
    var name = null;
    return {
        getOwner: function() {
            return owner;
        },
        setOwner: function(owner) {
            this.owner = owner;
        },
        getName: function() {
            return name;
        },
        isRegister: function() {
            return isRegistered;
        },
        register: function(owner, name) {
            if(isRegistered)
                throw new Error("Trying to register an already-registered component!");
            
            this.name = name;
            this.owner = owner;
            onAdd();
            isRegistered = true;
        },
        add: function() {
            
        },
        remove: function() {
            
        },
        reset: function() {
            
        }
    }
})())

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

function PendingComponent() {
    return {
        name: "",
        component: null
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
