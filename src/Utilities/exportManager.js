import { createEnvironmentDefinition } from "../Managers/environmentManager";
import { applyModelTransformChanges, createModelDefinition } from "../Managers/modelManager";

export function exportEnvironments(environments) {
    // Generate definitions
    let environmentDefinitions = [];

    // Pre-export work
    // Apply model transform changes
    top.environments[top.currentEnvironmentIndex].models?.forEach(m => applyModelTransformChanges(m));

    for(let i = 0; i < environments.length; i++) {
        let env = environments[i];
        let hotspots = [];
        let tags = [];
        let models = [];

        env.hotspots?.forEach(m => 
            hotspots.push({
                text: m.displayText,
                isStepType: m.isStepType,
                isLeft: m.isLeft,
                pos: m.meshMarker.position,
                dest: m.dest,
                cameraOffsetDegrees: m.cameraOffsetDegrees
            })
        );

        env.tags?.forEach(t => 
            tags.push({
                text: t.displayText, // Hotspot display text
                title: t.title,
                description: t.description,
                imageUrl: t.imageUrl,
                websiteUrl: t.websiteUrl,
                isLeft: t.isLeft,
                pos: t.meshMarker.position
            })   
        );

        env.models?.forEach(m => {
            models.push(createModelDefinition({
                name: m.name, 
                url: m.url,
                pos: m.pos,
                rot: m.rot,
                scale: m.scale,
            }));
        });

        let definition = createEnvironmentDefinition({
            orderNum: env.orderNum,
            name: env.name,
            isHidden: env.isHidden,
            isVideo: env.isVideo,
            isLocked: env.isLocked,
            uri: env.uri, // !env.isLocked && env.uri
            hotspots: hotspots,
            tags: tags,
            models: models
        });

        environmentDefinitions.push(definition);
    }

    console.log(environmentDefinitions);
    // Serialize to JSON
    let json = JSON.stringify(environmentDefinitions);
    let filename = "exportedEnvironments.json";
    let file = new Blob([json], {type: "text/plain"});
    if(window.navigator.msSaveOrOpenBlob)
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a");
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}