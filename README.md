# Virtual Web Tour 360
Written and curated by Janez Krnc (github@janezk7), 3.11.2022

## Keywords
Virtual tour, 360 videos, BabylonJs, Web, VR 

## Features Summary
- A virtual tour app for exploring 360 videos and images on the web. 
- Built with Babylon.js engine
- Supports VR and touch devices (mobile or tablet). 
- Includes GUI for creating and editing 360 environments
- Info hotspot support
- Supports localization

## Building project
- Set: ``isProduction = true`` and ``isDebug = false`` (in ``main.js``);
- Run ``npm run build``. 

## Building and deploying to DNN
### Build project
- Build project normally
- Optional: remove custom ``<script>`` (on the bottom) and ``<style>`` (on top) references in html. (See section `Setting script references in HTML module settings`)
- Optional: Remove hash values from scripts (.js) and styles (.css) files for easier maintenance.

### Deploying to DNN
- Copy build files to app directory (e.g.: `/Portals/0/<AppFolder>/`)
- Copy ``Resources`` and ``Textures`` from project ``dist`` folder to the app directory.
- Update ``index.html``. Update ``value`` of ``<input id="dnnAppDirectory" value="/Portals/<PortalNumber>/<AppFolder>/"></input>``;
- Add html module to DNN page. Edit content and paste html content as source from build (**don't prettyPrint html!**)

### Setting script references in HTML module settings
- Go to html module Settings -> Advanced settings
- Paste style files references in the "Header" section. Example:
> ``<link rel="stylesheet" href="/Portals/0/<AppFolder>/style.css">``

- Paste style files references in the "Footer" section. Example:
> ``<script src="/Portals/0/<AppFolder>/<scriptFilename>.js"></script>``

>Note: src must match the location of files.

- Put ``environmentDefinitions.json`` in `<AppFolder>/Resources` folder

## Localization
- Put ``localizedAppStrings.json`` in `<AppFolder>/Resources` folder. Change string values

## Troubleshooting
**App display issues or environments not showing correctly**
- Solution: Refresh site with Ctrl+F5 after deploying new files or updating JSON. Prevents loading old files from cache.

**App doesn't display correctly**
- App css styles, bootstrap or other styling library might clash with the default DNN theme and styles (including bootstrap)
- Remove or minimize your styling css references