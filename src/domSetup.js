import environmentDefinitions from "./Constants/defaultEnvironmentDefinitions";
import { 
    populateDestinationList, 
    populateDestinationSelect, 
    reinitializeLoadedEnvironmentDefinitions, 
    setupSceneEnvironments, 
    showEnvironment 
} from "./main";
import { addEnvironment } from "./Managers/environmentManager";
import { toggleHotspotPlacingMode } from "./Managers/hotspotManager";
import { toggleTagPlacingMode } from "./Managers/tagManager";
import { exportEnvironments } from "./Utilities/exportManager";

// Cache canvas reference for resizing function
var canvas = document.getElementById('renderCanvas')

export function initializeDOM(domainDirectory, showDevelopmentTools) {
    // Ensure jQuery
    /*
    if(typeof jQuery == 'undefined') {
        console.log("Missing jQuery.");
        var jQueryScript = document.createElement('script');
        jQueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
        document.getElementsByTagName('head')[0].appendChild(jQueryScript);
        console.log("Added jQuery to head");
    }
    */

    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
        setCanvasSize();
    });

    // Fixes bug when exiting fullscreen with Esc button (engine/canvas doesn't resize)
    if (document.addEventListener) {
        let exitHandler = () => {
            if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
                top.toggleFullscreen(false);
                top.engine.resize();
                setCanvasSize();
            }
        }
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
    }

    let closeRegistrationOverlay = () => {
        registrationOverlay.style.display = "none";
    }
    let registrationOverlay = document.getElementById("registrationOverlay");
    let registrationCloseButton1 = document.getElementById("loginCloseX1");
    let registrationCloseButton2 = document.getElementById("loginCloseX2");
    let registrationCloseButton3 = document.getElementById("loginCloseButton");

    //registrationOverlay.onclick = closeRegistrationOverlay;
    registrationCloseButton1.onclick = closeRegistrationOverlay;
    registrationCloseButton2.onclick = closeRegistrationOverlay;
    registrationCloseButton3.onclick = closeRegistrationOverlay;

    let submitLoginButton = document.getElementById("submitLogin");
    submitLoginButton.onclick = () => {
        let inputPassword = document.getElementById("input_password");
        let isPasswordOK = inputPassword.value == localizedStrings._lockedPass;
        if(isPasswordOK) {
            top.isAuthorized = true;
            populateDestinationList();
            var unlockedTex = new BABYLON.Texture(domainDirectory + "Textures/lock_unlocked.png", scene);
            unlockedTex.hasAlpha = true;
            unlockedTex.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
            unlockedTex.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
            top.materials.lockedMat.diffuseTexture = unlockedTex;
            reinitializeLoadedEnvironmentDefinitions();
            showEnvironment(top.currentEnvironmentIndex); // registrationOverlay.environmentIndex to navigate to environment after logging in
            // Toggle display
            let loginForm = document.getElementById('loginFormForm');
            loginForm.style.display = 'none';
            let messageForm = document.getElementById('loginFormFeedback');
            messageForm.style.display = 'unset';
        } else {
            inputPassword.value = "";
            let p_incorrectPassword = document.getElementById('pPasswordIncorrect');
            p_incorrectPassword.style.visibility = 'visible';
        }
    }

    let enterButton = document.getElementById("enterButton");
    if(enterButton) {
        document.getElementById("enterButton").onclick = () => {
            var overlay = document.getElementById("canvasOverlay");
            if(overlay) overlay.style.display = "none";
            showEnvironment(0);
        }
        document.getElementById("previewImage").src = domainDirectory + "Textures/previewImage.jpg";
        document.getElementById("img360").src = domainDirectory + "Textures/360_icon.png";
    }

    if(showDevelopmentTools) {
        document.getElementById('btn_startEmpty').onclick = () =>{
            top.loadedEnvironmentDefinitions = [];
            reinitializeLoadedEnvironmentDefinitions();
        }
        document.getElementById('btnNavigate').onclick = () => {
            //let newTexture = new BABYLON.VideoTexture("_video", "./Resources/crystal.mp4", top.scene, false, true, 3);//, { autoPlay: true, muted: true });
            //top.videoDome.texture = newTexture;
            showEnvironment(4);
        }
        document.getElementById('btnDebug').onclick = () => {
            // Debug purposes
        }
        document.getElementById('formFile').onchange = (event) => {
            let input = event.target;

            let reader = new FileReader();
            reader.onload = function(){
                try {
                    top.importedEnvironmentsJson = reader.result;
                    // Auto import
                    let imported = JSON.parse(top.importedEnvironmentsJson);
                    //console.log("Imported: ", imported);
                    //setupSceneEnvironments(imported);
                } catch(ex) {
                    //console.log("Invalid json file structure when loading environments. Please check contents.");
                    console.log("Import environments failed: ", ex);
                }
            };
            reader.readAsText(input.files[0]);
        }
        document.getElementById('btnImportFile').onclick = () => {
            let imported = JSON.parse(top.importedEnvironmentsJson);
            setupSceneEnvironments(imported);
        }
        document.getElementById('btnExport').onclick = () => {
            exportEnvironments(top.environments);
        }
        document.getElementById('btnImportBuiltin').onclick = () => {
            var environmentsToImport = environmentDefinitions;
            setupSceneEnvironments(environmentsToImport);
        }
        
        // Adds environment to current scene environments
        document.getElementById('btnAddEnvironment').onclick = () => {
            let orderNum = top.environments.length + 1;
            let envName = document.getElementById('inputEnvName').value;
            let isLocked = document.getElementById("cbIsLockedEnvironment").checked;
            let isVideo = document.getElementById("cbIsVideo").checked;
            let url = document.getElementById('inputEnvUrl').value;
        
            addEnvironment(orderNum, isVideo, envName, isLocked, url);
        
            populateDestinationSelect();
            populateDestinationList();
        
            document.getElementById('addEnvironmentFeedback').innerText = 'Success! '+ envName + ' added!';
        }
        
        document.getElementById('btnToggleHotspotLeft').onclick = () => toggleHotspotPlacingMode(true);
        document.getElementById('btnToggleHotspotRight').onclick = () => toggleHotspotPlacingMode(false);
        document.getElementById('btnToggleTagLeft').onclick = () => toggleTagPlacingMode(true);
        document.getElementById('btnToggleTagRight').onclick = () => toggleTagPlacingMode(false);
    }
}

