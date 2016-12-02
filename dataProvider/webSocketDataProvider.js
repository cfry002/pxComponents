// webSocketDataProvider.js
//
// This component makes a call to the websocket gateway to retrieve data.
//
// Input parameters :
// - webSocketUrl : gateway url
// - [requestUrl|json] : the websocket gateway can accept a single requestUrl or requestJson or a list of requestUrls and json
//
// Example -
//
// uiWebSocketDataProvider([requestUrl|json],webSocketUrl)
//  .then(function(message){
//
//          Do logic with the received message here
//
// })
// Jason Coelho

px.import({
  ws:'ws'
}).then(function importsAreReady(imports) {

    var ws = imports.ws

    // requests contents of a dataservice via a websocket
    module.exports =  function(requests,websocketUrl) {

      // Function vars
      var open, message, close, error;
      
      var mySocket = new ws(websocketUrl);
      
      var removeListeners = function() {
        console.log("removing ws listeners");
        mySocket.removeListener('open', open);
        mySocket.removeListener('message', message);
        mySocket.removeListener('close', close);
        mySocket.removeListener('error', error);
      } 
      console.log("done opening ws");
      var promise = new Promise(function(resolve,reject) {

            var returnMsg

            //console.log("about to try opening ws for url "+requests)
            //var mySocket = new ws(websocketUrl)

            open = function() {
                console.log('recvd open')            // comment out to prevent noise
                if (Array.isArray(requests)) {
                    returnMsg = []
                    for (var k = 0; k < requests.length; k++) {
                        var json = JSON.stringify(requests[k])
                        mySocket.send(json)
                    }
                } else {
                    //console.log('single send - ' + requests)
                    mySocket.send(requests)
                }
            }
            message = function(message) {
                // console.log('received: %s', message) // comment out to prevent noise
                if (Array.isArray(returnMsg) && returnMsg.length >= 0) {
                    returnMsg.push(message)
                    if (returnMsg.length == requests.length)
                        mySocket.close()
                } else {
                    returnMsg = message
                    mySocket.close()
                }
            }
            close = function() {
                //console.log('done requests')
                //console.log(returnMsg)
                resolve(returnMsg)
                //console.log('closing socket');
            }
            error = function(msg) {
              console.log('ERROR on socket: '+msg);
            }
          mySocket.on('open', open);
          mySocket.on('message', message);
          mySocket.on('close', close);
          mySocket.on('error', error); 
        });

    return {
              wsSocket : mySocket,
              dataPromise : promise,
              cleanup : removeListeners
              }
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});

