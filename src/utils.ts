import type { TFile, Component, MetadataCache, Vault } from 'obsidian';
import type { WorldMapSettings, MapData } from './types';
import { getAllTags, MarkdownRenderer } from 'obsidian';
import { tags, types, year } from './svelte/store';
import L from 'leaflet';
import '@fortawesome/fontawesome-free/css/all.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import { pathToFileURL } from 'node:url';

/**
 * Update Map Data
 * @param fileList - TFile List of all obsidian vault files
 * @param metadata - vault metadata cache handler
 * @param vault - vault handler
 * @param settings - World Map Settings
 */
export async function updateMapData(fileList: TFile[], metadata: MetadataCache, vault: Vault, settings: WorldMapSettings) {

    // Create a DOM Parser
    const domparser = new DOMParser();

    for (let file of fileList) {

        // regex to identify map tile layers
        let regex = new RegExp(`${settings.overlayTilesPath}.*\.png`);
        let path = null;
        let name = file.name;

        // if file is a tile
        if (file.path.match(regex)) {
            let param = name.slice(0, name.length - 4).split('_');
            let url = vault.adapter.getResourcePath(file.path);
            let dateStart = parseInt(param[1]);
            let dateEnd = parseInt(param[2]);

            if (!settings.mapData[dateStart]) {
                settings.mapData[dateStart] = {};
            }

            if (!settings.mapData[dateStart][dateEnd]) {
                settings.mapData[dateStart][dateEnd] = {};
            }

            if (!settings.mapData[dateStart][dateEnd][param[0]]) {
                settings.mapData[dateStart][dateEnd][param[0]] = [];
            }

            if (param[8]) {
                path = `${name.slice(name.indexOf(param[8]), name.length - 4).replace('_', '/')}.md`;
            }

            settings.mapData[dateStart][dateEnd][param[0]].push({
                path: path,
                img: url,
                markerInfo: null,
                tags: null,
                coord: [parseFloat(param[4]), parseFloat(param[5]), parseFloat(param[6]), parseFloat(param[7])]
            });
        }

        // if file is a markdown
        if (file.extension == 'md') {
            let doc = domparser.parseFromString(await vault.read(file), 'text/html');
            let geoData = doc.getElementsByClassName('ob-world-map');

            let element = geoData[0];
            if (!(element instanceof HTMLElement)) {
                continue;
            }

            let dateStart;
            // check if a valid year is specified
            if (element.dataset.datestart == '-') {
                // if it is a negative year
                dateStart = parseInt(element.dataset.datestart.substring(1, element.dataset.datestart.length)) * -1;
            } else {
                dateStart = parseInt(element.dataset.datestart);
            }

            if (!dateStart) {
                continue;
            }

            let dateEnd;
            // check if a valid year is specified
            if (element.dataset.dateend == '-') {
                // if it is a negative year
                dateEnd = parseInt(element.dataset.dateend.substring(1, element.dataset.dateend.length)) * -1;
            } else {
                dateEnd = parseInt(element.dataset.dateend);
            }
            if (!dateEnd) {
                continue;
            }

            let coord = element.dataset.loc.split('/');
            let lat = parseFloat(coord[0]) ?? 0;
            let long = parseFloat(coord[1]) ?? 0;
            let noteType = element.dataset.type ?? "city";

            if (!settings.mapData[dateStart]) {
                settings.mapData[dateStart] = {};
            }

            if (!settings.mapData[dateStart][dateEnd]) {
                settings.mapData[dateStart][dateEnd] = {};
            }

            if (!settings.mapData[dateStart][dateEnd][noteType]) {
                settings.mapData[dateStart][dateEnd][noteType] = [];
            }

            settings.mapData[dateStart][dateEnd][noteType].push({
                path: file.path,
                img: null,
                markerInfo: [element.dataset.icon, element.dataset.color, element.dataset.marker],
                tags: getAllTags(metadata.getFileCache(file)).map(e => e.slice(1, e.length)),
                coord: [lat, long]
            });
        }
    }
}

/**
 * Update Map Data
 * @param fileList - TFile List of all obsidian vault files
 * @param metadata - vault metadata cache handler
 * @param vault - vault handler
 * @param settings - World Map Settings
 */
