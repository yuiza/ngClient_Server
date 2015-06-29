var ip;
var port;
var socketid;
var tcpflag = 0;


function tcpController($scope) {

    console.log("Startup OK!!");

    $scope.comments = [];

    $scope.connect = function() {

        ip = $scope.ipaddr;
        console.log(ip);
        port = $scope.portNum;
        console.log(port);

        chrome.sockets.tcp.create({},function(createInfo) {
            chrome.sockets.tcp.connect(createInfo.socketId, ip, port, function(resultCode) {
            if (resultCode < 0) {
                console.log("Error listening:" + chrome.runtime.lastError.message);
                var log = "Connection Error";
                var time = new Date();
                time = time.toLocaleString();
                $scope.comments.push({time: time, comments: log});
                $scope.$apply();
            }
            });
        //socketid = createInfo.socketId
        socketid = angular.copy(createInfo.socketId);
        console.log(socketid);
        tcpflag = 1;
        });
    }

    $scope.disconnect = function(){
        tcpflag = 0;
        chrome.sockets.tcp.disconnect(socketid);
    }


    $scope.send = function() {
        console.log('sendMessage');

        var text = $scope.message;
        text = text + '\n';
        var sendText = str2ab(text);

        console.log("send text: ", sendText);

        chrome.sockets.tcp.send(socketid, sendText, function(info) {
            if (info.resultCode < 0) {
                console.log("Error sending:" + chrome.runtime.lastError.message);
            }
        });
        $scope.message = '';
    }

    //Receive Lisner event
    chrome.sockets.tcp.onReceive.addListener(function(info) {
        if(info.socketId != socketid && tcpflag == 1){
            console.log("reciving: ", socketid);
            //info.data is an arrayBuffer.
            var receiveText = ab2str(info.data);
            console.log('Recive: ', receiveText);

            var time = new Date();
            time = time.toLocaleString();

            $scope.comments.push({time: time, comments: receiveText});
            $scope.$apply();
        }
    });
}


chrome.sockets.tcp.onReceiveError.addListener(function(info) {
    console.log("Error: ", info);
});

/**
 * 文字列をArrayBufferに変換する(ASCIIコード専用)
 *
 * @param text
 * @returns {ArrayBuffer}
 */
 function str2ab(text) {
    var typedArray = new Uint8Array(text.length);

    for (var i = 0; i < typedArray.length; i++) {
        typedArray[i] = text.charCodeAt(i);
    }
    return typedArray.buffer;
}

/**
 * ArrayBufferを文字列に変換する(ASCIIコード専用)
 *
 * @param arrayBuffer
 * @returns {string}
 */
function ab2str(arrayBuffer) {
    var typedArray = new Uint8Array(arrayBuffer);
    var text = '';

    for (var i = 0; i < typedArray.length; i++) {
        text += String.fromCharCode(typedArray[i]);
    }
    return text;
}
