
var http = require("http");
var url  = require("url");


function pRequest(method, myurl, buffer, callback) {
    var options = {};
    var size,buf;
    options.method = method;
    var srvUrl = url.parse(myurl);
    options.port    = srvUrl.port;
    options.hostname = srvUrl.hostname;
    options.path = srvUrl.path;

    var writing = (method == 'POST' || method == 'PUT');

    if(writing){
        options.form = JSON.stringify(json);
        buf = new Buffer(options.form);
        size = Buffer.byteLength(options.form);
        options.headers =  {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.5',
            'User-Agent': 'SwarmESB RestClient',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': size
        }

    }

    var req = http.request(options, function(res) {
        //console.log("Did request ", options);
        var str = '';
        res.on('data', function(data) {
            str += data;
        });
        res.on('end', function(data) {
            str += data;
            callback(null, str);
        });
        res.on('error', function(err) {
            console.log("Http request response fail towards:",options, err);
            callback(err);
        });

    });

    if(writing){
        req.write(buf);
    }

    req.end();

    req.on('error', function(e) {
        console.log("Http request fail:",options, e);
    })

}

function RestClient(){
    this.get        = function (myurl,callback){
        pRequest('GET', myurl,undefined, callback);
    }

    this.getJson        = function (url,callback){
        this.get(url, function(err, res){
            try{
                if(err) {
                    throw err;
                } else {
                    callback(null, JSON.parse(res));
                }
            }catch(error){
                callback(error);
            }
        })
    }

    this.putJson    = function (url,json, callback){
        pRequest('PUT', url, JSON.stringify(json), callback);
    }

    this.postJson    = function (url,json, callback){
        pRequest('POST', url, JSON.stringify(json), callback);
    }

    this.delete    = function (url, callback){
        var options = {};
        http.delete(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                callback(undefined,str);
            });
            response.on('error',function(error){
                callback(error);
            })
        });
    }
}

exports.getRestClient = function(){
    return new RestClient();
}



