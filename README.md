# transrest
SwarmESB transformation support. 
We found that we need to implement 4 types of transformations:
- type A: REST service towards a processing node (Swarm ESB adapter) 
- type B: REST Service towards a workflow (swarm description/script)  
- type C: expose a swarm workflow as a REST web service              
- type R (for tests mainly): expose functions as REST web APIs        


Conventions:
 
    - any transformation has some standard attributes (swarmName, node, baseUrl, swarmTemplate) and a list of named object declarations that give names to the transformed services
    - swarmName is the name of the new swarm created after the A type transformation 
    - swarmTemplate is the name of swarm that can be used as template for A type transformations
     - "after" denote a phase name that will be called after the execution of the phase  
    - "baseURL" means the base url of the rest services that is transformed in adapter or workflow (A transformation)
    - "path" is the url's path of the external rest service (relative to baseURL) or the path of an exposed service (swarm transformed in rest service - C transformation)
    - the variables from path are prefixed with $. The path can contain variable declarations (identified by $name=value constructs)
    - post/put variables are prefixed by __
    - a special variable  "__body" will represent the body of the POST and PUT requests    
    - "node" means the group (or the node type for the processing nodes) on which the transformation take place
    - "method" can be get, put, post, delete    
    - "params" is the list of parameters for the APIs (functions) created in A transformations or constructor parameters in B transformations 
    - NOT implemented (only on request): the "extract" attribute can specify a regular expression ("expr") that it is used to extract transformation variables from URLs. The mapping between what is matched in the regular expression and 
     names of teh variables is declared in the "map" construct. 
     Example: 
            extract : {
                expr:"/(^\/*)/((^\/*))/",
                map:{
                    entity:2,
                    token:1
                }
            }
             			
 
//transformation example
transformation({	
	swarmName: 	“EntityManagerFlow”,
	swarmTemplate:	”example.js”,
	node:		”EntityManager”,
	baseUrl:	"http://localhost/service.php"
	getEntity: {
			method:get,			
			params: [“entity”, “token”]
			path:"$entity/$token",
            after:"afterGetEntity"			
			},
	createEntity: {
			method: put,
			params: [“entity”, “token”, “__body”]
			path : "id=$entity&token=$token",			
			after:"afterCreateEntity"
			},
} )


//example.js
{
    afterGetEntity:{
        code:function(){
        //...
        }    
    },
    afterCreateEntity:{
        code:function(){
        //...
                }        
    }
   
}

