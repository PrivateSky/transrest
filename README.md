# transrest
SwarmESB transformation support to transform  
 
We found that we need to implement 4 types of transformations:
- type SF: Service to Functions: transform a REST service to functions usable in a processing node (eg Swarm ESB adapter) 
- type SC: Service to Choreography:  transform a REST Service towards a workflow/choreography (swarm description/script) based on an existing template
- type CS: Choreography to Service: expose a swarm workflow/choreography as a REST web service 
- type FS: Function to Service: expose functions as REST web APIs (good for testing but also for creating quickly REST web services)


Conventions:
 
    - any transformation has some standard attributes (swarmName, node, baseUrl, swarmTemplate) and a list of named object declarations that give names to the transformed services
    
    -in the named declarations there is a set of standard attributes     
        - "path" is the url's path of the external rest service (relative to baseURL) or the path of an exposed service. The variables from path are prefixed with $. The path can contain variable declarations (identified by $name=value constructs)
        - post/put variables are prefixed by __
        - a special variable  "__body" will represent the body of the POST and PUT requests            
        - "method" can be get, put, post, delete    
        - "params" is the list of parameters for the APIs (functions) created in A transformations or constructor parameters in B transformations
        - "code" represents a function used if FS transformations
        - "results" denote a phase name that will be called after the execution of the phase
  
    - in the global section, a set of attributes can be used
        - "baseURL" means the base url of the rest services that is transformed in adapter or workflow
        - "node" means the group (or the node type for the processing nodes) on which the transformation take place
        - swarmName is the name of the new swarm created after a SC transformation 
        - swarmTemplate is the name of swarm template that can be used as template for SC type transformations
          
             			 
//SC transformation example. For detailed example of each transformation type, check the tests
        
        {	
            swarmName: 	“EntityManagerFlow”,
            swarmTemplate:	”example.js”,
            node:		”EntityManager”,
            baseUrl:	"http://localhost/service.php"
            getEntity: {
                    method:"get",			
                    params: [“entity”, “token”]
                    path:"/$entity/$token",
                    after:"afterGetEntity"			
                    },
            createEntity: {
                    method: put,
                    params: [“entity”, “token”, “__body”]
                    path : "id=$entity&token=$token",			
                    after:"/afterCreateEntity"
                    },
        }


