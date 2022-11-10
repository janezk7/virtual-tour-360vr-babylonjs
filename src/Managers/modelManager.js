import * as BABYLON from 'babylonjs';

export function loadModel(name, modelUrl, modelReturnCallback, onErrorCallback) {
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