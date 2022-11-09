'use strict';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { getEnvironments } from './Managers/environmentManager';
import { tagManagerCastRayHandler } from './Managers/tagManager';
import { hotspotManagerCastRayHandler } from './Managers/hotspotManager';
import { localizeAppTexts } from './Managers/localizationManager';
import { createContentPanelFullScreen, showAxis } from './Utilities/engineUtil';
import { initializeDOM, setCanvasSize } from './domSetup';
import "core-js/stable";
import "regenerator-runtime/runtime";
import 'babylonjs-loaders';

// Deployment
const isProduction = false; // For loading definitions
const showDevelopmentTools = true;
const isDeployingToDnn = false;

// App Settings
const initialEnvironmentIndex = 0;
const useDefaultCameraOrientation = true;
const defaultCameraAlpha = -0.2;
const defaultCameraBeta = 1.4;
const resetCameraOnNavigation = true;
const useDestinationCameraOffsetOnNavigation = false; // Takes priority over reset

// Document setup
if(isDeployingToDnn) {
    document.body.style.overflow = 'hidden';    
}
if(showDevelopmentTools) {
    document.getElementById('toolsContainer').style = "visibility: unset; height: unset";
}

// Debug fields
const isDebug = true;
const showEnvironmentOnStart_debug = isDebug && true;
const environmentToShow_debug = 3;
const showInfoPanelOnStart_debug = isDebug && false;
const showInspector_debug = isDebug && true;
const showCameraAlphaIndicator_debug = isDebug && true;
const showAxis_debug = isDebug && true;
if(isDebug) {
    document.body.style.overflow = 'unset';
}

console.log(isProduction ? "Production build" : "Development build");
const domainDirectory = isProduction ? document.getElementById('serverAppDirectory').value : "./";
const defaultEnvironmentsJsonUri = domainDirectory + 'Resources/environmentDefinitions.json';
const localizedStringsJsonUri = domainDirectory + 'Resources/localizedAppStrings.json';
const appSettingsJsonUri = domainDirectory + 'Resources/appSettings.json';

//////////////////////
// GLOBAL variables //
//////////////////////
// BabylonJS objects
top.engine = null;
top.scene = null;
top.gui3d = null; // Contains MeshButton3D for hotspots
top.photoDome = null;
top.videoDome = null;
top.camera = null;
top.advancedTexture = null;
top.axis = null;
// Custom BabylonJS objects
top.infoPanel = {holder: null, tbTitle: null, tbDesc: null, tbImage: null, btnLink: null};
top.materials = {};
// Methods
top.setPointer = (isShown) => document.body.style.cursor = isShown ? 'pointer' : '';
top.showEnvironment = showEnvironment;
top.onEnvironmentChanged = onEnvironmentChanged;
top.reinitializeEnvironments = reinitializeLoadedEnvironmentDefinitions;
top.toggleFullscreen = toggleFullscreen;
top.toggleVideoDome = function(showVideoDome) {
    top.photoDome && top.photoDome?.setEnabled(!showVideoDome);
    top.videoDome && top.videoDome?.setEnabled(showVideoDome);
    top.isVideoDomeActive = showVideoDome;
}
// App fields
top.loadedEnvironmentDefinitions = []; // Populates on "Import". Clears on "New Empty".
top.environments = []; //{name: String, texture, hotspots: [{String, Mesh, GUI.Button}], tags: [{String, Mesh, GUI.TextBlock}]}
top.currentEnvironmentIndex = 0;
top.localizedStrings = {};
top.isAuthorized = false;
top.isFullscreen = false;
top.importedEnvironmentsJson = null;
top.hotspotManager = { isPlacingMode: false, isLeft: false, hotspots: [] };
top.tagManager = { isPlacingMode: false, isLeft: false, tags: [] };

// Custom gui blocking solution (3d elements check this to handle pointer events)
top.isBlocking3dElements = false;
top.isInfoPanelOpen = false;
top.is3dElementInteractionDisabled = () => {
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // Used to block 3d element touch interaction when trying to block 3d elements 
    return top.isBlocking3dElements || (top.isInfoPanelOpen && isMobile);
}

// Initialize the 3D engine and scene
let canvas = document.getElementById('renderCanvas');
setupEngine(canvas);

