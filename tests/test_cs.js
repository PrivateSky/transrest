/*
 Status: stable
 TODOs:

 */

var t = require("../lib/transformation.js");
var assert = require("semantic-firewall").assert;
var client = t.createRestClient();

var repository  = {};


//fake startSwarm
function FakeSwarm(){
    var callbacks = {};

    this.on = function(phase, callback){
        callbacks[phase] = callback;
    }

    this.home = function(phase, result){
        this.__result = result;
        setTimeout(function(){
            var method = callbacks[phase];
            if(method){
                method(null, result);
            } else {
                console.log("No handler listening for ", phase);
            }
        }, 50);
    }

    this.getEntity = function(entityId, token){
        this.home("get", repository[entityId]);
    }

    this.createEntity = function(token, entityId, __body){
        repository[entityId] = __body;
        this.home("put", entityId);
    }

    this.updateEntity = function(entityId, __body){
        repository[entityId] = __body;
        this.home("post", entityId);
    }

    this.deleteEntity = function(entityId, token){
        delete repository[entityId];
        this.home("delete", true);
    }
}

startSwarm = function (swarmingName, ctorName) {
    var swarm = new FakeSwarm();
    var args = []; // empty array
    for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    var ctor = swarm[ctorName];
    if(ctor){
        swarm[ctorName].apply(swarm, args);
    } else {
        console.log("Failed to discover ctor", ctorName);
    }

    return swarm;
}


assert.steps("CS (Choreography to Service) transformation test ",[
    function(next) {
        var webServer = t.cs({
            port:3000,
            getEntity: {
                method:'get',
                params: ['entityId', 'token'],
                path:'/$entityId/$token',
                result:{
                    phase:"get",
                    field:"result"
                }
            },
            createEntity: {
                method: 'put',
                params: ['token', 'entityId', '__body'],
                path : '/$token/$entityId',
                result:{
                    phase:"put"
                }
            },
            updateEntity: {
                method: 'post',
                params: ['entityId', '__body'],
                path : '/$entityId/$token',
                result:{
                    phase:"post"
                }
            },
            deleteEntity: {
                method: 'delete',
                params: ['entityId', 'token'],
                path : '/$entityId/$token',
                result:{
                    phase:"delete"
                }
            }
        });
        next();
    },
    function(next) {
        client.get("http://localhost:3000/100/secret", function (err, res) {
            assert.equal(err, undefined);
            assert.equal(res, "undefined");
            next();
        })
    },
    function(next) {
        client.putObject("http://localhost:3000/secret/100", {hello: "world"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.postObject("http://localhost:3000/100/secret", {hello: "swarms"}, function (err, res) {
            assert.equal(err, null);
            assert.equal(res, 100);
            next();
        })
    },
    function(next) {
        client.getObject("http://localhost:3000/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res.hello, "swarms");
            next();
        })
    },
    function(next) {
        client.delete("http://localhost:3000/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "true");
            next();
        })
    },
    function(next) {
        client.get("http://localhost:3000/100/secret", function (err, res) {
            assert.equal(err, null);
            assert.equal(res, "undefined");
            next();
        })
    }]);

assert.end();