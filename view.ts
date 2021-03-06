import { ItemView, WorkspaceLeaf, App, TFile, MetadataCache, Vault } from 'obsidian';
import WorldMapPlugin from './main'
import WorldMapControl from './svelte/WorldMapControl.svelte'
import { debounce, getMapData, updateMap, getTypes, getTags, getYear, filterNotes, getFileGeoData } from './utils'
import { DEFAULT_SETTINGS, VIEW_TYPE_OB_MAP_CONTROL, VIEW_TYPE_OB_WORLD_MAP } from './constants'
import L from 'leaflet'

import Freedraw, { CREATE, EDIT, ALL, NONE } from 'leaflet-freedraw';
import FileSaver from 'file-saver';
import 'leaflet-measure';
import 'leaflet-measure/dist/leaflet-measure.css'
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw/dist/leaflet.draw-src.css'
import 'leaflet/dist/leaflet.css';



var map;

export class WorldMapControlView extends ItemView {
    plugin: WorldMapPlugin;

    constructor(leaf: WorkspaceLeaf, app: App, plugin: WorldMapPlugin) {
        super(leaf);
        this.redraw = this.redraw.bind(this);
        this.app = app;
        this.plugin = plugin;
        this.containerEl = this.containerEl;
        this.registerEvent(this.app.workspace.on("layout-ready", this.redraw));
        this.registerEvent(this.app.workspace.on("file-open", this.redraw));
        this.registerEvent(this.app.workspace.on("quick-preview", this.redraw));
    }

    getViewType(): string {
        return VIEW_TYPE_OB_MAP_CONTROL;
    }

    getDisplayText(): string {
        return "World Map";
    }

    getIcon(): string {
        return "lines-of-text";
    }

    onClose(): Promise<void> {
        return Promise.resolve();
    }

    async onOpen(): Promise<void> {
        this.redraw();
    }

    async redraw() {
        this.containerEl.empty();
        this.containerEl.createDiv({ cls: 'WorldMapControl', attr: { id: 'WorldMapControl' } })

        new WorldMapControl({
            target: this.containerEl
        })

        let updateButtonEl = this.containerEl.createEl('button', { cls: 'ob-world-map-update-button', text: 'Filter' }) //.setText('Filter')
        updateButtonEl.addEventListener("click", event => {
            // get geo data for the specific parameters
            //let geoData;
            updateMap(this.app.vault.getMarkdownFiles(), this.app.metadataCache, this.app.vault, map)
            //console.log(geoData)

            /*for(let i=0; i < geoData.length; i++){
                var marker = L.circle([geoData[i], -0.11], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 500
                }).addTo(map);
            }*/
        });
    }
}


