function launchFullscreen() {
    var element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function quitFullscreen() {
    var element = document.documentElement;
    if (element.exitFullscreen) {
        element.exitFullscreen();
    } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
    } else if (element.webkitCancelFullScreen) {
        element.webkitCancelFullScreen();
    } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
    }
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

export {launchFullscreen, quitFullscreen, degrees_to_radians}