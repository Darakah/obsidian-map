import { ItemView, MarkdownView, WorkspaceLeaf, App, View, Plugin, PluginSettingTab, Setting } from 'obsidian';
import L from 'leaflet';
import Freedraw, { CREATE, EDIT, ALL, NONE } from 'leaflet-freedraw';
import FileSaver from 'file-saver';
import 'leaflet-craft';
import 'leaflet-measure';
import 'leaflet-measure/dist/leaflet-measure.css'
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw/dist/leaflet.draw-src.css'
import 'leaflet-craft';
import 'leaflet/dist/leaflet.css';

interface CommentsSettings {
    SHOW_RIBBON: boolean;
    DEFAULT_COLOR: string;
    DEFAULT_BACKGROUND_COLOR: string;
}

const DEFAULT_SETTINGS: CommentsSettings = {
    SHOW_RIBBON: true,
    DEFAULT_COLOR: '#b30202',
    DEFAULT_BACKGROUND_COLOR: '#FFDE5C'
}

// Delay passed function for specified timeout
function debounce(func: any, wait?: number, immediate?: boolean) {
    let timeout: number;

    return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = +setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

const VIEW_TYPE_OB_COMMENTS = 'ob_comments';
class CommentsView extends ItemView {

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.redraw = this.redraw.bind(this);
        this.redraw_debounced = this.redraw_debounced.bind(this);
        //this.containerEl = this.containerEl;
        this.containerEl.createDiv({ cls: 'map', attr: { id: 'map' } })
    }

    getViewType(): string {
        return VIEW_TYPE_OB_COMMENTS;
    }

    getDisplayText(): string {
        return "Comments";
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

        for(let i=0; i < FreeDrawOut.length; i++){
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
            var map = L.map('map', {}).setView([14, -1.8], 5);

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

            const freeDraw = new Freedraw({ mode: NONE, smoothFactor: 0.1, elbowDistance: 2, simplifyFactor: 0.1, strokeWidth: 1 });
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
                    let blob = new Blob([JSON.stringify(JSON.parse(this.convertToGeojson(freeDraw.all())),null,2)], {type: "text/plain;charset=utf-8"});
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

export default class CommentsPlugin extends Plugin {
    settings: CommentsSettings;
    view: View;
    containerEl: HTMLElement;

    async onload() {
        // Load message		
        await this.loadSettings();
        console.log('Loaded Comments Plugin');
        this.addSettingTab(new CommentsSettingTab(this.app, this));

        this.registerView(VIEW_TYPE_OB_COMMENTS, (leaf) => this.view = new CommentsView(leaf));
        this.addCommand({
            id: "show-comments-panel",
            name: "Open Comments Panel",
            callback: () => this.showPanel()
        });

        this.addCommand({
            id: "add-comment",
            name: "Add Comment",
            callback: () => this.addComment()
        });

        if (this.settings.SHOW_RIBBON) {
            this.addRibbonIcon('lines-of-text', "Show Comments Panel", (e) => this.showPanel());
        }
    }

    showPanel = function () {
        this.app.workspace.getLeaf().setViewState({ type: VIEW_TYPE_OB_COMMENTS })
    }

    onunload() {
        console.log('unloading plugin');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    addComment() {
        let editor = this.getEditor();
        const lines = this.getLines(editor);
        if (!lines) return;
        this.setLines(editor, ['<label class="ob-comment" title="" style=""> ' + lines + ' <input type="checkbox"> <span style=""> Comment </span></label>']);
    }

    getEditor(): CodeMirror.Editor {
        let view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;

        let cm = view.sourceMode.cmEditor;
        return cm;
    }

    getLines(editor: CodeMirror.Editor): string[] {
        if (!editor) return;
        const selection = editor.getSelection();
        return [selection];
    }

    setLines(editor: CodeMirror.Editor, lines: string[]) {
        const selection = editor.getSelection();
        if (selection != "") {
            editor.replaceSelection(lines.join("\n"));
        } else {
            editor.setValue(lines.join("\n"));
        }
    }
}

class CommentsSettingTab extends PluginSettingTab {
    plugin: CommentsPlugin;

    constructor(app: App, plugin: CommentsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Comments Plugin Settings' });

        new Setting(containerEl)
            .setName('Default text color')
            .setDesc("Change from the style.css in the package folder")
            .addText(text => text
                .setPlaceholder("....")
                .setValue('')
                .onChange(async (value) => {
                    this.plugin.settings.DEFAULT_COLOR = value;
                }));

        new Setting(containerEl)
            .setName('Default background color')
            .setDesc('Change from the style.css in the package folder')
            .addText(text => text
                .setPlaceholder("....")
                .setValue('')
                .onChange(async (value) => {
                    this.plugin.settings.DEFAULT_BACKGROUND_COLOR = value;
                }));

        new Setting(containerEl)
            .setName('Hide Comment Plugin Ribbon')
            .setDesc('After changing this setting unload then reload the plugin for the change to take place')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.SHOW_RIBBON);
                toggle.onChange(async (value) => {
                    this.plugin.settings.SHOW_RIBBON = value;
                    await this.plugin.saveSettings();
                });
            });
    }
}
