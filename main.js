var consoleMsg = document.getElementById('consoleMsg');
let wrapperHeight, wrapperWidth, scale;
const landscapeRatio = 3 / 4;
const portraitRatio = 4 / 3;
function checkForUserMedia() {
    navigator.getMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );

    const hasGetUserMedia = () => {
        return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    };
    console.log('has user media ', hasGetUserMedia());
    // consoleMsg.innerHTML = 'has user media ' + hasGetUserMedia();
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'camera' })
            .then((permissionObj) => {
                // consoleMsg.innerHTML = permissionObj;
                if ('denied' === permissionObj.state.toLowerCase()) {
                    // consoleMsg.innerHTML = 'permission already denied, isCameraAvailable = false';
                    console.log('permission already denied, isCameraAvailable = false');
                }
            })
            .catch((error) => {
                // consoleMsg.innerHTML ='Got error :', error;
                console.log('Got error :', error);
            });
    }
    if (navigator.userAgent.search('MiuiBrowser') > -1) {
        // consoleMsg.innerHTML = 'Mi browser not supported, isCameraAvailable = false';
        console.log('Mi browser not supported, isCameraAvailable = false');
    }
    startStreamedVideo();
};

checkForUserMedia();

function startStreamedVideo(retake = false) {
    const hdConstraints = {
        video: {
            facingMode: { ideal: 'environment' },
            width: 1500
        }
    };
    if (navigator.getMedia) {
        console.log('navigator.getMedia found');
        navigator.getMedia((hdConstraints), (
            (stream) => {
                successHandler(stream);
            }), (
                (error) => {
                    failureHandler(error);
                })
        );
    } else {
        console.log('navigator.getMedia not found');
        navigator.mediaDevices.getUserMedia(hdConstraints)
            .then(successHandler).catch(failureHandler);
    }
}
function successHandler(stream) {
    const video = document.querySelector('video');
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    console.log(capabilities);
    requestAnimationFrame(startScanning);
    video.onloadedmetadata = (e) => {
        console.log('got video stream')
        getScaleRenderVideo();
    };
    video.addEventListener('loadedmetadata', (e) => {
        getScaleRenderVideo
        console.log('got video stream')
    });
}
function failureHandler(error) {
    console.log('inside failure handler', error);
    // consoleMsg.innerHTML = 'inside failure handler' + error;
    // got error in gaining access
    let msg = 'No camera available.';
    if (error.code === 0) {
        if (error.message === 'Permission dismissed') {
            msg = 'User dismissed the permission to access the camera.';
            this.settings.isCameraAvailable = null;
        } else if (error.message === 'Permission denied') {
            msg = 'User denied access to use camera.';
        }
    }
    const cameraWrapper = document.querySelector('.camera-wrapper');
    cameraWrapper.classList.add('hidden');
}

function getScaleRenderVideo() {
    const windowWidth = window.innerWidth;
    const video = document.querySelector('video');
    const screenshotButton = document.querySelector('#screenshot-button');
    screenshotButton.classList.remove('hidden');
    const videoHeight = video.videoHeight;
    const videoWidth = video.videoWidth;
    const paddedWidth = 50;
    let _scale = (windowWidth - paddedWidth) / videoWidth;
    let _wrapperHeight = Math.min((videoHeight * _scale), (videoWidth * _scale * landscapeRatio)) + 'px';
    let _wrapperWidth = (videoWidth * _scale) + 'px';
    if (false) {
        const temp = _wrapperHeight;
        _wrapperHeight = _wrapperWidth;
        _wrapperWidth = temp;
        _scale = portraitRatio * _scale;
    }
    scale = _scale;
    wrapperHeight = _wrapperHeight;
    wrapperWidth = _wrapperWidth;
    console.log('scale ', _scale);
    console.log('wrapperHeight ', _wrapperHeight);
    console.log('wrapperWidth ', _wrapperWidth);
    startScanning();
    resizeDivs();
}
function startScanning() {
    const video = document.querySelector('#screenshot video');
    const canvasElement = document.createElement('canvas');
    const canvas = canvasElement.getContext("2d");
    const height = Math.min(video.videoHeight, video.videoWidth * landscapeRatio);
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.hidden = false;
        canvasElement.height = height;
        canvasElement.width = video.videoWidth;
        let w = canvas.width;
        let h = height;
        canvas.drawImage(video, 0, 0, w, h, 0, 0, w, h);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        if (code) {
            // document.write(code);
            console.log(code);
        }
    }
    requestAnimationFrame(startScanning);
}

function resizeDivs() {
    const video = document.querySelector('video');
    const wrapper = document.querySelector('#_cameraWrapper');
    const wrapperInner = document.querySelector('#_cameraWrapper_inner');
    const viewportScale = document.querySelector('#_viewportScale');
    wrapper.setAttribute('style', `min-height: ${wrapperHeight}; min-width: ${wrapperWidth}`);
    wrapperInner.setAttribute('style', `height: ${wrapperHeight}; width: ${wrapperWidth}`);
    viewportScale.setAttribute('style', `height: ${wrapperHeight}; width: ${wrapperWidth}`);
    video.setAttribute('style', `transform-origin: 0px 0px 0px; transform: scale(${scale})`);
}
function takeScreenshot() {
    const screenshotButton = document.querySelector('#screenshot-button');
    screenshotButton.classList.add('hidden');
    const img = document.querySelector('#screenshot img');
    const video = document.querySelector('#screenshot video');
    const canvas = document.createElement('canvas');
    const height = Math.min(video.videoHeight, video.videoWidth * landscapeRatio);
    canvas.width = video.videoWidth;
    canvas.height = height;
    let w = canvas.width;
    let h = height;
    if (false) {
        w = Number(wrapperWidth.slice(0, -2)) / scale;
        h = Number(wrapperHeight.slice(0, -2)) / scale;
        canvas.width = w;
        canvas.height = h;
    }
    canvas.getContext('2d').drawImage(video, 0, 0, w, h, 0, 0, w, h);
    // Other browsers will fall back to image/png
    img.hidden = false;
    const quality = 1;
    // if (video.videoWidth > 720) {
    //   quality = 1;
    // }
    img.src = canvas.toDataURL('image/jpeg', quality);
    if (img && img.style) {
        img.style.height = wrapperHeight;
        img.style.width = wrapperWidth;
    }
    const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const code = window.jsQR(imgData.data, imgData.width, imgData.height);
    if (code) {
        document.write("Found QR code", code);
    }
    setTimeout(() => {
        stopStreamedVideo();
    }, 300);
}

function stopStreamedVideo() {
    const videoElem = document.querySelector('#screenshot video');
    if (videoElem) {
        const stream = videoElem.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });

        videoElem.srcObject = null;
    }
}