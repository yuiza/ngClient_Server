var serverSocketId;
var socketId;

chrome.sockets.tcpServer.create({}, function(createInfo) {
    // サーバ用のソケット
    serverSocketId = createInfo.socketId;
 
    // 3000番ポートをlisten
    chrome.sockets.tcpServer.listen(serverSocketId, '0.0.0.0', 3000, function(resultCode) {
        if (resultCode < 0) {
            console.log("Error listening:" + chrome.runtime.lastError.message);
        } else{
            console.log('ok listen!!');
        }
    });
    console.log('server ok');
});
 
chrome.sockets.tcpServer.onAccept.addListener(function(info) {
    if (info.socketId === serverSocketId) {
        chrome.sockets.tcp.setPaused(info.clientSocketId, false);
    }
    console.log("connection ok");
});
 
chrome.sockets.tcp.onReceive.addListener(function(info) {

    socketId = info.socketId;

    if(info.socketId != socketId){
        console.log("Receive: ", info);
 
        // リクエスト確認: ArrayBufferを文字列に変換
        // 本来はヘッダの先頭と、Content-Length等からリクエストの範囲を検出し、
        // 受信データからHTTPリクエストを取り出す必要がある
        var requestText = ab2str(info.data);
        console.log(requestText);
 
        // レスポンス送信
        sendText = str2ab(requestText);

        chrome.sockets.tcp.send(socketId, sendText, function(info) {
            console.log('sendSocketId: ',socketId);
            if (info.resultCode < 0) {
                console.log("Error sending:" + chrome.runtime.lastError.message);
            }
        });
    }
    // var quit = '  BYE\n';
    // if(requestText === quit){
    //     chrome.sockets.tcp.disconnect(socketId);
    //     chrome.sockets.tcp.close(socketId);
    // }else{
    //    console.log('requestText: ',requestText);
    //    console.log('   quit    : ',quit);
    // }
});
 
chrome.sockets.tcp.onReceiveError.addListener(function(info) {
    console.log("Error: ", info);
});
 

function str2ab(text) {
    var typedArray = new Uint8Array(text.length);
 
    for (var i = 0; i < typedArray.length; i++) {
        typedArray[i] = text.charCodeAt(i);
    }
 
    return typedArray.buffer;
}
 
function ab2str(arrayBuffer) {
    var typedArray = new Uint8Array(arrayBuffer);
    var text = '';
 
    for (var i = 0; i < typedArray.length; i++) {
        text += String.fromCharCode(typedArray[i]);
    }
 
    return text;
}