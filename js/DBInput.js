var DbInput = (function() {
    var keys = {};
    
    $(document).keydown(function(e) {
        keys[e.which] = true;
    });
    $(document).keyup(function(e) {
        delete keys[e.which];
    });
    
    return {    
        isKeyDown: function(keycode) {
            return keys[keycode];
        }
    }
})();