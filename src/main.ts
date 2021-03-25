import { View, Plugin } from 'obsidian';
import { SETTINGS, VIEW_TYPE_OB_WORLD_MAP } from './constants';
import { WorldMapSettings } from './types';
import { WorldMapView } from './view';
import { updateMapData } from './utils';
import MapSettingTab from './settings';

export default class WorldMapPlugin extends Plugin {
    settings: WorldMapSettings;
    view: View;
    containerEl: HTMLElement;

    async onload() {
        // Load message		
        await this.loadSettings();
        console.log('Loaded World Map Plugin');

        this.registerEvent(this.app.workspace.on("layout-ready", this.updateData.bind(this)));

        this.addSettingTab(new MapSettingTab(this.app, this));
        this.registerView(VIEW_TYPE_OB_WORLD_MAP, (leaf) => this.view = new WorldMapView(leaf, this));
        this.addRibbonIcon('<i class="fas fa-globe-asia"></i>', "World Map", (e) => this.showPanel()).createEl('i', { cls: "fas fa-globe-asia" });
    }

    showPanel = function () {
        this.app.workspace.getLeaf().setViewState({ type: VIEW_TYPE_OB_WORLD_MAP });
    };

    onunload() {
        console.log('unloading plugin');
    }

    async loadSettings() {
        this.settings = Object.assign({}, SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async updateData() {
        let vault = this.app.vault;
        updateMapData(vault.getFiles(), this.app.metadataCache, vault, this.settings);
        this.saveData(this.settings);
    }
}