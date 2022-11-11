import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export function showAxis(scene, size) {
    var makeTextPlane = function(text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
  
    var axisX = BABYLON.Mesh.CreateLines("axisX", [ 
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);

    var axisSphere = BABYLON.CreateSphere("AxisSphere", {}, scene);
    axisSphere.visibility = 0.0;
    axisSphere.addChild(xChar);
    axisSphere.addChild(yChar);
    axisSphere.addChild(zChar);
    axisSphere.addChild(axisX);
    axisSphere.addChild(axisY);
    axisSphere.addChild(axisZ);

    axisSphere.scalingDeterminant = 0.5;

    return axisSphere;
};

export function createIconGraphic(isTag, isLeftPosition, isHover) {
    const imgPlane = BABYLON.MeshBuilder.CreatePlane("icon", {width: 10, height: 10});
    const isRightPosition = !(isLeftPosition === true);
    if(isTag && isRightPosition)
        imgPlane.material = isHover ? top.materials.tagMat1_hover : top.materials.tagMat1;
    else if (isTag && !isRightPosition)
        imgPlane.material = isHover ? top.materials.tagMat2_hover : top.materials.tagMat2;

    else if (!isTag && isRightPosition)
        imgPlane.material = top.materials.hotspotMat1;
    else if (!isTag && !isRightPosition)
        imgPlane.material = top.materials.hotspotMat2;

    imgPlane.isPickable = false;

    return imgPlane;
}

export function createStepIconGraphic() {
    const imgPlane = BABYLON.MeshBuilder.CreatePlane("stepIcon", {width: 10, height: 10});
    imgPlane.material = top.materials.hotspotMatStep;
    imgPlane.isPickable = false;
    return imgPlane;
}

export function createTextGraphic(text, controlIdentifier, isLeftPosition, fontSize) {
    const planeOptions = {width: 65, height: 65};
    const textPlane = BABYLON.MeshBuilder.CreatePlane("textBlockPlane", planeOptions);
    textPlane.isPickable = false;

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(textPlane);
    advancedTexture.name = "at_" + controlIdentifier;

    var textBlock = new  GUI.TextBlock("textBlock", text);
    advancedTexture.addControl(textBlock);
    textBlock.color = "white";
    textBlock.fontSizeInPixels = fontSize || 130;
    textBlock.lineSpacing = -15;
    textBlock.textHorizontalAlignment = isLeftPosition === true ? GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT : GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.textWrapping = GUI.TextWrapping.WordWrap;
    textBlock.fontWeight = "bold";
    textBlock.shadowOffsetX = 3;
    textBlock.shadowOffsetY = 12;

    return textPlane;
}

export function createContentPanelFullScreen(scene, localizedStrings) {
    // Info panel GUI texture
    const adinfoPanel = GUI.AdvancedDynamicTexture.CreateFullscreenUI("_at_infoPanel");//, true, scene, BABYLON.Texture.BILINEAR_SAMPLINGMODE);

    // Common constants
    let titleFontSize = 16;
    let descFontSize = 14;
    let padding = 10;
    let textColor = top.appSettings.fontColor; // "black";
    let defaultColor = top.appSettings.primaryColor; // "#6400c1";
    let fontFamily = top.appSettings.fontFamily;
    let controlWidthPrc = 0.9;
    let horAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    let verAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    let closeButtonSize = 40;

    // Create sub panel (non stacking)
    var rectRoot = new GUI.Rectangle("RootRect");
    adinfoPanel.addControl(rectRoot);
    rectRoot.isPointerBlocker = true;
    rectRoot.height = 1.0;
    rectRoot.width = 1.0;
    rectRoot.background = "transparent";
    rectRoot.color ="transparent";
    rectRoot.onPointerEnterObservable.add(() => {
        top.isBlocking3dElements = true;
    });
    rectRoot.onPointerOutObservable.add(() => {
        top.isBlocking3dElements = false;
    });

    // Create background 
    var rectBackground = new GUI.Rectangle("backgroundRect");
    rectRoot.addControl(rectBackground);
    rectBackground.isPointerBlocker = true;
    rectBackground.background = top.appSettings.secondaryColor;
    rectBackground.color = "transparent";
    rectBackground.alpha = 1; // 0.85;
    
    // Create stacking panel
    var rect = new GUI.StackPanel("StackRect");
    rectRoot.addControl(rect);
    rect.isPointerBlocker = true;
    rect.background = "transparent";
    rect.height = 1.0;
    rect.width = 1.0;

    // Close button
    var btnClose = GUI.Button.CreateSimpleButton("closeButton", "X");
    rectRoot.addControl(btnClose);
    btnClose.widthInPixels = closeButtonSize;
    btnClose.heightInPixels = closeButtonSize;
    btnClose.background = "transparent";
    btnClose.cornerRadius = 45;
    btnClose.color = "transparent";
    btnClose.fontWeight = "bold";
    btnClose.fontFamily = "'Calibri'";
    //btnClose.topInPixels = 25;
    //btnClose.left = -25;
    btnClose.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    btnClose.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    btnClose.onPointerDownObservable.add(() => {
        adinfoPanel.hide();
        top.isBlocking3dElements = false;
    });
    btnClose.onPointerEnterObservable.add(() => {
        tbCloseText.color = "#333333";
        //btnClose.background = "white";
        top.setPointer(true);
    });
    btnClose.onPointerOutObservable.add(() => {
        tbCloseText.color = "black";
        //btnClose.background = defaultColor;
        top.setPointer(false);
    });
    
    var btnEllipse = new GUI.Ellipse();
    btnEllipse.widthInPixels = closeButtonSize * 0.9;
    btnEllipse.heightInPixels = closeButtonSize * 0.9;
    btnEllipse.background = "white";
    btnClose.addControl(btnEllipse);
    var tbCloseText = new GUI.TextBlock("closeButtonText", "x");
    btnClose.addControl(tbCloseText);
    tbCloseText.color = "black";
    tbCloseText.fontSizeInPixels = 20;
    tbCloseText.paddingLeftInPixels = 2;
    tbCloseText.paddingBottomInPixels = 2;

    // Info.Image
    var imageRect = new GUI.Rectangle("imageRect");
    rect.addControl(imageRect);
    imageRect.widthInPixels = 125;
    imageRect.heightInPixels = 125;
    imageRect.color = "transparent";
    imageRect.background = "transparent";
    imageRect.paddingTopInPixels = 10;
    imageRect.paddingBottomInPixels = -10;
    imageRect.paddingLeftInPixels = 0;
    var image = new GUI.Image("infoImg", "./Resources/sample-image.png");
    imageRect.addControl(image);
    image.color = "transparent";
    image.background = "transparent";
    image.paddingLeftInPixels = -1;
    image.paddingRightInPixels = -2;
    image.paddingTopInPixels = -1;
    image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    image.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    image.stretch = GUI.Image.STRETCH_UNIFORM;
    //image.stretch = GUI.Image.STRETCH_FILL;

    // Info.Title
    var tbTitle = new GUI.TextBlock("infoTitle", "Ostale aplikacije (avtomobilska industrija)");
    rect.addControl(tbTitle);
    tbTitle.color = defaultColor;
    tbTitle.fontSizeInPixels = titleFontSize;
    tbTitle.width = controlWidthPrc; // potrait only
    tbTitle.height = "35px";
    tbTitle.leftInPixels = 2;
    tbTitle.paddingTopInPixels = padding;
    tbTitle.paddingRightInPixels = -15;
    //tbTitle.top = 20;
    tbTitle.verticalAlignment = verAlignment;
    tbTitle.textHorizontalAlignment = horAlignment;
    tbTitle.textVerticalAlignment = verAlignment;
    tbTitle.fontFamily = fontFamily;
    tbTitle.fontWeight = "bold";
    tbTitle.textWrapping = GUI.TextWrapping.Ellipsis;

    // Info.Description
    var descriptionRect = new GUI.Rectangle("descriptionRect");
    rect.addControl(descriptionRect);
    descriptionRect.width = controlWidthPrc;
    descriptionRect.heightInPixels = 240;
    descriptionRect.paddingTopInPixels = 0;
    descriptionRect.paddingRightInPixels = -5;
    descriptionRect.verticalAlignment = verAlignment;
    descriptionRect.color = "transparent";
    descriptionRect.background = "transparent";

    var tsv = new GUI.ScrollViewer("descriptionScrollViewer");
    descriptionRect.addControl(tsv);
    tsv.textHorizontalAlignment = horAlignment;
    tsv.textVerticalAlignment = verAlignment;
    tsv.barSize = 20;
    tsv.thumbLength = 0.7;
    tsv.barColor = defaultColor;
    tsv.color = "transparent";
    tsv.verticalBar.value = 0.0;
    tsv.verticalBar.onPointerEnterObservable.add(() => {
        top.setPointer(true);
    });
    tsv.verticalBar.onPointerOutObservable.add(() => {
        top.setPointer(false);
    });

    var touchAreaRect = new GUI.Rectangle("touchAreaRect");
    descriptionRect.addControl(touchAreaRect);
    touchAreaRect.color = "transparent";
    touchAreaRect.background = "transparent";
    touchAreaRect.alpha = 0.5;
    touchAreaRect.paddingRightInPixels = 20;

    // Custom touch scrolling implementation
    var deltaY = -1;
    var startY = 0;
    var scrollPosY = 0.5;
    var startScrollPosY = 0.0;
    var isTouching = false;
    touchAreaRect.onPointerDownObservable.add((ed) => {
        startScrollPosY = tsv.verticalBar.value;
        deltaY = 0;
        startY = ed.y;
        isTouching = true;
    });
    touchAreaRect.onPointerUpObservable.add(() => {
        isTouching = false;
    });
    touchAreaRect.onPointerMoveObservable.add((ed) => {
        if(!isTouching) 
            return;
        // Get delta from start pos
        deltaY = startY - ed.y;
        // Get mapped scroll Y position
        scrollPosY = deltaY * 0.5 / 100;
        scrollPosY *= 2.5; // Multiplier
        let scrollYValue = startScrollPosY + scrollPosY;
        // Bound correction
        if(scrollYValue < 0)
            scrollYValue = 0;
        else if(scrollYValue > 1.0)
            scrollYValue = 1.0;

        tsv.verticalBar.value = scrollYValue;
    });

    var tbDesc = new GUI.TextBlock("infoDescription", "Lorem ipsum dolor sit amet, \nconsectetur adipiscing elit. Sed aliquam elementum ligula non laoreet. Proin urna tortor, aliquet consequat rutrum id, volutpat eget felis. Proin molestie tellus non neque vestibulum laoreet sit amet vel lorem. Morbi faucibus ut risus quis venenatis. Aliquam quis tempor odio,");
    tsv.addControl(tbDesc);
    tbDesc.color = textColor;
    tbDesc.fontSizeInPixels = descFontSize;
    tbDesc.width = 1.0;
    tbDesc.height = 1.0;
    tbDesc.resizeToFit = true;
    //tbDesc.paddingTopInPixels = padding;
    //tbDesc.verticalAlignment = verAlignment;
    tbDesc.textHorizontalAlignment = horAlignment;
    tbDesc.textVerticalAlignment = verAlignment;
    tbDesc.textWrapping = GUI.TextWrapping.WordWrap;
    tbDesc.fontFamily = fontFamily;

    // Info.Link
    var btnLink = GUI.Button.CreateSimpleButton("linkButton", "");
    rectRoot.addControl(btnLink);
    btnLink.widthInPixels = 125;
    btnLink.heightInPixels = 25;
    btnLink.background = defaultColor;
    btnLink.color = "transparent";
    btnLink.fontSizeInPixels = 15;
    //btnLink.fontWeight = "bold";
    btnLink.fontFamily = fontFamily;
    btnLink.topInPixels = -10;
    btnLink.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    btnLink.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    btnLink.url = "https://www.google.com";
    // Info.Link.Text
    var tbLinkText = new GUI.TextBlock("linkButtonText", (localizedStrings && localizedStrings.moreInfo) || "MORE INFO");
    btnLink.addControl(tbLinkText);
    tbLinkText.color = "white";
    tbLinkText.topInPixels = 1;
    btnLink.onPointerDownObservable.add(() => {
        top.toggleFullscreen(false); // Fixes bug: If navigating to link in fullscreen, after returning to app, can't interact with 3d elements
        window.open(btnLink.url, '_blank').focus();
    });
    btnLink.onPointerEnterObservable.add(() => {
        tbLinkText.color = defaultColor;
        btnLink.background = "white";
        btnLink.color = defaultColor;
        top.setPointer(true);
    });
    btnLink.onPointerOutObservable.add(() => {
        tbLinkText.color = "white";
        btnLink.background = defaultColor;
        btnLink.color = "transparent";
        top.setPointer(false);
    });

    // Setup resizing and listeners
    var resize = (width, height) => {
        let isLandscape = window.matchMedia("(orientation: landscape)").matches;

        // Setup landscape layout
        if(isLandscape && height <= 400) {
            rectRoot.height = 0.9;
            rectRoot.widthInPixels = 480;

            rect.isVertical = false;
            imageRect.paddingLeftInPixels = 5;
            imageRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            imageRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

            tbTitle.topInPixels = 0;
            tbTitle.paddingTopInPixels = 12;
            tbTitle.paddingLeftInPixels = 12;

            descriptionRect.widthInPixels = 450 - 125; // full width - image;
            descriptionRect.heightInPixels = (0.9 * height) - 30; // full height - title - link button
            descriptionRect.topInPixels = 40;
            descriptionRect.paddingLeftInPixels = 10;
            descriptionRect.paddingRightInPixels = 5; // scrollbar breathing room
            descriptionRect.paddingBottomInPixels = 20;

            btnLink.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            btnLink.paddingLeftInPixels = 10;
            return;
        } 

        // Setup portrait layout
        if(width < 400) {
            rectRoot.width = 1.0;
        } else {
            rectRoot.widthInPixels = 350;
        }
        rectRoot.heightInPixels = 400;

        rect.isVertical = true;
        imageRect.paddingLeftInPixels = 0;
        imageRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        imageRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        tbTitle.width = controlWidthPrc;
        tbTitle.leftInPixels = 0;
        tbTitle.topInPixels = 125;
        tbTitle.paddingTopInPixels = 15;
        tbTitle.paddingLeftInPixels = 2;
        tbTitle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        descriptionRect.width = controlWidthPrc;
        descriptionRect.heightInPixels = 200;
        descriptionRect.leftInPixels = 0;
        descriptionRect.topInPixels = 160;
        descriptionRect.paddingLeftInPixels = 0;
        descriptionRect.paddingRightInPixels = -5;
        descriptionRect.paddingBottomInPixels = 0;
        descriptionRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        btnLink.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        btnLink.paddingLeftInPixels = 0;
    }

    // Register helped resize method for responsive panel width
    adinfoPanel.resize = resize;
    
    // Register helper show/hide methods for advancedTexture contents
    adinfoPanel.hide = () => {
        rectRoot.isVisible = false;
        top.isInfoPanelOpen = rectRoot.isVisible; // Used for blocking UI elements on mobile
    }
    adinfoPanel.show = () => {
        rectRoot.isVisible = true;
        top.isInfoPanelOpen = rectRoot.isVisible; // Used for blocking UI elements on mobile
    }

    // Hide panel at init and resize
    adinfoPanel.hide();
    adinfoPanel.resize(top.engine.getRenderWidth(), top.engine.getRenderHeight());

    return {adinfoPanel, tbTitle, tbDesc, image, btnLink};
}

export function createContentPanel(scene, localizedStrings) {
    var infoPlaneHolder = BABYLON.Mesh.CreateSphere("infoPlaneHolder", 16, 2, scene);
    infoPlaneHolder.setEnabled(false);

    // Constants
    /*
    var aspectRatio = top.engine.getAspectRatio(top.camera);
    var d = top.camera.position.length();
    var y = 2 * d * Math.tan(top.camera.fov / 2);
    var x = y * aspectRatio;
    console.log(x, y);
    */
    
    const panelOptions = {width: 140, height: 140};
    const backgroundPanelOptions = {width: 140, height: 140};
    const panelPosition = new BABYLON.Vector3(0,0,190);

    // Info panel
    const infoPlane = BABYLON.MeshBuilder.CreatePlane("infoPlanePlaceholder", panelOptions);
    infoPlaneHolder.addChild(infoPlane);
    infoPlane.position = panelPosition;

    // Info panel GUI texture
    const adinfoPanel = GUI.AdvancedDynamicTexture.CreateForMesh(infoPlane, x, y);
    adinfoPanel.name = "at_infoPanel";
    adinfoPanel.renderScale = 1.5;

    // Trying to make text crisper. Text blurry on mobile when not in fullscreen
    //adinfoPanel.rootContainer.scaleX = window.devicePixelRatio;
    //adinfoPanel.rootContainer.scaleY = window.devicePixelRatio;
    //adinfoPanel.renderScale = 2;

    // Common constants
    let textColor = "black";
    let defaultColor = "#6400c1";
    let fontSizeTitle = 42;
    let fontSize = 26;
    let controlWidthPrc = 0.9;
    let horAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    let verAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    let buttonHeight = 60; // in pixels
    let buttonWidth = 300; // // in pixels
    let fontFamily = "Arial";

    // Info.Title
    var tbTitle = new GUI.TextBlock("infoTitle", "Sample title");
    adinfoPanel.addControl(tbTitle);
    tbTitle.color = defaultColor;
    tbTitle.fontSizeInPixels = fontSizeTitle;
    tbTitle.width = controlWidthPrc;
    tbTitle.top = 50;
    tbTitle.verticalAlignment = verAlignment;
    tbTitle.textHorizontalAlignment = horAlignment;
    tbTitle.textVerticalAlignment = verAlignment;
    tbTitle.fontFamily = fontFamily;
    tbTitle.fontWeight = "bold";

    // Info.Description
    var tbDesc = new GUI.TextBlock("infoDescription", "Lorem ipsum dolor sit amet, \nconsectetur adipiscing elit. Sed aliquam elementum ligula non laoreet. Proin urna tortor, aliquet consequat rutrum id, volutpat eget felis. Proin molestie tellus non neque vestibulum laoreet sit amet vel lorem. Morbi faucibus ut risus quis venenatis. Aliquam quis tempor odio,");
    adinfoPanel.addControl(tbDesc);
    tbDesc.color = textColor;
    tbDesc.fontSizeInPixels = fontSize;
    tbDesc.top = 550;
    tbDesc.width = controlWidthPrc;
    tbDesc.height = 0.38;
    tbDesc.verticalAlignment = verAlignment;
    tbDesc.textHorizontalAlignment = horAlignment;
    tbDesc.textVerticalAlignment = verAlignment;
    tbDesc.textWrapping = GUI.TextWrapping.WordWrap;
    tbDesc.fontFamily = fontFamily;

    // Info.Image
    var image = new GUI.Image("infoImg", "./Resources/sample-image.png");
    adinfoPanel.addControl(image);
    image.top = 140;
    image.width = 0.9;
    image.heightInPixels = 380;
    image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    image.stretch = GUI.Image.STRETCH_UNIFORM;
    //image.stretch = GUI.Image.STRETCH_FILL;

    // TODO: make image on Plane. Without border? 
    /*
    const imgPlane = BABYLON.MeshBuilder.CreatePlane("infoImg2", {width: 10, height: 10});
    infoPlane.addChild(imgPlane);
    imgPlane.position = new BABYLON.Vector3.Zero();
    */ 

    // Info.Link
    var btnLink = GUI.Button.CreateSimpleButton("linkButton", "");
    adinfoPanel.addControl(btnLink);
    btnLink.widthInPixels = buttonWidth;
    btnLink.heightInPixels = buttonHeight;
    btnLink.background = defaultColor;
    btnLink.color = "transparent";
    btnLink.fontSizeInPixels = 26;
    btnLink.fontWeight = "bold";
    btnLink.fontFamily = fontFamily;
    btnLink.topInPixels = -25;
    //btnLink.left = "-20%";
    btnLink.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    btnLink.url = "https://www.google.com";
    // Info.Link.Text
    var tbLinkText = new GUI.TextBlock("linkButtonText", (localizedStrings && localizedStrings.moreInfo) || "MORE INFO");
    btnLink.addControl(tbLinkText);
    tbLinkText.color = "white";
    btnLink.onPointerDownObservable.add(() => {
        window.open(btnLink.url, '_blank').focus();
    });
    btnLink.onPointerEnterObservable.add(() => {
        tbLinkText.color = defaultColor;
        btnLink.background = "white";
    });
    btnLink.onPointerOutObservable.add(() => {
        tbLinkText.color = "white";
        btnLink.background = defaultColor;
    });
    
    // Close button
    var btnClose = GUI.Button.CreateSimpleButton("closeButton", "X");
    adinfoPanel.addControl(btnClose);
    btnClose.widthInPixels = 120;
    btnClose.heightInPixels = 120;
    btnClose.background = "transparent";
    btnClose.color = "transparent";
    btnClose.fontWeight = "bold";
    btnClose.fontFamily = "'Calibri'";
    //btnClose.topInPixels = 25;
    //btnClose.left = -25;
    btnClose.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    btnClose.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    var tbCloseText = new GUI.TextBlock("closeButtonText", "x");
    btnClose.addControl(tbCloseText);
    tbCloseText.color = "black";
    tbCloseText.fontSizeInPixels = 80;
    btnClose.onPointerDownObservable.add(() => {/*console.log("closing info panel");*/ });
    btnClose.onPointerEnterObservable.add(() => {
        tbCloseText.color = "#333333";
        //btnClose.background = "white";
    });
    btnClose.onPointerOutObservable.add(() => {
        tbCloseText.color = "black";
        //btnClose.background = defaultColor;
    });

    /*
    var btnClose = GUI.Button.CreateSimpleButton("closeButton", "CLOSE");
    adinfoPanel.addControl(btnClose);
    btnClose.widthInPixels = buttonWidth;
    btnClose.heightInPixels = buttonHeight;
    btnClose.background = defaultColor;
    btnClose.color = "white";
    btnClose.fontSizeInPixels = 26;
    btnClose.fontWeight = "bold";
    btnClose.fontFamily = fontFamily;
    btnClose.topInPixels = -25;
    btnClose.left = "20%";
    btnClose.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    btnClose.onPointerDownObservable.add(() => {
        alert("closing.");
    });
    btnClose.onPointerEnterObservable.add(() => {
        btnClose.color = defaultColor;
        btnClose.background = "white";
    });
    btnClose.onPointerOutObservable.add(() => {
        btnClose.color = "white";
        btnClose.background = defaultColor;
    });
    */

    // Background panel
    const textPlaneBackground = BABYLON.MeshBuilder.CreatePlane("backgroundPlane", backgroundPanelOptions );
    infoPlaneHolder.addChild(textPlaneBackground);
    textPlaneBackground.isPickable = false;
    textPlaneBackground.position = new BABYLON.Vector3(0,0,191);

    var panelMat = new BABYLON.StandardMaterial("infoPanelMat", scene);
    panelMat.emissiveColor = new BABYLON.Color3(1,1,1);
    textPlaneBackground.visibility = 0.9;

    textPlaneBackground.material = panelMat;

    infoPlaneHolder.rotation.z = 3.14;
    return {infoPlaneHolder, tbTitle, tbDesc, image, btnLink, btnClose};
}
 
// TODO: Unfinished and broken. Meant to unify duplicating code in tag/hotspot generation 
export function create3dElementGraphic(isTag, isRightPosition, controlIdentifier, text) {
    const parentMesh = new BABYLON.TransformNode("parentTransform_"+ controlIdentifier);
    
    // Icon plane
    const imgPlane = BABYLON.MeshBuilder.CreatePlane("icon", {width: 10, height: 10});
    imgPlane.setParent(parentMesh);

    if(isTag && isRightPosition)
        imgPlane.material = top.materials.tagMat1;
    else if (isTag && !isRightPosition)
        imgPlane.material = top.materials.tagMat2;
    else if (!isTag && isRightPosition)
        imgPlane.material = top.materials.hotspotMat1;
    else if (!isTag && !isRightPosition)
        imgPlane.material = top.materials.hotspotMat2;

    imgPlane.position = new BABYLON.Vector3(1,0.12,0);
    imgPlane.scaling.x *= 3.5 * 2.516;
    imgPlane.scaling.y *= 3.5;
    imgPlane.isPickable = false;

    const planeOptions = {width: 65, height: 65};

    const textPlane = BABYLON.MeshBuilder.CreatePlane("textBlockPlane", planeOptions);
    textPlane.setParent(parentMesh);
    textPlane.position = new BABYLON.Vector3(1.7,-0.55,0);
    textPlane.isPickable = false;

    /*
    const textPlaneBackground = BABYLON.MeshBuilder.CreatePlane("backgroundPlane", planeOptions );
    textPlane.addChild(textPlaneBackground);
    textPlaneBackground.position = new BABYLON.Vector3.Zero();
    textPlaneBackground.isPickable = false;
    */

    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(textPlane);
    advancedTexture.name = "at_" + controlIdentifier;
    
    var textBlock = new  GUI.TextBlock("textBlock", text);
    advancedTexture.addControl(textBlock);
    textBlock.color = "white";
    textBlock.fontSizeInPixels = 130;
    textBlock.lineSpacing = -15;
    textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.textWrapping = GUI.TextWrapping.WordWrap;
    textBlock.fontWeight = "bold";
    textBlock.shadowOffsetX = 3;
    textBlock.shadowOffsetY = 12;

    return parentMesh;
}