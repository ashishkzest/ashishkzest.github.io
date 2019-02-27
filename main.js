var options = {
    controls: true,
    width: 640,
    height: 480,
    fluid: false,
    controlBar: {
        volumePanel: false
    },
    plugins: {
        record: {
            audio: false,
            video: {
                // video constraints: set resolution of camera
                mandatory: {
                    minWidth: 1280,
                    minHeight: 720,
                },
            },
            maxLength: 15,
            debug: true,
            frameWidth: 1280,
            frameHeight: 720
        }
    }
};

// apply some workarounds for certain browsers
// applyVideoWorkaround();

var player = videojs('myVideo', options, function() {
    // print version information at startup
    var msg = 'Using video.js ' + videojs.VERSION +
        ' with videojs-record ' + videojs.getPluginVersion('record') +
        ' and recordrtc ' + RecordRTC.version;
    videojs.log(msg);
});

// error handling
player.on('deviceError', function() {
    console.warn('device error:', player.deviceErrorCode);
});

player.on('error', function(element, error) {
    console.error(error);
});

// user clicked the record button and started recording
player.on('startRecord', function() {
    console.log('started recording!');
});

// user completed recording and stream is available
player.on('finishRecord', function() {
    // the blob object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    var data = player.recordedData;
    console.log('finished recording: ', data);
    var formData = new FormData();
    formData.append('file', data, data.name);
    console.log('uploading recording:', data.name);
    console.log({
        method: 'POST',
        body: formData
    });
});