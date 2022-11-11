
// Creates textures and materials for app
export function loadAppTextureMaterials(domainDirectory, scene) {
    // Load textures and materials
    var hotspotTexStep = new BABYLON.Texture(domainDirectory + "Textures/footstep.png", scene);
    hotspotTexStep.hasAlpha = true;
    hotspotTexStep.WrapU = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE; // Prevents wrapping line showing on top of texture
    hotspotTexStep.wrapV = BABYLON.Constants.TEXTURE_CLAMP_ADDRESSMODE; // ^
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

    // Shared material properties. Used for all hotspot/tag graphics
    var hotspotMatBase = new BABYLON.StandardMaterial("hotspotMat_base", scene);
    hotspotMatBase.emissiveColor = new BABYLON.Color3(1,1,1);
    hotspotMatBase.backFaceCulling = false;
    hotspotMatBase.disableLighting = true;
    hotspotMatBase.useAlphaFromDiffuseTexture = true;
    hotspotMatBase.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND; 
    hotspotMatBase.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

    var hotspotMaterialStep = hotspotMatBase.clone("hotspotMatStep");
    hotspotMaterialStep.diffuseTexture = hotspotTexStep;

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

    let materials = {
        hotspotMatStep: hotspotMaterialStep,
        hotspotMat1: hotspotMaterial1,
        hotspotMat2: hotspotMaterial2,
        tagMat1: tagMaterial1,
        tagMat2: tagMaterial2,
        tagMat1_hover: tagMaterial1_hover,
        tagMat2_hover: tagMaterial2_hover,
        lockedMat: lockedMaterial
    };
    hotspotMatBase.dispose();

    return materials;
}