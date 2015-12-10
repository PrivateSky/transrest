//returns an object with the parsed variables
exports.generateTransformation = function(description, strategy){
    var context = {};

    context.node            = description.node;
    context.baseUrl         = description.baseUrl;

    context.swarmName       = description.swarmName;
    context.swarmTemplate   = description.swarmTemplate;

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

    var reserved = {
        swarmName: 	true,
        swarmTemplate:	true,
        node:		true,
        baseUrl: true
    }

    strategy.begin(context, description);
    for(var v in description){
        if(reserved[v]){
             if( typeof(description[v]) != 'string'){
                 console.log("Invalid property ", v, "in the decriptin of the transformation. It should be a string");
             }
        }  else {
            strategy.step(v, context, description[v])
        }
    }

    strategy.end(context, description);

    return context;

}


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

var request = require("request");


function RestClient(){
    this.get        = function (url,callback){

    }

    this.getJson        = function (url,callback){

    }

    this.putJson    = function (url,json, callback){

    }

    this.postJson    = function (url,json, callback){

    }

    this.delete    = function (url, callback){

    }
}

exports.getRestClient = function(){
    return new RestClient();
}


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


var defaultRestStrategy= {
    begin:function(context, description){
        context.server = connect();
        context.getRoutes = {};
        context.putRoutes = {};
        context.postRoutes = {};
        context.deleteRoutes = {};

    },
    step:function(name, context, stepDescription){
        var route = context.path.replace("$", ":");

        function getDoGet(){
         return function(req, res, next){
             res.write(description.code.apply(context,makeArgs(context, stepDescription)));
             res.end();
         }
        }

        function getDoPut(){
            retriveContent(req, function(err, res){
                context.__body = res;
                res.write(description.code.apply(context,makeArgs(context, stepDescription)));
                res.end();
            })
        }

        function getDoPost(){
            retriveContent(req, function(err, res){
                context.__body = res;
                res.write(description.code.apply(context,makeArgs(context, stepDescription)));
                res.end();
            })
        }

        function getDoDelete(){
            res.write(description.code.apply(context,makeArgs(context, stepDescription)));
            res.end();
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