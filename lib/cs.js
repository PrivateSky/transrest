/**
 * Created by salboaie on 12/18/15.
 */

/*
 Purpose: CS: choreography to service transformation
 Status: stable
 TODOs:

 Assumes: this code can exist in a swarm choreography envirboment with global APis like startSwarm
 */


exports.CSStrategy = require("./restServer.js").newRestStrategy(
        function(name, context, description,args, callback){
            var swarmName           = description.swarmName;
            var params              = description[name].params;
            var stepDescription     = description[name];
            var result              = stepDescription.result;
            if(!result){
                callback(new Error("Result section is missing in " + JSON.stringify(description[name])));
                return "";
            }
            var endPhase            = result.phase;

            args.unshift(name);
            args.unshift(name);
            var swarm = startSwarm.apply(null, args);
            swarm.on(endPhase, callback);
        });