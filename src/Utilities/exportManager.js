export function exportEnvironments(environments) {
    // Generate definitions
    let environmentDefinitions = [];
    console.log(environments);
    for(let i = 0; i < environments.length; i++) {
        let env = environments[i];
        let hotspots = [];
        let tags = [];

        env.hotspots.forEach(m => 
            hotspots.push({
                text: m.displayText,
                isLeft: m.isLeft,
                pos: m.meshMarker.position,
                dest: m.dest
            })
        );

        env.tags.forEach(t => 
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

        let definition = {
            orderNum: env.orderNum,
            isVideo: env.isVideo,
            name: env.name,
            isLocked: env.isLocked,
            uri: env.uri, // !env.isLocked && env.uri
            hotspots: hotspots,
            tags: tags
        }

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