// Load App settings (localization, theme, colors, font color)
initializeAppSettings(appSettingsJsonUri, () => {
    // Load localization texts
    initializeLocalization(localizedStringsJsonUri, () => {
        // Localize texts, setup scene, setup enviroments and 
        localizeAppTexts(top.localizedStrings);

        setupScene(top.engine, canvas);
        initializeInfoPanel(top.localizedStrings);
        initializeEnvironments(defaultEnvironmentsJsonUri, () => {
            // Other initialization code...
            showEnvironment(initialEnvironmentIndex);

            if(isDebug) {
                showEnvironmentOnStart_debug && showEnvironment(environmentToShow_debug);
                showInfoPanelOnStart_debug && top.infoPanel.holder.show();
            }
        });

        // Test load 3d model
        BABYLON.SceneLoader.ImportMesh(
            null, 
            "./Resources/Models/MyModel/", 
            "model.gltf", 
            top.scene, 
            function (meshes, particleSystems, skeletons) {
                let loadedModel = meshes[0];
                loadedModel.name = "_ImportedModel";
                loadedModel.position.x = 2;
                // do something with the meshes and skeletons
                // particleSystems are always null for glTF assets
            });
    });
});


function setupEngine(canvas) {
    top.engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    top.engine.resize();
    setCanvasSize(); // TODO: Needed ? already called in setupScene

    // Trying to fix text blurriness
    //engine.setHardwareScalingLevel(0.5);
    //engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
}

function setupScene(engine, canvas) {
    var scene = createScene(engine, canvas);

    scene.debugLayer.show({
        embedMode: false,
        overlay: true,
        showExplorer: showInspector_debug,
        showInspector: showInspector_debug,
    });
    
    // Register render loop
    engine.runRenderLoop(function(){
        scene.render();
    });
    
    // Show axis
    if(showAxis_debug) {
        top.axis = showAxis(scene, 5);
        top.axis.position.x = -6.62;
        top.axis.position.y = -3.12;
        top.axis.position.z = 1.25;
    }
    
    // Create light
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Register scene handlers
    scene.onPointerDown = () => {
        if(top.tagManager.isPlacingMode) {
            tagManagerCastRayHandler();
        } else if (top.hotspotManager.isPlacingMode) {
            hotspotManagerCastRayHandler();
        }
    }

    // Initial canvas resize
    setCanvasSize();

    if(showDevelopmentTools) {
        document.getElementById('btnInspector').onclick = () => { 
            scene.debugLayer.isVisible() ? scene.debugLayer.hide() : scene.debugLayer.show();
        };
        document.getElementById('btnUtilityInspector').onclick = () => {
            let debugLayer = top.gui3d.utilityLayer.utilityLayerScene.debugLayer; 
            debugLayer.isVisible() ? debugLayer.hide() : debugLayer.show();
        }
        document.getElementById('btn_ShowVr').onclick = () => { 
            var experience = scene.createDefaultXRExperienceAsync();
        };
    }
}

