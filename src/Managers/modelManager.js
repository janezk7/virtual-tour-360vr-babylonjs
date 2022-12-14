import * as BABYLON from 'babylonjs';
import { getModelName } from '../Constants/nameConstants';

function loadModel(name, modelUrl, modelReturnCallback, onErrorCallback) {
    // Load tree
    BABYLON.SceneLoader.ImportMesh(
        null, 
        modelUrl,      
        "", 
        top.scene, 
        function (meshes, particleSystems, skeletons) {
            let loadedModel = meshes[0];
            loadedModel.name = name;

            modelReturnCallback(loadedModel);
        },
        function (prog) {
            // Progress function
            //console.log("P: ", prog);
        },
        function (scene, message, exception) {
            console.trace("Something went wrong: ", message);
            onErrorCallback({message, exception});
        }
    );
}

function loadAndCacheModel() {
    let modelUrl = document.getElementById('input3dModel').value;
    let loadedModelFileInput = document.getElementById('loadedModelFile');
    loadedModelFileInput.innerText = "";
    loadModel("_loadedModel", modelUrl
    , (loadedModel) => {
        top.modelManager.loadedModel && top.modelManager.loadedModel.dispose();
        top.modelManager.loadedModel = loadedModel;
        top.modelManager.loadedModelUrl = modelUrl;
        let size = 80;
        loadedModel.rotationQuanternion = null;
        loadedModel.scaling = new BABYLON.Vector3(size,size,size);
        loadedModel.isPickable = false;
        loadedModel.visibility = 0.5;
        loadedModel.setEnabled(false);

        // Stop animations
        loadedModel.getChildren((c) => top.scene.stopAnimation(c), false);

        loadedModelFileInput.innerText = `Model loaded successfuly : ${modelUrl}`;
    }, (error) => {
        console.log(error);
        let errorMsg = error.message;
        loadedModelFileInput.innerText = errorMsg; 
    });
}

function toggleModelPlacingModel() {
    top.modelManager.isPlacingMode = !top.modelManager.isPlacingMode;
    let btn = document.getElementById('btnShow3dModelControls');
    if(top.modelManager.isPlacingMode) {
        btn.innerText = 'Tap on scene to place or cancel';
    } else {
        btn.innerText = '2. Place 3d Model';
    }

    top.pickingDomeModelMesh.isPickable = top.modelManager.isPlacingMode;
}

function modelManagerCastRayHandler() {
    let model = top.modelManager.loadedModel;
    if(!model) {
        let msg = "No model loaded! load model first";
        console.log(msg);
        alert(msg);
        return;
    }

    let scene = top.scene;
    let ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), top.camera);
    let hit = scene.pickWithRay(ray);

    if(hit.pickedMesh) {
        // Reset camera, so billboard faces correctly
        const {alpha, beta} = top.camera;
        top.camera.resetToDefault();
        
        let currentEnvironment = top.environments[top.currentEnvironmentIndex];
        let fullFilename = top.modelManager.loadedModelUrl.substring(top.modelManager.loadedModelUrl.lastIndexOf('/')+1);
        let modelName = fullFilename.split('.').slice(0,-1).join('.');
        let modelSceneName = getModelName(currentEnvironment.name, modelName, currentEnvironment.models.length);

        // 1. Clone loaded model
        let modelInstance = model.clone(); // TODO: animations don't work after cloning. Consider loading with AssetContainer or simply load a new instance (not optimal)
        modelInstance.name = `_${modelSceneName}`;

        // 2. place where hit was picked
        modelInstance.position = hit.pickedPoint;
        modelInstance.setEnabled(true);

        // Force euler rotaiton representation (for inspector setting)
        modelInstance.rotationQuanternion = null; 
        modelInstance.rotation = new BABYLON.Vector3(0,0,0);

        // 4. show edit interface (update/reset field values)
        // Not yet implemented.

        // 5. Add model object to environment and loaded mesh to current loaded models 
        let modelObject = {
            name: modelName,
            url: top.modelManager.loadedModelUrl,
            pos: modelInstance.position,
            rot: modelInstance.rotation,
            scale: modelInstance.scaling,
            meshMarker: modelInstance
        }
        
        currentEnvironment.models.push(modelObject);
        top.loadedEnvironmentModels.push(modelObject.meshMarker);      

        toggleModelPlacingModel();

        // Restore camera position
        top.camera.alpha = alpha;
        top.camera.beta = beta;
    }
}

// Export model
function createModelDefinition({name, pos, rot, scale, url}) {
    return {
        name: name,
        url: url,
        pos: {x: pos.x, y: pos.y, z: pos.z},
        rot: {x: rot.x, y: rot.y, z: rot.z},
        scale: {x: scale.x, y: scale.y, z: scale.z}
    };
}

function applyModelTransformChanges(environmentModel) {
    let m = environmentModel;
    if(!m.meshMarker) return;
    let pos = m.meshMarker.position;
    let rot = m.meshMarker.rotation;
    let scale = m.meshMarker.scaling;
    m.pos = new BABYLON.Vector3(pos.x, pos.y, pos.z);
    m.rot = new BABYLON.Vector3(rot.x, rot.y, rot.z);
    m.scale = new BABYLON.Vector3(scale.x, scale.y, scale.z);
}

export { loadModel, loadAndCacheModel, toggleModelPlacingModel, modelManagerCastRayHandler, createModelDefinition, applyModelTransformChanges }