var resizeAdvancedTextures = function(){
    if(!top.infoPanel?.holder?.resize)
        return;

    // Get engine dimensions
    var width = top.engine.getRenderWidth();
    var height = top.engine.getRenderHeight();

    // Responsive view info panel
    top.infoPanel.holder.resize(width, height);

    // Resize main GUI
    top.advancedTexture.scaleTo(width, height);
    top.advancedTexture.rootContainer.isVisible = false;
    top.advancedTexture.rootContainer.isVisible = true;

    // Resize info panel GUI
    top.infoPanel.holder.scaleTo(width, height);
    top.infoPanel.holder.rootContainer.isVisible = false;
    top.infoPanel.holder.rootContainer.isVisible = true;
}

export function setCanvasSize() {
    if(top.isFullscreen) {
        resizeAdvancedTextures();
        return;
    }
    
    canvas.width = document.getElementById('app').clientWidth; // 800 for debug
    let isMobile = window.innerWidth < 1200;
    let heightFactor = isMobile ? 0.6 : 0.8;
    canvas.height = window.innerHeight * heightFactor;

    var canvasOverlay = document.getElementById('canvasOverlay');
    var registrationOverlay = document.getElementById('registrationOverlay')
    if(canvasOverlay) {
        canvasOverlay.style.width = `${canvas.width}px`;
        canvasOverlay.style.height = `${canvas.height}px`;
        if(registrationOverlay) {
            registrationOverlay.style.width = canvasOverlay.style.width;
            registrationOverlay.style.height = canvasOverlay.style.height;
        }
    }

    resizeAdvancedTextures();
}