// CreateScene function that creates and return the scene
function createScene(engine, canvas) {
    let scene = new BABYLON.Scene(engine);
    top.scene = scene;
    scene.clearColor = new BABYLON.Color3(0, 82 / 255, 131 / 255); // TGK blue: 0, 121, 193
    let camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2,  Math.PI / 2, 0, BABYLON.Vector3.Zero(), scene);
    top.camera = camera;
    camera.panningSensibility = 0;
    camera.angularSensibilityX = 3000 * -1;
    camera.angularSensibilityY = 3000 * -1;
    camera.useNaturalPinchZoom = true; // Somehow disables pinch. (false by default) 
    //camera.pinchPrecision = 12; // Default
    camera.attachControl(canvas, true);
    camera.inputs.attached.mousewheel.detachControl(canvas);
    camera.resetToDefault = () => {
        top.camera.alpha = useDefaultCameraOrientation ? defaultCameraAlpha : (-Math.PI / 2);
        top.camera.beta = useDefaultCameraOrientation ? defaultCameraBeta : (Math.PI / 2);
    }
    camera.setAlphaRotation = (degrees) => {
        let rad = degrees * (Math.PI/180);
        console.log("setting to "+ rad + " radians");
        top.camera.alpha = rad;
    }
    
    // Load textures and materials
    var hotspotTex1 = new BABYLON.Texture(domainDirectory + "Textures/PathWay_Right.png", scene);
    hotspotTex1.hasAlpha = true;
    hotspotTex1.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    hotspotTex1.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var hotspotTex2 = new BABYLON.Texture(domainDirectory + "Textures/PathWay_Left.png", scene);
    hotspotTex2.hasAlpha = true;
    hotspotTex2.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    hotspotTex2.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var tagTex1 = new BABYLON.Texture(domainDirectory + "Textures/Info_Right_simple.png", scene);
    tagTex1.hasAlpha = true;
    tagTex1.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    tagTex1.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var tagTex2 = new BABYLON.Texture(domainDirectory + "Textures/Info_Left_simple.png", scene);
    tagTex2.hasAlpha = true;
    tagTex2.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    tagTex2.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var tagTex1_hover = new BABYLON.Texture(domainDirectory + "Textures/Info_Right.png", scene);
    tagTex1_hover.hasAlpha = true;
    tagTex1_hover.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    tagTex1_hover.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var tagTex2_hover = new BABYLON.Texture(domainDirectory + "Textures/Info_Left.png", scene);
    tagTex2_hover.hasAlpha = true;
    tagTex2_hover.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    tagTex2_hover.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    var lockedTex = new BABYLON.Texture(domainDirectory + "Textures/lock.png", scene);
    lockedTex.hasAlpha = true;
    lockedTex.wrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;
    lockedTex.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE;

    var hotspotMatBase = new BABYLON.StandardMaterial("hotspotMat_base", scene);
    hotspotMatBase.emissiveColor = new BABYLON.Color3(1,1,1);
    hotspotMatBase.backFaceCulling = false;
    hotspotMatBase.disableLighting = true;
    hotspotMatBase.useAlphaFromDiffuseTexture = true;
    hotspotMatBase.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND; 
    hotspotMatBase.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

    var hotspotMaterial1 = hotspotMatBase.clone("hotspotMat1");
    hotspotMaterial1.diffuseTexture = hotspotTex1;

    var hotspotMaterial2 = hotspotMatBase.clone("hotspotMat2");
    hotspotMaterial2.diffuseTexture = hotspotTex2;

    var tagMaterial1 = hotspotMatBase.clone("tagMat1");
    tagMaterial1.diffuseTexture = tagTex1;
    
    var tagMaterial2 = hotspotMatBase.clone("tagMat2");
    tagMaterial2.diffuseTexture = tagTex2;

    var tagMaterial1_hover = hotspotMatBase.clone("tagMat1Full");
    tagMaterial1_hover.diffuseTexture = tagTex1_hover;
    
    var tagMaterial2_hover = hotspotMatBase.clone("tagMat2Full");
    tagMaterial2_hover.diffuseTexture = tagTex2_hover;

    var lockedMaterial = hotspotMatBase.clone("lockedMat");
    lockedMaterial.diffuseTexture = lockedTex;

    top.materials = {
        ...top.materials,
        hotspotMat1: hotspotMaterial1,
        hotspotMat2: hotspotMaterial2,
        tagMat1: tagMaterial1,
        tagMat2: tagMaterial2,
        tagMat1_hover: tagMaterial1_hover,
        tagMat2_hover: tagMaterial2_hover,
        lockedMat: lockedMaterial
    };
    hotspotMatBase.dispose();
    
    // Create photo dome for 360 images
    let photoDomeOptions = {
        resolution: 32,
        size: 1000,
        useDirectMapping: false
    };
    top.photoDome = new BABYLON.PhotoDome("photoDome", "./Resources/placeholder.jpg", photoDomeOptions, scene);

    // Create video dome for 360 videos
    let videoDomeOptions = {
        resolution: 32,
        clickToPlay: false,
        autoPlay: false,
        size: 1000,
        poster: "./Resources/placeholder.jpg"
    };
    top.videoDome = new BABYLON.VideoDome("videoDome", "./Resources/placeholderVideo.mp4", videoDomeOptions, scene);

    // Create picking dome and get dome mesh for raycasting
    let pickingDome = new BABYLON.PhotoDome("raycastPickingDome", "./Resources/placeholder.jpg", { size:500 }, scene);
    top.pickingDomeMesh = pickingDome.getChildMeshes()[0];
    top.pickingDomeMesh.visibility = 0;
    top.pickingDomeMesh.isPickable = false;

    //uncomment
    //dome.fovMultiplier = 2;
    //top.camera.fov = .7;
    //top.camera.fov = 1.5; // <- maybe use camera fov instead?
    top.camera.fov = 1;

    // 3d GUI manager
    top.gui3d = new GUI.GUI3DManager(scene);
    top.gui3d.utilityLayer.utilityLayerScene.lights[0].groundColor = new BABYLON.Vector3(0.8,0.8,0.8);

    // GUI texture
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("_UI"); 
    top.advancedTexture = advancedTexture;

    // add GUI 
    addScreenUI(advancedTexture);

    // Initialize XR experience (disabled for now)
    //let xrExperience = await scene.createDefaultXRExperienceAsync();

    return scene;
};

