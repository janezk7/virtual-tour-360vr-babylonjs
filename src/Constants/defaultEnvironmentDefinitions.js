import * as BABYLON from 'babylonjs';

var environmentDefinitions = [
    {
        orderNum: 1,
        name: "starting",
        uri: "https://miro.medium.com/max/10752/1*kY8Q5mqqqMz6r8YxcEcU6w.jpeg",
        hotspots: [
            { pos: new BABYLON.Vector3(-250, 0, 250), text: "V vodo", dest: "first"},
            { pos: new BABYLON.Vector3(0, 0, 250), text: "V london", dest: "london"},
            { pos: new BABYLON.Vector3(0, -50, 250), text: "V alpe", dest: "alps"},
            { pos: new BABYLON.Vector3(100,-50,250), text: "360 Url", dest: "videoUrlTest"}        
        ],
        tags: [
            { pos: new BABYLON.Vector3(150, -150, 400), text: "To je pesek" }
        ]
    },
    {
        orderNum: 2,
        name: "first",
        uri: "https://images.squarespace-cdn.com/content/v1/5568ec94e4b06c17240d5220/1443508568279-5KM5IBNCU4HDIQGMTCC3/ke17ZwdGBToddI8pDm48kBpzt4_K496Ao-aLooMTCTp7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0plef_PmwB6-3GP4qDbCUv9cfxFbOETjyuzxeVcrr-Ci5fj66QIwtSm7rXFpMnU6ig/Homepage+LEI.jpg?format=2500w", 
        hotspots: [
            { pos: new BABYLON.Vector3(0, 10, -250), text: "Back to shore", dest: "starting"}
        ]
    },
    {
        orderNum: 3,
        isVideo: true,
        name: "london",
        uri: "./Resources/Videos/london.mp4",
        hotspots: [
            { pos: new BABYLON.Vector3(0, 0, 250), text: "To waterfall", dest: "waterfall"},
            { pos: new BABYLON.Vector3(0, -100, 250), text: "Home", dest: "starting"}
        ]
    },
    {
        orderNum: 4,
        isVideo: true,
        name: "waterfall",
        uri: "./Resources/Videos/crystal.mp4",
        hotspots: [
            { pos: new BABYLON.Vector3(0, 100, 250), text: "Back to london", dest: "london"}
        ]
    },
    {
        orderNum: 7,
        isVideo: true,
        name: "alps",
        uri: "./Resources/Videos/bavarianAlps2.mp4",
        hotspots: [
            { pos: new BABYLON.Vector3(0, 0, 250), text: "Home", dest: "starting"}
        ]
    },
    {
        orderNum: 8,
        isVideo: true,
        name: "videoUrlTest",
        uri: "https://yoda.blob.core.windows.net/videos/uptale360.mp4",
        hotspots: [
            { pos: new BABYLON.Vector3(0, 0, 250), text: "Home", dest: "starting"}
        ]
    }
];


export default environmentDefinitions;
