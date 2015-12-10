

var t = require("../lib/transformation.js");
var assert = require("semantic-firewall").assert;

var testStrategy= {
    begin:function(){},
    step:function(name, context, description){
        context[name] = function(){};
    },
    end:function(){}

}

assert.pass("Testing generic transformation", function(){
    var res = t.generateTransformation({
        swarmName: 	'EntityManagerFlow',
        swarmTemplate:	'example.js',
        node:		'EntityManager',
        baseUrl:	'http://localhost/service.php',
        getEntity: {
            method:'get',
            params: ['entity', 'token'],
            path:'$entity/$token',
            after:'afterGetEntity'
        },
        createEntity: {
            method: 'put',
                params: ['entity', 'token', '__body'],
                path : 'id=$entity&token=$token',
                after: 'afterCreateEntity'
        }
    }, testStrategy);
    assert.equal(typeof(res.getEntity), "function", "getEntity should be a function!");
    assert.equal(typeof(res.createEntity), "function", "createEntity should be a function!");
});



assert.pass("Testing A transformation", function(){
    var res = t.generateTransformation({
        swarmName: 	'EntityManagerFlow',
        swarmTemplate:	'example.js',
        node:		'EntityManager',
        baseUrl:	'http://localhost/service.php',
        getEntity: {
            method:'get',
            params: ['entity', 'token'],
            path:'$entity/$token',
            after:'afterGetEntity'
        },
        createEntity: {
            method: 'put',
            params: ['entity', 'token', '__body'],
            path : 'id=$entity&token=$token',
            after: 'afterCreateEntity'
        }
    }, t.AStrategy);
    console.log(res);
    assert.equal(typeof(res.getEntity), "function", "getEntity should be a function!");
    assert.equal(typeof(res.createEntity), "function", "createEntity should be a function!");
});