function addScreenUI(advancedTexture) {
    // Logo
    var logo = new GUI.Image("logo", domainDirectory + "Textures/logo.png")
    //logo.width = "96px";
    //logo.height = "72px";
    logo.height = 0.1;
    logo.fixedRatio = 1.33;
    logo.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    logo.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    logo.stretch = GUI.Image.STRETCH_UNIFORM;
    advancedTexture.addControl(logo);

    // Fullscreen toggle
    let btn = GUI.Button.CreateImageOnlyButton("FullscreenButton", domainDirectory + "Textures/fullscreen_icon_01.png");
    btn.width = "50px";
    btn.height = "50px";
    let imgPadding = 5;

    btn.image.paddingBottomInPixels = imgPadding;
    btn.image.paddingTopInPixels = imgPadding;
    btn.image.paddingLeftInPixels = imgPadding;
    btn.image.paddingRightInPixels = imgPadding;
    
    btn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    btn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    btn.color = "transparent";
    btn.background = "transparent";
    btn.onPointerDownObservable.add(() => {
        top.toggleFullscreen(!top.isFullscreen);
        top.setPointer(false); // Fixes bug: cursor stays pointer after click
    });
    btn.onPointerEnterObservable.add(() => {
        top.setPointer(true);
    });
    btn.onPointerOutObservable.add(() => {
        top.setPointer(false);
    });
    advancedTexture.addControl(btn);

    // Camera orientation helper display
    if(showCameraAlphaIndicator_debug) {
        let tbDegrees = new GUI.TextBlock("tbCamDegreesText", "0 degrees");
        tbDegrees.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        tbDegrees.topInPixels = 10;
        tbDegrees.color = "#00ff00";
        advancedTexture.addControl(tbDegrees);
        let getRadianNormalized = (rad) => {
            rad = (rad % 6.0);
            rad += rad < 0 ? 6 : 0;
            rad = Math.round(rad * 1000) / 1000;
            return rad;
        }
        window.setInterval(function() {
            let rad_alpha = getRadianNormalized(top.camera.alpha);
            let degrees_alpha = Math.round(rad_alpha * 180 / Math.PI) % 360;
            tbDegrees.text = `Alpha: ${degrees_alpha} degrees (${rad_alpha} radian)`;

            let rad_beta = getRadianNormalized(top.camera.beta);
            let degrees_beta = Math.round(rad_beta * 180 / Math.PI) % 360;
            tbDegrees.text += `\nBeta: ${degrees_beta} degrees (${rad_beta} radian)`;
            
        }, 100);
    }

    // Debugging rect
    /*
    var debugRect = new GUI.Rectangle("_debugRect");
    advancedTexture.addControl(debugRect);
    debugRect.width = 1;
    debugRect.height = 1;
    debugRect.background = "#DDDDDD";
    debugRect.isPointerBlocker = true;
    var debugText = new GUI.TextBlock("testText", "This is text");
    debugRect.addControl(debugText);
    debugText.fontSizeInPixels = 10;
    debugText.color = "black";
    */
}

// Creates info panel
function initializeInfoPanel(localizedStrings) {
    let {adinfoPanel, tbTitle, tbDesc, image, btnLink} = createContentPanelFullScreen(scene, localizedStrings);
    top.infoPanel = {holder: adinfoPanel, tbTitle, tbDesc, image, btnLink};
}
 
