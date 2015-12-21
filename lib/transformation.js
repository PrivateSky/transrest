

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
            strategy.step(v, context, description[v], description)
        }
    }

    strategy.end(context, description);

    return context;

}


exports.restAPI = function(transformation){
    return exports.generateTransformation(transformation, require("./t_r").defaultRestStrategy);
}

exports.A = function(transformation){
    return exports.generateTransformation(transformation, require("./t_a").AStrategy);
}


exports.B = function(transformation){
    return exports.generateTransformation(transformation, require("./t_b").BStrategy);
}

exports.C = function(transformation){
    return exports.generateTransformation(transformation, require("./t_c").CStrategy);
}

exports.createRestClient = require("./restClient.js").getRestClient;

////////////////////////////////////