export async function updateMap(Comp: Component, data: MapData, vault: Vault, leafletMap, overlayMaps, settings: WorldMapSettings) {

    // Get chosen year
    let year = getYear();
    let tagFilter = getTags();

    // Remove "" from tag list if present
    if (tagFilter?.contains("")) {
        if (tagFilter.length === 1) {
            tagFilter = null;
        } else {
            tagFilter = tagFilter.splice(tagFilter.indexOf(""), 1);
        }
    }

    // Clear all overlay Map layers
    Object.values(overlayMaps).forEach(featureGroup => {
        (featureGroup as any).clearLayers();
    });

    // For each start year
    Object.keys(data).forEach(keyStart => {

        let startYear = parseInt(keyStart);
        let dataStart = data[keyStart];

        if (year >= startYear) {
            Object.keys(dataStart).forEach(keyEnd => {

                let endYear = parseInt(keyEnd);

                if (year <= endYear || endYear == -1) {

                    // Map data is in time range
                    // Add tiles
                    settings.tileLayersActive.forEach(layer => {

                        let featureGroup = dataStart[keyEnd][layer];

                        if (featureGroup) {
                            // if data is present for this layer
                            featureGroup.forEach(element => {

                                let param = element.coord;
                                let path = element.path;
                                let tile = L.imageOverlay(element.img,
                                    [[param[0], param[1]], [param[2], param[3]]],
                                    {
                                        className: 'leaflet-image-layer-interactive',
                                        interactive: true
                                    });

                                tile.addTo(overlayMaps[layer]);

                                tile.on("click", async function () {

                                    if (path) {
                                        let text = await vault.adapter.read(path);
                                        let info = document.getElementsByClassName('world-map-info')[0];
                                        if (info instanceof HTMLElement) {
                                            info.style.setProperty('display', 'inline');
                                            info.innerHTML = "";

                                            MarkdownRenderer.renderMarkdown(text, info as HTMLElement, '/', Comp);
                                        }

                                        info.addEventListener('mouseover', function () {
                                            leafletMap.dragging.disable();
                                            leafletMap.scrollWheelZoom.disable();
                                        });

                                        info.addEventListener('mouseout', function () {
                                            leafletMap.dragging.enable();
                                            leafletMap.scrollWheelZoom.enable();
                                        });
                                    }
                                });
                            });

                        }
                    });

                    settings.tileLayers.forEach(layer => {

                        let featureGroup = dataStart[keyEnd][layer];

                        if (featureGroup) {
                            // if data is present for this layer
                            featureGroup.forEach(element => {

                                let param = element.coord;
                                let path = element.path;
                                let tile = L.imageOverlay(element.img,
                                    [[param[0], param[1]], [param[2], param[3]]], {});

                                tile.addTo(overlayMaps[layer]);

                                tile.on("click", async function () {

                                    if (path) {
                                        let text = await vault.adapter.read(path);
                                        let info = document.getElementsByClassName('world-map-info')[0];
                                        if (info instanceof HTMLElement) {
                                            info.style.setProperty('display', 'inline');
                                            info.innerHTML = "";

                                            MarkdownRenderer.renderMarkdown(text, info as HTMLElement, '/', Comp);
                                        }

                                        info.addEventListener('mouseover', function () {
                                            leafletMap.dragging.disable();
                                            leafletMap.scrollWheelZoom.disable();
                                        });

                                        info.addEventListener('mouseout', function () {
                                            leafletMap.dragging.enable();
                                            leafletMap.scrollWheelZoom.enable();
                                        });
                                    }
                                });
                            });

                        }
                    });

                    settings.markerLayers.forEach(layer => {

                        let featureGroup = dataStart[keyEnd][layer];

                        if (featureGroup) {
                            // if data is present for this layer
                            featureGroup.forEach(element => {

                                let markerTags = element.tags;

                                if (!tagFilter || tagFilter.every(e => markerTags.contains(e))) {
                                    let param = element.coord;
                                    let markerInfo = element.markerInfo;
                                    let icon;
                                    if (markerInfo[2]) {
                                        icon = L.divIcon({
                                            iconAnchor: [0, 24],
                                            labelAnchor: [-6, 0],
                                            popupAnchor: [0, -36],
                                            html: `${markerInfo[2]}`
                                        });
                                    } else {
                                        icon = L.AwesomeMarkers.icon({
                                            icon: markerInfo[0],
                                            markerColor: markerInfo[1],
                                            prefix: 'fas fa'
                                        });
                                    }

                                    let marker = L.marker([param[0], param[1]], { icon: icon });

                                    marker.addTo(overlayMaps[layer]);
                                    marker.on("click", async function () {

                                        let text = await vault.adapter.read(element.path);
                                        let info = document.getElementsByClassName('world-map-info')[0];
                                        if (info instanceof HTMLElement) {
                                            info.style.setProperty('display', 'inline');
                                            info.innerHTML = "";

                                            MarkdownRenderer.renderMarkdown(text, info as HTMLElement, '/', Comp);
                                        }

                                        info.addEventListener('mouseover', function () {
                                            leafletMap.dragging.disable();
                                            leafletMap.scrollWheelZoom.disable();
                                        });

                                        info.addEventListener('mouseout', function () {
                                            leafletMap.dragging.enable();
                                            leafletMap.scrollWheelZoom.enable();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

/**
 * Return array of parsed tags from world map control panel
 */
export function getTags(): string[] {
    let parsedTags;
    tags.subscribe(value => {
        parsedTags = value?.trim().split(';');
    });
    return parsedTags;
}

/**
 * Return current year focus from world map control panel 
 */
export function getYear(): number {
    let yearSelected;
    year.subscribe(value => {
        yearSelected = value;
    });
    return yearSelected;
}

/**
 * Return selected types from world map control panel 
 */
export function getTypes(): number {
    let typesSelected;
    types.subscribe(value => {
        typesSelected = value;
    });
    return typesSelected;
}

export function convertToGeojson(FreeDrawOut) {
    let geojson = {
        "type": "FeatureCollection",
        "features": [

        ]
    };

    for (let i = 0; i < FreeDrawOut.length; i++) {
        // for each separated element from the current drawing
        // create a feature and append to geojson
        geojson.features.push(FreeDrawOut[i].toGeoJSON());
    }
    return JSON.stringify(geojson);
}