// DOM setup
initializeDOM(domainDirectory, showDevelopmentTools);

function toggleFullscreen(enterFullscreen) {
    top.isFullscreen = enterFullscreen;
    if(enterFullscreen) {
        top.engine.enterFullscreen(false);
    } else {
        top.engine.exitFullscreen();
    }
}

function onEnvironmentChanged() {
    let env = top.environments[top.currentEnvironmentIndex];

    if(showDevelopmentTools) {
        let divName = document.getElementById('exp_envName');
        let divUrl = document.getElementById('exp_envUrl');
        let divHotspots = document.getElementById('exp_hotspotCount');
        let divTags = document.getElementById('exp_tagCount');
        divName.innerHTML = env.name;
        divUrl.innerHTML = env.uri;
        divHotspots.innerHTML = env.hotspots.length;
        divTags.innerHTML = env.tags.length; 
    }
}

function initializeEnvironments(defaultEnvironmentsJsonUri, onLoadCallback) {
    let reader = new FileReader();
    reader.onload = function(){
        try {
            let importedEnvironments = JSON.parse(reader.result);
            //console.log("Imported: ", importedEnvironments);
            setupSceneEnvironments(importedEnvironments);
            onLoadCallback && onLoadCallback();
        } catch(ex) {
            //console.log("Invalid json file structure when loading environments. Please check contents.");
            console.log("Import environments failed: ", ex);
        }
    };

    console.log("Fetching: "+ defaultEnvironmentsJsonUri);
    fetch(defaultEnvironmentsJsonUri)
        .then(res => res.blob())
        .then(blob => {
            reader.readAsText(blob);
        }).catch((reason) => {console.log("Error loading environments. Please check that environmentDefinitions.json is in Resources folder and you have permissions", reason)});
}

function initializeAppSettings(appSettingsJsonUri, onLoadCallback) {
    let reader = new FileReader();
    reader.onload = function() {
        try {
            let importedSettings = JSON.parse(reader.result);
            //console.log("Imported strings: ", importedStrings);
            top.appSettings = importedSettings;
            onLoadCallback && onLoadCallback();
        } catch(ex) {
            console.log("Invalid json file structure when loading localized strings. Please check contents.");
            console.log("Localization initialization failed: ", ex);
        }
    }

    console.log("Fetching settings: " + appSettingsJsonUri);
    fetch(appSettingsJsonUri)
        .then(res => res.blob())
        .then(blob => {
            reader.readAsText(blob);
        }).catch((reason) => {console.log("Error loading app settings: ", reason)});
}

function initializeLocalization(localizedStringsJsonUri, onLoadCallback) {
    let reader = new FileReader();
    reader.onload = function() {
        try {
            let importedStrings = JSON.parse(reader.result);
            top.localizedStrings = importedStrings;
            onLoadCallback && onLoadCallback();
        } catch(ex) {
            console.log("Invalid json file structure when loading localized strings. Please check contents.");
            console.log("Localization initialization failed: ", ex);
        }
    }

    console.log("Fetching localization: " + localizedStringsJsonUri);
    fetch(localizedStringsJsonUri)
        .then(res => res.blob())
        .then(blob => {
            reader.readAsText(blob);
        }).catch((reason) => {console.log("Error loading strings: ", reason)});
}

// 
// Exports
// 

export function setupSceneEnvironments(envDefinitions) {
    top.photoDome.texture.dispose();
    top.videoDome.texture.dispose();
    // Dispose of environment elements 
    for(let i = 0; i < top.environments.length; i++) {
        top.environments[i].dispose();
    }

    // Sort by orderNum
    envDefinitions.sort((f,s) => f.orderNum - s.orderNum);

    // Generate environments from definitions
    top.environments = getEnvironments(envDefinitions);
    top.loadedEnvironmentDefinitions = envDefinitions;

    populateDestinationSelect();
    populateDestinationList();
}

export function reinitializeLoadedEnvironmentDefinitions() {
    // Reset camera, so billboards face correctly
    let {alpha, beta} = top.camera;
    top.camera.resetToDefault();

    setupSceneEnvironments(top.loadedEnvironmentDefinitions);

    // Restore camera position
    top.camera.alpha = alpha;
    top.camera.beta = beta;
}

