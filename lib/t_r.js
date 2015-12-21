/**
 * Created by salboaie on 12/18/15.
 */

var http = require("http");
var connect = require("connect");
var connectRoute = require('connect-route');
var parser = require("./parsePath.js");


function retriveContent(req, callback){
    var bodyStr = "";
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
        callback(null, bodyStr);
    });
}



function callCode(context, stepDescription){

    function makeArgs(){
        var p = stepDescription.params;
        var args = [];
        for(var i=0; i < p.length; i++ ){
            args.push(context[p[i]]);
        }
        return args;
    }


    try{
        var result = stepDescription.code.apply(context, makeArgs(context, stepDescription));
        if(!result){
            result = 'undefined';
        }
    }catch(err){
        result = 'error';
    }
    return result.toString();
}

exports.defaultRestStrategy= {
    begin:function(context, description){
        context.server = connect();
        context.server.listen(context.port);

        context.server.use(function (request, response, next) {
            console.log("New " + request.method + " request for:",request.url);
            next();
        });

        context.getRoutes = {};
        context.putRoutes = {};
        context.postRoutes = {};
        context.deleteRoutes = {};

    },
    step:function(name, context, stepDescription){

        if(!stepDescription.path){
            console.log("Path should be defined for ", name, stepDescription);
        }
        var route = stepDescription.path.replace(/\$/g, ":");

        function getDoGet(){
            return function(req, res, next){
                var context = parser.parsePath(req.url, stepDescription.path);
                res.write(callCode(context, stepDescription));
                res.end();
                next();
            }
        }

        function getDoPut(){
            return function(req, res, next){
                retriveContent(req, function(err, result){
                    var context = parser.parsePath(req.url, stepDescription.path);
                    context.__body = result;
                    res.write(callCode(context, stepDescription));
                    res.end();
                    next();
                })
            }
        }

        function getDoPost(){
            return function(req, res, next){
                retriveContent(req, function(err, result){
                    var context = parser.parsePath(req.url, stepDescription.path);
                    context.__body = result;
                    res.write(callCode(context, stepDescription));
                    res.end();
                    next();
                })
            }
        }

        function getDoDelete(){
            return function(req, res, next){
                var context = parser.parsePath(req.url, stepDescription.path);
                res.write(callCode(context, stepDescription));
                res.end();
                next();
            }
        }

        switch(stepDescription.method.trim().toLowerCase()){
            case 'get'      : context.getRoutes[route]    = getDoGet();    break;
            case 'put'      : context.putRoutes[route]    = getDoPut();    break;
            case 'post'     : context.postRoutes[route]   = getDoPost();   break;
            case 'delete'   : context.deleteRoutes[route] = getDoDelete(); break;
            default         : console.log("Invalid/unsupported method ", stepDescription.method);
        }
    },
    end:function(context, description){
        context.server.use(connectRoute(function(router){
            for(var v in context.getRoutes){
                console.log("Adding GET route ", v);
                router.get(v, context.getRoutes[v]);
            }

            for(var v in context.putRoutes){
                console.log("Adding PUT route ", v);
                router.put(v, context.putRoutes[v]);
            }

            for(var v in context.postRoutes){
                console.log("Adding POST route ", v);
                router.post(v, context.postRoutes[v]);
            }

            for(var v in context.deleteRoutes){
                console.log("Adding DELETE route ", v);
                router.delete(v, context.deleteRoutes[v]);
            }
        }))
    }
}


