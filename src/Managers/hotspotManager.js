'use strict';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { getHotspotName } from '../Constants/nameConstants';
import { createIconGraphic, createStepIconGraphic, createTextGraphic } from '../Utilities/engineUtil';
import { degrees_to_radians } from '../Utilities/jsUtil';

export function toggleHotspotPlacingMode(isLeft) {
    top.hotspotManager.isPlacingMode = !top.hotspotManager.isPlacingMode;
    top.hotspotManager.isLeft = isLeft === true;

    let identifier = isLeft === true ? "Left" : "Right";
    let identifierOther = isLeft === true ? "Right" : "Left";
    let btn = document.getElementById("btnToggleHotspot" + identifier);
    let btnOther = document.getElementById("btnToggleHotspot" + identifierOther);

    if(top.hotspotManager.isPlacingMode) {
        btn.innerHTML = "Tap on scene to place or cancel";
        btnOther.style.visibility = "hidden";
    } else {
        btn.innerHTML = `Place tag (${identifier})`;
        btnOther.innerHTML = `Place tag (${identifierOther})`;
        btn.style.visibility = "unset";
        btnOther.style.visibility = "unset";
    }
    top.pickingDomeMesh.isPickable = top.hotspotManager.isPlacingMode;
}

export function create3dHotspot(controlName, hotspotText, isLocked, destinationIndex, isStepType, isLeft, cameraOffsetDegrees) {
    let mesh = BABYLON.MeshBuilder.CreateSphere("sphere_" + controlName, {});
    mesh.scaling = new BABYLON.Vector3(30,30,30);
    mesh.visibility = 0;
    mesh.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_Y + BABYLON.TransformNode.BILLBOARDMODE_X;

    // Only billboard on Y for step type
    if(isStepType)
        mesh.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_Y;
    
    let meshBtnUI = new GUI.MeshButton3D(mesh, "meshbtn_" + controlName);
    meshBtnUI.destinationNavigationData = {destinationIndex, cameraOffsetDegrees};
    meshBtnUI.onPointerDownObservable.add((evData, eventState) => {
        if(top.is3dElementInteractionDisabled()) return;

        let data = eventState.currentTarget.destinationNavigationData;
        top.showEnvironment(data.destinationIndex, data.cameraOffsetDegrees);
        top.setPointer(false); // Fixes bug: cursor stays pointer after click on locked environment
    });
    meshBtnUI.onPointerEnterObservable.add(() => {
        if(top.is3dElementInteractionDisabled()) return;
        top.setPointer(true);
    });
    meshBtnUI.onPointerOutObservable.add(() => {
        if(top.is3dElementInteractionDisabled()) return;
        top.setPointer(false);
    });
    top.gui3d.addControl(meshBtnUI);

    // Block hover animations when blocked by info panel 
    let enterAnimation = meshBtnUI.pointerEnterAnimation.bind({});
    let outAnimation = meshBtnUI.pointerOutAnimation.bind({});
    let downAnimation = meshBtnUI.pointerDownAnimation.bind({});
    let upAnimation = meshBtnUI.pointerUpAnimation.bind({});
    meshBtnUI.pointerEnterAnimation = () => {
        if(top.is3dElementInteractionDisabled()) return;
        enterAnimation();
    };
    meshBtnUI.pointerOutAnimation = () => { 
        if(top.is3dElementInteractionDisabled()) return;
        outAnimation();
    }
    meshBtnUI.pointerDownAnimation = () => {
        if(top.is3dElementInteractionDisabled()) return;
        downAnimation();
    }
    meshBtnUI.pointerUpAnimation = () => {
        if(top.is3dElementInteractionDisabled()) return;
        upAnimation();
    }

    // Add graphics to mesh
    if(isStepType) 
        addStepHotspotGraphicToMesh(mesh, controlName, hotspotText, isLeft, isLocked);
    else 
        addHotspotGraphicToMesh(mesh, controlName, hotspotText, isLeft, isLocked);
    
    return {mesh: mesh,  uiElement: meshBtnUI};
}

