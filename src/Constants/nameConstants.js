
export function getHotspotName(environmentName, index) {
    return "hotspot_"+ environmentName + "_" + index;
}

export function getTagName(environmentName, index) {
    return "tag_" + environmentName + "_" + index;
}

export function getModelName(environmentName, index) {
    return `model_${environmentName}_${index}`;
}