export function showInfoPanel(title, description, imageUrl, linkUrl) {
    var panel = top.infoPanel;
    panel.tbTitle.text = title;
    panel.tbDesc.text = description;
    panel.image.source = imageUrl;
    panel.btnLink.url = linkUrl;
    panel.btnLink.isVisible = linkUrl;

    panel.holder.show();
}

export function showEnvironment(indexToShow, offsetCameraDegrees) {
    var overlay = document.getElementById("canvasOverlay");
    if(overlay) overlay.style.display = "none";

    if(top.environments.length == 0) {
        console.log("Environments array empty. Can't show environment with index " + indexToShow);
        return;
    }

    // Handle locked environment
    let isLocked = top.environments[indexToShow].isLocked;
    if(isLocked && !top.isAuthorized) {
        top.toggleFullscreen(false); // Exit fullscreen. Necessary to display login form
        var registrationOverlay = document.getElementById("registrationOverlay");
        registrationOverlay.style.display = "flex"; // Shows html form
        registrationOverlay.environmentIndex = indexToShow;

        var inputPassword = document.getElementById("input_password");
        inputPassword.focus();
        inputPassword.onblur = () => {
            // hack... loses focus for some reason. Repeat focus once.
            inputPassword.focus();
            inputPassword.onblur = null;
        }
        return;
    }

    // Hide info panel
    top.infoPanel.holder.hide();

    // Cleanup current environment
    // Hide current hotspots and tags
    top.environments[top.currentEnvironmentIndex].hotspots.forEach(m => {
        m.guiElement.isVisible = false;
        m.meshMarker.setEnabled(false);
    });
    top.environments[top.currentEnvironmentIndex].tags.forEach(t => t.guiElement.isVisible = false);

    // Dispose of current video/photo texture
    let isCurrentVideo = top.environments[top.currentEnvironmentIndex].isVideo; 
    if(isCurrentVideo) 
        top.videoDome.texture.dispose();
    else
        top.photoDome.texture.dispose();

    top.currentEnvironmentIndex = indexToShow;

    let environmentToShow = top.environments[indexToShow];
    //console.log(environmentToShow);
    if(environmentToShow.isVideo) {
        top.videoDome.texture = new BABYLON.VideoTexture(environmentToShow.name + "_video", environmentToShow.uri, scene, false, true);//, 3, { autoPlay: true, muted: true }); top.environments[indexToShow].texture;
        top.videoDome.texture.video.play();
    } else {
        top.photoDome.photoTexture = new BABYLON.Texture(environmentToShow.uri, scene);
    }

    top.toggleVideoDome(environmentToShow.isVideo);

    // Show new hotspots and tags
    top.environments[indexToShow].hotspots.forEach(m => {
        m.guiElement.isVisible = true;
        m.meshMarker.setEnabled(true);
    });
    top.environments[indexToShow].tags.forEach(t => t.guiElement.isVisible = true);

    // Set camera orientation
    if(resetCameraOnNavigation)
        top.camera.resetToDefault();

    if(useDestinationCameraOffsetOnNavigation && offsetCameraDegrees)
        top.camera.setAlphaRotation(offsetCameraDegrees);

    top.onEnvironmentChanged();
}

export function populateDestinationSelect() {
    var selectEnv = document.getElementById('selectDestinationEnvironment');
    selectEnv.innerHTML = "";
    for(let i = 0; i < top.environments.length; i++) {
        let env = top.environments[i];
        var opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = env.name;
        selectEnv.appendChild(opt);
    }
}

export function populateDestinationList() {
    var envList = document.getElementById('envList');
    envList.innerHTML = "";
    for(let i = 0; i < top.environments.length; i++) {
        let env = top.environments[i];
        var item = document.createElement("a");
        item.href = "#";
        item.className = "list-group-item list-group-item-action";
        item.onclick = (ev) => { showEnvironment(i)}
        let lockedIndicator = !top.isAuthorized ? "<b class='lockedItem'>(locked)</b> " : "<b class='unlockedItem'>(unlocked)</b> "
        item.innerHTML = env.orderNum + ". " + (env.isLocked ? lockedIndicator : '') + env.name;
        envList.appendChild(item);
    }
}