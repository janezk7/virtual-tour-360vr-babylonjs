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
            console.log("P: ", prog);
        },
        function (scene, message, exception) {
            onErrorCallback({message, exception});
        }
    );
}

function loadAndCacheModel(modelUrl) {
    loadModel("_loadedModel", modelUrl
    , (loadedModel) => {
        top.modelManager.loadedModel && top.modelManager.loadedModel.dispose();
        top.modelManager.loadedModel = loadedModel;
        top.modelManager.loadedModelUrl = modelUrl;
        let size = 40;
        loadedModel.scaling = new BABYLON.Vector3(size,size,size);
        loadedModel.isPickable = false;
        loadedModel.visibility = 0.5;
        loadedModel.setEnabled(false);
        let successMsg = `Model loaded successfuly : ${loadedModel.name}`;
        document.getElementById('loadedModelFile').innerText = successMsg;
    }, (error) => {
        let errorMsg = error;
        document.getElementById('loadedModelFile').innerText = errorMsg; 
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
        let modelBaseName = getModelName(currentEnvironment.name, currentEnvironment.models.length);

        // 1. Clone loaded model
        let modelInstance = model.clone();
        modelInstance.name = `mesh_${modelBaseName}`;

        // 2. place where hit was picked
        modelInstance.position = hit.pickedPoint;
        modelInstance.setEnabled(true);

        // 3. show edit interface (update/reset field values)
        // Not yet implemented.

        // 4. Add model definition to environment and loaded model to current loaded models 
        top.loadedEnvironmentModels.push(modelInstance);
        currentEnvironment.models.push(createModelDefinition({
            name: modelInstance.name, 
            url: top.modelManager.loadedModelUrl,
            pos: modelInstance.position,
            rot: modelInstance.rotation,
            scale: modelInstance.scaling,
        }));

        toggleModelPlacingModel();

        // Restore camera position
        top.camera.alpha = alpha;
        top.camera.beta = beta;
    }
}

function createModelDefinition({name, pos, rot, scale, url}) {
    return {
        name: name,
        url: url,
        pos: {x: pos.x, y: pos.y, z: pos.z},
        rot: {x: rot.x, y: rot.y, z: rot.z},
        scale: {x: scale.x, y: scale.y, z: scale.z}
    };
}

export { loadModel, loadAndCacheModel, toggleModelPlacingModel, modelManagerCastRayHandler }