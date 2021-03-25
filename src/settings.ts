import { App, PluginSettingTab, Setting } from 'obsidian';
import WorldMapPlugin from './main';

export default class MapSettingTab extends PluginSettingTab {
    plugin: WorldMapPlugin;

    constructor(app: App, plugin: WorldMapPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        let inputBaseTiles;
        let inputTiles;
        let addMarker;
        let addBaseOverlay;
        let addActiveOverlay;
        let removeGroup;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'World Map Settings' });

        new Setting(containerEl)
            .setName('Base Map Tiles Path')
            .setDesc('Base map Tiles Path. Absolute/full path not relative to vault.')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {
                    this.plugin.settings.mapTilesPath = inputBaseTiles;
                    inputBaseTiles = '';
                    this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    inputBaseTiles = value.trim();
                }));

        new Setting(containerEl)
            .setName('Overlay Tiles Path')
            .setDesc('Overlay Tiles Path. Relative path inside vault.')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {
                    this.plugin.settings.overlayTilesPath = inputTiles;
                    inputTiles = '';
                    this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    inputTiles = value.trim();
                }));

        new Setting(containerEl)
            .setName('Add Marker Group')
            .setDesc('')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {

                    if (!addMarker || this.plugin.settings.markerLayers.contains(addMarker) || addMarker == "") {
                        return;
                    }

                    this.plugin.settings.markerLayers.push(addMarker);
                    addMarker = '';
                    this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    addMarker = value.trim();
                }));

        new Setting(containerEl)
            .setName('Add Base Overlay Group')
            .setDesc('')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {

                    if (!addBaseOverlay || this.plugin.settings.tileLayers.contains(addBaseOverlay) || addBaseOverlay == "") {
                        return;
                    }

                    this.plugin.settings.tileLayers.push(addBaseOverlay);
                    addBaseOverlay = '';
                    this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    addBaseOverlay = value.trim();
                }));

        new Setting(containerEl)
            .setName('Add Active Overlay Group')
            .setDesc('')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {

                    if (!addActiveOverlay || this.plugin.settings.tileLayersActive.contains(addActiveOverlay) || addActiveOverlay == "") {
                        return;
                    }

                    this.plugin.settings.tileLayersActive.push(addActiveOverlay);
                    addActiveOverlay = '';
                    this.plugin.saveSettings();
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    addActiveOverlay = value.trim();
                }));

        new Setting(containerEl)
            .setName('Remove Group')
            .setDesc('')
            .addButton(text => text
                .setButtonText('Save')
                .onClick(() => {

                    if (this.plugin.settings.tileLayersActive.contains(removeGroup)) {
                        this.plugin.settings.tileLayersActive.splice(this.plugin.settings.tileLayersActive.indexOf(removeGroup), 1);
                        removeGroup = '';
                        this.plugin.saveSettings();
                    }

                    if (this.plugin.settings.tileLayers.contains(removeGroup)) {
                        this.plugin.settings.tileLayers.splice(this.plugin.settings.tileLayers.indexOf(removeGroup), 1);
                        removeGroup = '';
                        this.plugin.saveSettings();
                    }

                    if (this.plugin.settings.markerLayers.contains(removeGroup)) {
                        this.plugin.settings.markerLayers.splice(this.plugin.settings.markerLayers.indexOf(removeGroup), 1);
                        removeGroup = '';
                        this.plugin.saveSettings();
                    }
                }))
            .addText(text => text
                .setPlaceholder('...')
                .onChange(async (value) => {
                    removeGroup = value.trim();
                }));

        new Setting(containerEl)
            .setName('Current Base Map Tiles Path:')
            .setDesc(this.plugin.settings.mapTilesPath);

        new Setting(containerEl)
            .setName('Current Overlay Tiles Path:')
            .setDesc(this.plugin.settings.overlayTilesPath);

        new Setting(containerEl)
            .setName('Marker List:')
            .setDesc(this.plugin.settings.markerLayers.join(" --------- "));

        new Setting(containerEl)
            .setName('Base Overlay List:')
            .setDesc(this.plugin.settings.tileLayers.join(" --------- "));

        new Setting(containerEl)
            .setName('Active Overlay List:')
            .setDesc(this.plugin.settings.tileLayersActive.join(" --------- "));
    }
}