function addHotspotGraphicToMesh(mesh, identifier, text, isLeft, isLocked) {
    // Create icon
    const imgGraphic = createIconGraphic(false, isLeft);
    mesh.addChild(imgGraphic, true);
    imgGraphic.position = new BABYLON.Vector3((isLeft ? -1 : 1) *1.32,0.16,0);
    imgGraphic.scaling.x = 0.15 * 2.516;
    imgGraphic.scaling.y = 0.15; 

    // Create text
    const textGraphic = createTextGraphic(text, identifier, isLeft);
    mesh.addChild(textGraphic);
    textGraphic.position = new BABYLON.Vector3((isLeft ? -1 : 1) * 1.93,-0.43,0);

    var meshLocked;
    if(isLocked) {
        meshLocked = BABYLON.MeshBuilder.CreatePlane("lockedIcon", {width: 10, height: 10});
        meshLocked.material = top.materials.lockedMat;
        meshLocked.isPickable = false;
        mesh.addChild(meshLocked);
        meshLocked.position = new BABYLON.Vector3((isLeft ? -1 : 1)*2.9, 1, 0);
    }
}

function addStepHotspotGraphicToMesh(mesh, identifier, text, isLeft, isLocked) {
    const imgGraphic = createStepIconGraphic();
    mesh.addChild(imgGraphic, true);
    imgGraphic.scalingDeterminant = 3;
    imgGraphic.rotation = new BABYLON.Vector3(degrees_to_radians(60), 0, 0);

    // Create text
    const textGraphic = createTextGraphic(text, identifier, isLeft);
    mesh.addChild(textGraphic);
    textGraphic.position = new BABYLON.Vector3((isLeft ? -1 : 1) * 1.93,-0.43,0);
    textGraphic.rotation = new BABYLON.Vector3(degrees_to_radians(15), 0, 0);

    var meshLocked;
    if(isLocked) {
        meshLocked = BABYLON.MeshBuilder.CreatePlane("lockedIcon", {width: 10, height: 10});
        meshLocked.material = top.materials.lockedMat;
        meshLocked.isPickable = false;
        mesh.addChild(meshLocked);
        meshLocked.position = new BABYLON.Vector3(1.5, 1, 0);
    }
}

export function hotspotManagerCastRayHandler() {
    let scene = top.scene;
    let ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), top.camera);
    let hit = scene.pickWithRay(ray);
    if(hit.pickedMesh) {
        // Reset camera, so billboard faces correctly
        const {alpha, beta} = top.camera;
        top.camera.resetToDefault();

        let currentEnvironment = top.environments[top.currentEnvironmentIndex];
        let hotspotBaseName = getHotspotName(currentEnvironment.name, currentEnvironment.hotspots.length);

        let isStepHotspot = document.getElementById("cbIsStepHotspot").checked;
        let hotspotText = document.getElementById('inputHotspotName').value;
        let destSelect = document.getElementById('selectDestinationEnvironment'); 
        let cameraOffsetDegrees = document.getElementById("inputCameraOffsetDegrees").value;
        let hotspotDest = destSelect.options[destSelect.selectedIndex].text;
        let destinationIndex = top.environments.getIndexByName(hotspotDest);
        if(destinationIndex == null) {
            console.log("No destination environment found by name: " + hotspotDest);
            return;
        }

        let isLeft = top.hotspotManager.isLeft;
        let isDestinationLocked = top.environments[destinationIndex].isLocked;

        // Define hotspot
        let marker = new BABYLON.Mesh("mesh_" + hotspotBaseName, scene);
        marker.position = hit.pickedPoint;
        var hotspotObj = create3dHotspot(hotspotBaseName, hotspotText, isDestinationLocked, destinationIndex, isStepHotspot, isLeft, cameraOffsetDegrees);
        marker.addChild(hotspotObj.mesh);
        hotspotObj.mesh.position = new BABYLON.Vector3.Zero();

        let hotspotObject = {
            displayText: hotspotText,
            isStepType: isStepHotspot,
            isLeft: isLeft,
            dest: hotspotDest,
            cameraOffsetDegrees: cameraOffsetDegrees,
            meshMarker: marker, 
            guiElement: hotspotObj.uiElement 
        };

        currentEnvironment.hotspots.push(hotspotObject);
        toggleHotspotPlacingMode();

        // Restore camera position
        top.camera.alpha = alpha;
        top.camera.beta = beta;
    }
}
