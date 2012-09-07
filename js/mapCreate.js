/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
<!--
//var MapEntity = Class.extend((function(){
//    return {
//        init : function (value){
//            this.prop = value;
//        },
//        getProp : function(){
//            return this.prop;
//        
//        },
//        setProp : function(value){
//            this.prop = value;
//        }
//    }
//})());
//var MapEntity = Class.extend((function(){
//    var prop;
//    return {
//        init : function (value){
//            prop = value;
//        },
//        getProp : function(){
//            return prop;
//        },
//        setProp : function(value){
//            prop = value;
//        }
//    }
//})());
function MapEntity(param){
    var prop;
    prop = param;
    this.getProp = function(){
        return prop;
    };
    this.setProp = function(value){
        prop = value;
    };
}
function ZMapEntity(value){
    var prop; 
    prop = value;
}
ZMapEntity.inherits(MapEntity);
/**
 * Test create map 
 * 
 */

var prop1 = {
    size : {
        width : 10,
        height : 10
    },
    position : {
        x : 10,
        y : 10
    },
    type : 1
}

var prop2 = {
    size : {
        width : 20,
        height : 10
    },
    position : {
        x : 10,
        y : 10
    },
    type : 1
}
var map3 = new ZMapEntity(prop1);
var map1 = new MapEntity(prop1);
var map2 = new MapEntity(prop1);
map1.setProp(prop2);
alert("Map 1 size: " + map1.getProp().size.width);
alert("Map 2 size: " + map2.getProp().size.width);
alert("Map 3 size: " + map3.getProp().size.width);
console.log(map1);
console.log(map2);
console.log(map3);



-->