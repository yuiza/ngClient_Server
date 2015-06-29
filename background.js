chrome.app.runtime.onLaunched.addListener(function(launchData) {
    chrome.app.window.create('index.html', {
        'bounds': {
            'width' : 300,
            'height': 500,
            'top' : 0,
            'left': 0
        }
    });
});