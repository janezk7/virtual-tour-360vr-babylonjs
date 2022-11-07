'use strict';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { getTagName } from '../Constants/nameConstants';
import { showInfoPanel } from '../main';
import { createIconGraphic, createTextGraphic } from '../Utilities/engineUtil';

export function toggleTagPlacingMode(isLeft) {
    top.tagManager.isPlacingMode = !top.tagManager.isPlacingMode;
    top.tagManager.isLeft = isLeft === true;

    let identifier = isLeft === true ? "Left" : "Right";
    let identifierOther = isLeft === true ? "Right" : "Left";
    let btn = document.getElementById("btnToggleTag" + identifier);
    let btnOther = document.getElementById("btnToggleTag" + identifierOther);

    if(top.tagManager.isPlacingMode) {
        btn.innerHTML = "Tap on scene to place or cancel";
        btnOther.style.visibility = "hidden";
    } else {
        btn.innerHTML = `Place tag (${identifier})`;
        btnOther.innerHTML = `Place tag (${identifierOther})`;
        btn.style.visibility = "unset";
        btnOther.style.visibility = "unset";
    }
    top.pickingDomeMesh.isPickable = top.tagManager.isPlacingMode;
}

export function create3dTag(controlName, tagText, titleText, descriptionText, imageUrl, websiteUrl, isLeft) {
    let mesh = BABYLON.MeshBuilder.CreateSphere(controlName, {}); // REFACTOR this into engineUtil as well
    mesh.scaling = new BABYLON.Vector3(30,30,30);
    mesh.visibility = 0;
    mesh.billboardMode = BABYLON.TransformNode.BILLBOARDMODE_Y + BABYLON.TransformNode.BILLBOARDMODE_X;

    let meshBtnUI = new GUI.MeshButton3D(mesh, "meshbtn_" + controlName);
    top.gui3d.addControl(meshBtnUI);
    meshBtnUI.onPointerDownObservable.add((evData, eventState) => {
        if(top.is3dElementInteractionDisabled()) return;
        showInfoPanel(titleText, descriptionText, imageUrl, websiteUrl);
        top.setPointer(false); // Fixes bug: cursor stays pointer after click
    });
    
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
    meshBtnUI.onPointerEnterObservable.add(() => {
        if(top.is3dElementInteractionDisabled()) return;
        top.setPointer(true);
    });
    meshBtnUI.onPointerOutObservable.add(() => {
        if(top.is3dElementInteractionDisabled()) return;
        top.setPointer(false);
    });

    // BROKEN. DOESN'T WORK
    /*
    var graphicElement = create3dElementGraphic(true, true, controlName, tagText);
    mesh.addChild(graphicElement);
    graphicElement.position = new BABYLON.Vector3.Zero();

    return {mesh: mesh, uiElement: meshBtnUI};
    */
    
    // Create icon (simple)
    const imgGraphic = createIconGraphic(true, isLeft);
    mesh.addChild(imgGraphic)
    imgGraphic.position = new BABYLON.Vector3((isLeft ? -1 : 1) *1,0.12,0);

    // Create icon (full)
    const imgGraphicHover = createIconGraphic(true, isLeft, true);
    mesh.addChild(imgGraphicHover)
    imgGraphicHover.position = imgGraphic.position;
    imgGraphicHover.visibility = 0;

    // Create text
    const textGraphic = createTextGraphic(tagText, controlName, isLeft, 125);
    mesh.addChild(textGraphic);
    textGraphic.visibility = 0; // Don't show text for tags. Bad visibility on mobile
    textGraphic.position = new BABYLON.Vector3((isLeft ? -1 : 1) *1.7,-0.55,0);

    // Hover events (pc-only)
    meshBtnUI.onPointerEnterObservable.add((evData, eventState) => {
        if(top.is3dElementInteractionDisabled()) return;
        textGraphic.visibility = 1.0;
        imgGraphicHover.visibility = 1.0;
    });

    meshBtnUI.onPointerOutObservable.add((evData, eventState) => {
        textGraphic.visibility = 0.0;
        imgGraphicHover.visibility = 0.0;
    });

    // BG Plane. For debugging text
    /*
    const textPlaneBg = BABYLON.MeshBuilder.CreatePlane("bg", {width: 65, height: 65});
    textPlaneBg.isPickable = false;
    mesh.addChild(textPlaneBg);
    textPlaneBg.position = new BABYLON.Vector3((isLeft ? -1 : 1) *1.7,-0.55,0);
    */

    // Create placeholder plane
    /*
    const plane = BABYLON.MeshBuilder.CreatePlane("infoPlanePlaceholder", {width: 100, height: 160});
    plane.isPickable = false;
    mesh.addChild(plane);
    plane.position = new BABYLON.Vector3((isLeft ? -1 : 1) * 1.7, 1, -0.1);
    */

    // Downscale tag;
    let scale = 20.0;
    mesh.scaling = new BABYLON.Vector3(scale,scale,scale);

    return {mesh: mesh, uiElement: meshBtnUI};
}

export function tagManagerCastRayHandler() {
    let scene = top.scene;
    let ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), top.camera);
    let hit = scene.pickWithRay(ray);
    if(hit.pickedMesh) {
        // Reset camera, so billboard faces correctly
        const {alpha, beta} = top.camera;
        top.camera.resetToInitial();

        //console.log(hit.pickedMesh.name);
        let currentEnvironment = top.environments[top.currentEnvironmentIndex];
        let tagBaseName = getTagName(currentEnvironment.name, currentEnvironment.tags.length);

        let tagText = document.getElementById('inputTagName').value;
        let titleText = document.getElementById('inputTagTitle').value;
        let descriptionText = document.getElementById('inputTagDescription').value;
        let imageUrl = document.getElementById('inputTagImageUrl').value;
        let websiteUrl = document.getElementById('inputWebsiteUrl').value;
        let isLeft = top.tagManager.isLeft;
        // Define marker
        let marker = new BABYLON.Mesh("mesh_" + tagBaseName, scene);
        marker.position = hit.pickedPoint;

        var tagObj = create3dTag(tagBaseName, tagText, titleText, descriptionText, imageUrl, websiteUrl, isLeft);
        marker.addChild(tagObj.mesh);
        tagObj.mesh.position = new BABYLON.Vector3.Zero();

        let tagObject = {
            displayText: tagText,
            title: titleText,
            description: descriptionText,
            imageUrl: imageUrl,
            websiteUrl: websiteUrl,
            isLeft: isLeft,
            meshMarker: marker, 
            guiElement: tagObj.uiElement 
        };

        currentEnvironment.tags.push(tagObject);
        toggleTagPlacingMode();

        // Restore camera position
        top.camera.alpha = alpha;
        top.camera.beta = beta;
    }
}