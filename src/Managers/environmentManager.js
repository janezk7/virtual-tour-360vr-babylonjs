import * as BABYLON from 'babylonjs';
import { create3dTag } from './tagManager';
import { create3dHotspot } from './hotspotManager';
import { getHotspotName, getTagName } from '../Constants/nameConstants';

var disposeEnvironment = function(env) {
    // Dispose hotspots
    for(let m = 0; m < env.hotspots.length; m++) {
        let hotspot = env.hotspots[m]; 
        hotspot.meshMarker.dispose();
        hotspot.guiElement.dispose();
    }
    // Dispose tags
    for(let t = 0; t < env.tags.length; t++) {
        let tag = env.tags[t];
        tag.meshMarker.dispose();
        tag.guiElement.dispose();
    }
}

function getEnvironmentIndexByName(environmentName, environments){
    for(let i = 0; i < environments.length; i++) {
        if(environments[i].name === environmentName) {
            return i;
        }
    }
    return null;
}

// Creates environment from definition structure for internal use.
var createEnvironment = function (environmentDefinition) {    
    return {
        orderNum: environmentDefinition.orderNum,
        isVideo: environmentDefinition.isVideo,
        name: environmentDefinition.name,
        isLocked: environmentDefinition.isLocked,
        uri: environmentDefinition.uri,
        hotspots: [],
        tags: [],
        dispose: function () { disposeEnvironment(this) }
    };
}

// Define navigation hotspots
// Note: requires list of all environments with isLocked field
function getHotspots(environmentDefinition, allEnvironments) {
    let hotspots = [];
    if(environmentDefinition.hotspots) {
        for(let i = 0; i < environmentDefinition.hotspots.length; i++) {
            let btnBaseName = getHotspotName(environmentDefinition.name, i);
            let marker = environmentDefinition.hotspots[i]; // [{pos: BABYLON.Vector3, text: string, dest: string, destIndex: int}]
            let globeMarker = new BABYLON.Mesh("mesh_" + btnBaseName , top.scene);
            globeMarker.position = marker.pos;  //new BABYLON.Vector3(0, 0, 500); // <- exactly same as radius of dome
            
            // Create hotspot button and parent to marker
            var isDestinationLocked = allEnvironments[marker.destIndex].isLocked;
            let btnObj = create3dHotspot(btnBaseName, marker.text, isDestinationLocked, marker.destIndex, marker.isLeft);
            globeMarker.addChild(btnObj.mesh);
            btnObj.mesh.position = new BABYLON.Vector3.Zero();
        
            // Hide hotspot
            globeMarker.setEnabled(false);
            
            hotspots.push({
                displayText: marker.text,
                isLeft: marker.isLeft,
                dest: marker.dest,
                meshMarker: globeMarker, 
                guiElement: btnObj.uiElement
            });
        }
    }
    
    return hotspots;
}

// Define information tags
function getTags(environmentDefinition) {
    let tags = [];
    if(environmentDefinition.tags) {
        for(let i = 0; i < environmentDefinition.tags.length; i++) {
            let tagBaseName = getTagName(environmentDefinition.name, i);
            let tag = environmentDefinition.tags[i];
            let globeMarker = new BABYLON.Mesh("mesh_" + tagBaseName, top.scene);
            globeMarker.position = tag.pos;
            
            // Create tag button and parent to marker
            let btnObj = create3dTag(tagBaseName, tag.text, tag.title, tag.description, tag.imageUrl, tag.websiteUrl, tag.isLeft);
            globeMarker.addChild(btnObj.mesh);
            btnObj.mesh.position = new BABYLON.Vector3.Zero();

            // Hide tag
            btnObj.uiElement.isVisible = false;

            tags.push({
                displayText: tag.text, // Hotspot display text
                title: tag.title,
                description: tag.description,
                imageUrl: tag.imageUrl,
                websiteUrl: tag.websiteUrl,
                isLeft: tag.isLeft,
                meshMarker: globeMarker, 
                guiElement: btnObj.uiElement
            });
        }
    }

    return tags;
}


function getEnvironments(definitions) {
    let environments = []; 

    // create dictionary 
    let envIndexDict = {};
    for(let i = 0; i < definitions.length; i++) {
        envIndexDict[definitions[i].name] = i;
    }

    //  and create environments (without tags and hotspots)
    definitions.forEach(envDef => {
        environments.push(createEnvironment(envDef));
    });

    // Populate environment tags and hotspots
    definitions.forEach(envDef => {
        // Update marker destination indexes
        if(envDef.hotspots)
            envDef.hotspots.forEach(m => m.destIndex = envIndexDict[m.dest]);
        
        let envIndex = envIndexDict[envDef.name];
        environments[envIndex].hotspots = getHotspots(envDef, environments);
        environments[envIndex].tags = getTags(envDef);
    });
    
    // Define helper functions
    environments.getIndexByName = function (name) { return getEnvironmentIndexByName(name, this);}

    return environments;
}

function addEnvironment(orderNum, isVideo, name, isLocked, uri) {
    var newDefinition = createEnvironmentDefinition(orderNum, isVideo, name, isLocked, uri);
    var newEnvironment = createEnvironment(newDefinition);

    top.environments.push(newEnvironment);
    console.log("New environment added. Count: "+ top.environments.length);
}

function createEnvironmentDefinition(orderNum, isVideo, name, isLocked, uri) {
    return {
        orderNum: orderNum,
        isVideo: isVideo,
        name: name,
        isLocked, isLocked,
        uri: uri
    };
}

export {getEnvironments, addEnvironment}