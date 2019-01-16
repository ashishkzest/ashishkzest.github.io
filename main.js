var consoleMsg = document.getElementById('consoleMsg');
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
  console.log('has user media ' , hasGetUserMedia());
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
        width: 500
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
    video.onloadedmetadata = (e) => {
      console.log('got video stream')
      // getScaleRenderVideo();
    };
    video.addEventListener('loadedmetadata', (e) => {
      // getScaleRenderVideo
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
  }