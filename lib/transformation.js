
var http = require("http");
var connect = require("connect");
var connectRoute = require('connect-route');

var reservedKeywords = {
    swarmName: 	true,
    swarmTemplate:	true,
    node:		true,
    baseUrl: true,
    port:true
}

//returns an object with the parsed variables
exports.generateTransformation = function(description, strategy){
    var context = {};

    context.node            = description.node;
    context.baseUrl         = description.baseUrl;

    context.swarmName       = description.swarmName;
    context.swarmTemplate   = description.swarmTemplate;
    context.port            = description.port;

    function prepareURL(branch, args){
        branch.path = branch.path.trim();
        var beginUrl = branch.path[0];
        if(beginUrl == '?' || beginUrl == '/'){
            beginUrl = "";
        } else {
            beginUrl = "/";
        }
        var url = context.baseUrl + beginUrl + branch.path;
        var params = {};
        for(var i = 0 ; i< args.length; i++){
            var name = branch.params[i].trim();
            if(name[0] != '$'){
                name = '$' + name;
            }
            url = url.replace(params[name], args[i]);
        }

        return url;
    }



    strategy.begin(context, description);


    for(var v in description){
        if(!reservedKeywords[v]){
            strategy.step(v, context, description[v])
        }
    }

    strategy.end(context, description);

    return context;

}

exports.createRestClient = require("./restClient.js").getRestClient;


function retriveContent(req, callback){
    var bodyStr = "";
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
        callback(null, bodyStr);
    });
}

function makeArgs(context, stepDescription){
    var p = stepDescription.params;
    var args = [];
    for(var i=0; i < p.length; i++ ){
        args.push(context[p[i]]);
    }
    return args;
}

//TODO: Check when next functions should be called...

var defaultRestStrategy= {
    begin:function(context, description){
        context.server = connect();
        context.server.listen(context.port);

        context.server.use(function (request, response, next) {
            console.log("New request for:",request.url);
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
        var route = stepDescription.path.replace("$", ":");

        function getDoGet(){
         return function(req, res, next){
             console.log("New GET request for:",req.url);
             res.write(description.code.apply(context,makeArgs(context, stepDescription)));
             res.end();
         }
        }

        function getDoPut(){
            return function(req, res, next){
                retriveContent(req, function(err, res){
                    context.__body = res;
                    res.write(description.code.apply(context,makeArgs(context, stepDescription)));
                    res.end();
                })
            }
        }

        function getDoPost(){
            return function(req, res, next){
                retriveContent(req, function(err, res){
                    context.__body = res;
                    res.write(description.code.apply(context,makeArgs(context, stepDescription)));
                    res.end();
                })
            }
        }

        function getDoDelete(){
            return function(req, res, next){
                res.write(description.code.apply(context,makeArgs(context, stepDescription)));
                res.end();
            }
        }

        switch(stepDescription.method.trim()){
            case 'get'      : context.getRoutes[route]    = getDoGet();    break;
            case 'put'      : context.putRoutes[route]    = getDoPut();    break;
            case 'post'     : context.postRoutes[route]   = getDoPost();   break;
            case 'delete'   : context.deleteRoutes[route] = getDoDelete(); break;
            default         : console.log("Invalid/unsupported method ", stepDescription.method);
        }
    },
    end:function(context, description){
        context.server.use(connectRoute, function(router){
            for(var v in context.getRoutes){
                router.get(v, context.getRoutes[v]);
            }

            for(var v in context.putRoutes){
                router.put(v, context.putRoutes[v]);
            }

            for(var v in context.postRoutes){
                router.put(v, context.postRoutes[v]);
            }

            for(var v in context.deleteRoutes){
                router.delete(v, context.deleteRoutes[v]);
            }
        })
    }
}


exports.restAPI = function(transformation){
    return exports.generateTransformation(transformation, defaultRestStrategy);
}


////////////////////////////////////

exports.AStrategy = {
    begin:function(context, description){

    },
    step:function(name, context, stepDescription){

        function doGet(){
            console.log("Do get");
        }

        function doPost(){

        }

        function doPut(){

        }

        function doDelete(){

        }

        console.log("Step ", name);

        switch(stepDescription.method.trim()){
            case 'get'      : context[name] = doGet;break;
            case 'put'      : context[name] = doPut; break;
            case 'post'     : context[name] = doPost; break;
            case 'delete'   : context[name] = doDelete;break;
            default:          console.log("Invalid/unsupported method ", stepDescription.method);
        }
    },
    end:function(context, description){}
}


exports.BStrategy = {
    begin:function(context, description){

    },
    step:function(name, context, stepDescription){

        function doGet(){
            console.log("Do get");
        }

        function doPost(){

        }

        function doPut(){

        }

        function doDelete(){

        }

        console.log("Step ", name);

        switch(stepDescription.method.trim()){
            case 'get'      : context[name] = doGet;break;
            case 'put'      : context[name] = doPut; break;
            case 'post'     : context[name] = doPost; break;
            case 'delete'   : context[name] = doDelete;break;
            default:          console.log("Invalid/unsupported method ", stepDescription.method);
        }
    },
    end:function(context, description){}
}
