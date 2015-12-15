

var t = require("../lib/transformation.js");
var assert = require("semantic-firewall").assert;
var client = t.createRestClient();

var repository  = {};
var counter = 0;


assert.steps("CRUD test",[
        function(next) {
            var webServer = t.restAPI({
                port:3000,
                getEntity: {
                    method:'get',
                    params: ['entityId', 'token'],
                    path:'$entityId/$token',
                    code:function(entityId, token){
                        return repository[entityId];
                    }
                },
                createEntity: {
                    method: 'put',
                    params: ['token', '__body'],
                    path : '$token/entity=$entityId',
                    code:function(entityId, __body){
                        console.log(">>>>>>Creating:", entityId);
                        repository[entityId] = __body;
                        return entityId;
                    }
                },
                updateEntity: {
                    method: 'post',
                    params: ['entityId', 'token', '__body'],
                    path : '$entityId/$token',
                    code:function(entityId, __body){
                        console.log(">>>>>>Updating:", entityId);
                        repository[entityId] = __body;
                        return entityId;
                    }
                },
                deleteEntity: {
                    method: 'delete',
                    params: ['entityId', 'token'],
                    path : '$entityId/$token',
                    code:function(entityId, token){
                        delete repository[counter];
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
            client.putObject("http://localhost:3000/secret/entity=100", {hello: "world"}, function (err, res) {

                assert.equal(err, null);
                assert.equal(res, "true");
                next();
            })
        },
        function(next) {
            client.postObject("http://localhost:3000/100/secret", {hello: "swarms"}, function (err, res) {
                console.log(">>>>", err,res);
                assert.equal(err, null);
                assert.equal(res, "true");
                next();
            })
        },
        function(next) {
            client.getJSON("http://localhost:3000/100/secret", function (err, res) {
                assert.equal(err, null);
                assert.equal(res.hello, "swarms");
                next();
            })
        },
        function(next) {
            client.getJSON("http://localhost:3000/100/secret", function (err, res) {
                assert.equal(err, null);
                assert.equal(res.hello, "swarms");
                next();
            })
        }]);