export class WorldMapView extends ItemView {

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.redraw = this.redraw.bind(this);
        this.redraw_debounced = this.redraw_debounced.bind(this);
        this.containerEl.createDiv({ cls: 'map', attr: { id: 'map' } })
    }

    getViewType(): string {
        return VIEW_TYPE_OB_WORLD_MAP;
    }

    getDisplayText(): string {
        return "World Map";
    }

    getIcon(): string {
        return "lines-of-text";
    }

    onClose(): Promise<void> {
        return Promise.resolve();
    }

    async onOpen(): Promise<void> {
        this.redraw();
    }

    redraw_debounced = debounce(function () {
        this.redraw();
    }, 1000);

    convertToGeojson(FreeDrawOut) {
        //{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":

        let geojson = {
            "type": "FeatureCollection",
            "features": [

            ]
        }

        for (let i = 0; i < FreeDrawOut.length; i++) {
            // for each separated element from the current drawing
            // create a feature and append to geojson
            geojson.features.push(FreeDrawOut[i].toGeoJSON())
        }
        return JSON.stringify(geojson);
    }

    async redraw() {

        var container = document.getElementsByClassName('map')[0].createDiv({
            cls: 'map', attr: {
                id: 'map',
                style: 'position:absolute; top:0px; right:0px; height:100%; width:100%;'
            }
        })
        document.getElementsByClassName('map')[0].setAttribute('style', 'position:absolute; top:0px; right:0px; height:100%; width:100%;')

        let draw, view;
        if (container) {
            map = L.map('map', {}).setView([14, -1.8], 5);

            var tile_layer_main = L.tileLayer('app://local/Users/gaby/Desktop/Nehlam/Data/Tiles/{z}/{x}/{y}.png', {
                "attribution": "darakah",
                "maxNativeZoom": 7,
                "maxZoom": 10000,
                "minZoom": 3,
                "noWrap": true,
                "zoomStart": 5
            }).addTo(map);

            var measure_control_main = new L.Control.Measure(
                {
                    "position": "topleft",
                    "primaryLengthUnit": "Nu",
                    "secondaryLengthUnit": "meters",
                    "primaryAreaUnit": "sqNu",
                    "secondaryAreaUnit": "sqmeters",
                    "activeColor": '#ffcc66',
                    "completedColor": '#ffcc66',
                    units: {
                        "Nu": {
                            factor: 8,
                            display: "Nu",
                            decimals: 2
                        },
                        "sqNu": {
                            factor: 64,
                            display: "Square Nu",
                            decimals: 2
                        }
                    }
                });

            L.Control.Scale.include({
                _updateMetric: function (maxMeters) {
                    maxMeters = maxMeters * 8;
                    var meters = this._getRoundNum(maxMeters),
                        label = meters < 1000 ? meters + " m" : (meters / 1000) + " km";
                    this._updateScale(this._mScale, label, meters / maxMeters);
                }
            });

            L.Control.Scale.include({
                _updateImperial: function (maxMeters) {
                    maxMeters = maxMeters * 8;
                    var maxFeet = maxMeters * 8 * 3.2808399, maxMiles, miles, feet;
                    if (maxFeet > 5280) {
                        maxMiles = maxFeet / 5280;
                        miles = this._getRoundNum(maxMiles);
                        this._updateScale(this._iScale, miles + " mi", miles / maxMiles);
                    }
                    else {
                        feet = this._getRoundNum(maxFeet);
                        this._updateScale(this._iScale, feet + " ft", feet / maxFeet);
                    }
                }
            });
            measure_control_main.addTo(map);

            const freeDraw = new Freedraw({ mode: NONE, smoothFactor: 0.05, elbowDistance: 2, simplifyFactor: 0.05, strokeWidth: 1 });
            map.addLayer(freeDraw);

            let drawControl = L.control({ position: 'topright' });
            drawControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'FreeDrawControl');
                div.innerHTML = `<div class="leaflet-control-layers leaflet-control-layers-expanded">
                                    <form>
                                    <input class="leaflet-control-layers-overlays" id="FreeDrawControl" type="checkbox">
                                        Draw
                                    </input>
                                    </form>
                                </div>`;
                return div;
            };
            drawControl.addTo(map);
            document.getElementById("FreeDrawControl").addEventListener("click", () => {
                if (freeDraw.mode() === 0) {
                    map.addLayer(freeDraw)
                    freeDraw.mode(15);
                } else {
                    freeDraw.mode(0)
                    map.removeLayer(freeDraw)
                }
            });

            let freeEdit = L.control({ position: 'topright' });
            freeEdit.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'freeEdit');
                div.innerHTML = `<div class="leaflet-control-layers leaflet-control-layers-expanded">
                                    <form>
                                    <input class="leaflet-control-layers-overlays" id="freeEdit" type="checkbox">
                                        Edit
                                    </input>
                                    </form>
                                </div>`;
                return div;
            };
            freeEdit.addTo(map);
            document.getElementById("freeEdit").addEventListener("click", () => {
                if (freeDraw.mode() === 15) {
                    freeDraw.mode(2);
                } else {
                    freeDraw.mode(15)
                }
            });

            let ExportControl = L.control({ position: 'topright' });
            ExportControl.onAdd = function (map) {
                let div = L.DomUtil.create('div', 'ExportControl');
                div.innerHTML = `<div class="leaflet-control-layers leaflet-control-layers-expanded">
                                    <form>
                                    <input class="leaflet-control-layers-overlays" id="ExportControl" type="checkbox">
                                        Export
                                    </input>
                                    </form>
                                </div>`;
                return div;
            };
            ExportControl.addTo(map);

            document.getElementById("ExportControl").addEventListener("click", () => {
                if (freeDraw.mode() != 0) {
                    let blob = new Blob([JSON.stringify(JSON.parse(this.convertToGeojson(freeDraw.all())), null, 2)], { type: "text/plain;charset=utf-8" });
                    FileSaver.saveAs(blob, "ThisIsMeFile.geojson");
                    freeDraw.clear();
                }
            });

            let drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);
            let drawControlBase = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems
                }
            }).addTo(map);
        }
    }
}
