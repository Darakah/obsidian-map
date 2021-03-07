import { ItemView, WorkspaceLeaf } from 'obsidian';
import MapControlButton from './svelte/MapControlButton.svelte'
import { convertToGeojson, updateMap } from './utils'
import { VIEW_TYPE_OB_WORLD_MAP } from './constants'
import type { LatLng } from "leaflet";
import L from 'leaflet'

import Freedraw, { CREATE, EDIT, NONE } from 'leaflet-freedraw';
import FileSaver from 'file-saver';
import 'leaflet-measure';
import 'leaflet-measure/dist/leaflet-measure.css'
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw/dist/leaflet.draw-src.css'
import 'leaflet/dist/leaflet.css';
import 'font-awesome/css/font-awesome.min.css'
import MapPaint from '../MapPaint.js'
import WorldMapPlugin from './main'
import type { overlayTile, coordBounds } from './types'

var map;

export class WorldMapView extends ItemView {
    plugin: WorldMapPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: WorldMapPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.redraw = this.redraw.bind(this);
        this.registerEvent(this.app.workspace.on("file-open", this.redraw));
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

    async redraw() {

        // Create div with map element
        this.containerEl.createDiv({ cls: 'map', attr: { id: 'map' } })
        let mapEl = document.getElementsByClassName('map');

        // Verify if map element available
        if (mapEl[0]) {

            // create div to contain map
            mapEl[0].createDiv({
                cls: 'map', attr: {
                    id: 'map',
                    style: 'position:absolute; top:0px; right:0px; height:100%; width:100%;'
                }
            })
            mapEl[0].setAttribute('style', 'position:absolute; top:0px; right:0px; height:100%; width:100%;')

            // Create the map and set view to center on default zoom
            map = L.map('map', {}).setView([14, -1.8], 5);

            // Add firt tile layer
            let baseLayer = L.tileLayer('app://local/Users/Data/Tiles/{z}/{x}/{y}.png', {
                "attribution": "darakah",
                "maxNativeZoom": 7,
                "maxZoom": 10000,
                "minZoom": 3,
                "noWrap": true,
                "zoomStart": 5
            }).addTo(map);

            // Add area / distance measurement plugin
            let measure_control_main = new L.Control.Measure(
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

            // Add feature groups
            let cities = L.layerGroup();
            let dungeons = L.featureGroup({});
            let assassinGuild = L.featureGroup({});
            let magicalForest = L.featureGroup({});
            let remains = L.featureGroup({});
            let herbalistShop = L.featureGroup({});
            let potionShop = L.featureGroup({});
            let blacksmith = L.featureGroup({});
            let artificer = L.featureGroup({});
            let adventurerGuild = L.featureGroup({});
            let warriorGuild = L.featureGroup({});

            let overlayMaps = {
                "Cities": cities,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Dungeon.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Dungeon": dungeons,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Assassins_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Assassin Guild": assassinGuild,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Magical_Forest.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Magical Forest": magicalForest,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Remains.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Remains": remains,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Herbalist_Shop_2.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Herbalist Shop": herbalistShop,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Potion_Shop.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Potion Shop": potionShop,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Blacksmith_Shop.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Blacksmith": blacksmith,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Artificer_Shop_1.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Artificer": artificer,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Adventurer_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Adventurer Guild": adventurerGuild,
                "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Warrior_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Warrior Guild": warriorGuild
            };

            L.control.layers(null, overlayMaps, { "autoZIndex": true, "collapsed": true, "position": "bottomleft" }).addTo(map);


            map.on('zoomend', function () {
                var zoomlevel = map.getZoom();
                if (zoomlevel < 5) {
                    if (map.hasLayer(cities)) {
                        map.removeLayer(cities);
                    } else {
                        console.log("no point layer active");
                    }
                }
                if (zoomlevel >= 5) {
                    if (map.hasLayer(cities)) {
                        console.log("layer already added");
                    } else {
                        map.addLayer(cities);
                    }
                }
                console.log("Current Zoom Level =" + zoomlevel)
            });

            // Create Map Control Panel
            let controlPanel = document.createElement('div')
            controlPanel.addClass('WorldMapControl')
            controlPanel.setAttribute('id', 'WorldMapControl')
            controlPanel.setAttribute('style', '')

            new MapControlButton({
                target: controlPanel
            })

            let mapControl = L.control({ position: 'topright' });
            mapControl.onAdd = function (map) {
                return controlPanel;
            };

            // Add Listener to filter button to update map data
            let updateButtonEl = controlPanel.getElementsByClassName('ob-world-map-update-button')[0]
            updateButtonEl.addEventListener("click", event => {
                updateMap(this.app.vault.getMarkdownFiles(), this.app.metadataCache, this.app.vault, map, overlayMaps)
            });

            // Add freeDraw plugin
            const freeDraw = new Freedraw({ mode: NONE, smoothFactor: 0.05, elbowDistance: 2, simplifyFactor: 0.05, strokeWidth: 1 });
            map.addLayer(freeDraw);

            // Listeners to control freDraw states
            controlPanel.getElementsByClassName("FreeDrawControl")[0].addEventListener("click", () => {
                if (freeDraw.mode() === 0) {
                    map.addLayer(freeDraw)
                    freeDraw.mode(15);
                } else {
                    freeDraw.mode(0)
                    map.removeLayer(freeDraw)
                }
            });

            controlPanel.getElementsByClassName("freeEdit")[0].addEventListener("click", () => {
                if (!map.hasLayer(freeDraw)) {
                    return;
                }

                if (freeDraw.mode() === 15) {
                    freeDraw.mode(2);
                } else {
                    freeDraw.mode(15)
                }
            });

            // Add Export button for both freeDraw & Draw plugins
            let ExportDraw = L.control({ position: 'bottomright' });
            ExportDraw.onAdd = function (map) {
                let div = L.DomUtil.create('div', 'ExportControl');
                div.innerHTML = `<button style="padding: 10px; position: fixed; bottom: 20px; right: 0px;" ><i class="fa fa-download" id="exportGeo" ></i></button>`;
                return div;
            };
            ExportDraw.addTo(map);

            // Add Draw plugin
            let options = {
                position: "topleft",
                draw: { "circle": false, "marker": false, "polyline": { "allowIntersection": true } },
                edit: {
                    "poly": { "allowIntersection": true },
                    "featureGroup": L.featureGroup(),
                },
            }

            let drawnItems = new L.featureGroup().addTo(
                map
            );

            options.edit.featureGroup = drawnItems;
            new L.Control.Draw(
                options
            ).addTo(map);
            map.on(L.Draw.Event.CREATED, function (e) {
                let layer = e.layer,
                    type = e.layerType;
                let coords = JSON.stringify(layer.toGeoJSON());
                layer.on('click', function () {
                    alert(coords);
                    console.log(coords);
                });
                drawnItems.addLayer(layer);
            });
            map.on('draw:created', function (e) {
                drawnItems.addLayer(e.layer);
            });

            // Data export function for both freeDraw & Draw plugins
            document.getElementById('exportGeo').onclick = function (e) {
                if (freeDraw.mode() != 0) {
                    let blob = new Blob([JSON.stringify(JSON.parse(convertToGeojson(freeDraw.all())), null, 2)], { type: "text/plain;charset=utf-8" });
                    FileSaver.saveAs(blob, "ThisIsMeFile.geojson");
                    freeDraw.clear();
                } else {
                    let data = drawnItems.toGeoJSON();
                    let convertedData = 'text/json;charset=utf-8,'
                        + encodeURIComponent(JSON.stringify(data));
                    console.log(convertedData);
                    document.getElementById('exportGeo').setAttribute(
                        'href', 'data:' + convertedData
                    );
                    document.getElementById('exportGeo').setAttribute(
                        'download', "my_data.geojson"
                    );
                }
            }

            mapControl.addTo(map);

            // Add leaflet Map Paint plugin
            let mapPaint = new MapPaint.SwitchControl({ position: 'topleft' })
            map.addControl(mapPaint);

            for (let i = 0; i < this.plugin.settings.overlayData.length; i++) {
                let coord = this.plugin.settings.overlayData[i].bounds;
                L.imageOverlay(this.plugin.settings.overlayData[i].image,
                    [[coord.northEast.lat, coord.northEast.lng], [coord.southWest.lat, coord.southWest.lng]]).addTo(map);
            }

            map.MapPaint.saveMethod = (image: string, bounds) => {

                let northEast = bounds.getNorthEast();
                let southWest = bounds.getSouthWest();

                let drawData = {
                    image: image,
                    bounds: { northEast: northEast, southWest: southWest },
                    zoom: parseInt(map.getZoom())
                }

                this.plugin.settings.overlayData.push(drawData)
                this.plugin.saveSettings()

                L.imageOverlay(image, [[northEast.lat, northEast.lng], [southWest.lat, southWest.lng]]).addTo(map);

            }

        }
    }
}
