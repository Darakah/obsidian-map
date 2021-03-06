import { App, PluginSettingTab, Setting } from 'obsidian';
import WorldMapPlugin from './main'

export default class MapSettingTab extends PluginSettingTab {
    plugin: WorldMapPlugin;

    constructor(app: App, plugin: WorldMapPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'World Map Settings' });

    }
}
