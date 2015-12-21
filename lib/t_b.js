/**
 * Created by salboaie on 12/18/15.
 */

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
