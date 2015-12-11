

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
                    path : 'token=$token',
                    code:function(token, __body){
                        counter++;
                        repository[counter] = __body;
                        return true;
                    }
                },
                updateEntity: {
                    method: 'post',
                    params: ['entityId', 'token', '__body'],
                    path : '$entityId/$token',
                    code:function(entityId, token){
                        repository[counter] = __body;
                        return true;
                    }
                },
                deleteEntity: {
                    method: 'post',
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
            client.get("http://localhost:3000/100/100", function (res, err) {
                assert.equal(err, null);
                assert.equal(res, "undefined");
                next();
            })
        },
        function(next) {
            client.putJSON("http://localhost/100/100", {hello: "world"}, function (res, err) {
                assert.equal(err, null);
                assert.equal(res, "true");
                next();
            })
        },
        function(next) {
            client.postJSON("http://localhost/100/100", {hello: "swarms"}, function (res, err) {
                assert.equal(err, null);
                assert.equal(res, "true");
                next();
            })
        },
        function(next) {
            client.getJSON("http://localhost/100/100", function (res, err) {
                assert.equal(err, null);
                assert.equal(res.hello, "swarms");
                next();
            })
        },
        function(next) {
            client.getJSON("http://localhost/100/100", function (res, err) {
                assert.equal(err, null);
                assert.equal(res.hello, "swarms");
                next();
            })
        }]);
