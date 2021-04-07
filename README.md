# obsidian-map

Use leaflet to generate an interactive map with all geo / temporal tagged notes linked and displayed on the map 

## Example

![example_6](https://raw.githubusercontent.com/Darakah/obsidian-map/main/images/Example_6.png)

![example_4](https://raw.githubusercontent.com/Darakah/obsidian-map/main/images/Example_4.png)

## Release Notes

### v0.5.0
- New Geo/Temporal Map Data Structure for much faster Search & Display
- Implemented Overlay Tiles reading & Display
- Implemented Obsidian Notes Geo/Temporal data reading & Display
- Added Styled Controle Layer (https://github.com/davicustodio/Leaflet.StyledLayerControl) to organize Map Controls
- Linked Overlay Tiles to obsidian notes
- Interactive Overlay Tiles (e.g. political overlays)
- Changed year / tag filtering 
- Added Info display div (to display obsidian note linked to each map info)
- Disabled map navigation when inside Info div & Control Pannel div
- Added note Geo/Temporal block info:

```html
<span class="ob-world-map" 
	  data-type="Capital"
	  data-loc="9.380052 / 9.969492"
	  data-dateStart="20"
	  data-dateEnd="90"
	  data-icon="map-marked-alt"
	  data-color="red"
	  data-marker='<img class="map-custom-marker-img" 
		       src="app://local/Users/Resources/Icon/Layer_Potion_Shop.png"/>'/>
```

- Added support for Font awesome markers (https://github.com/lvoogdt/Leaflet.awesome-markers)
- Added support for custom markers specified using `data-marker`
- Added obsidian Settings tab
- Ability to change tile / base tiles path through settings tab
- Ability to Add / Remove new Map Overlay & Marker groups using the settings tab

### v0.4.0
- Add current `Zoom` layer to settings tab
- Add ruler control layer with cutom distances 
- Modify distance measurements for `leaflet-measure` plugin (to custom measurement)
- Add side bar ribbon and remove show world map command
- Add font awesome `globe` icon to ribbon

### v0.3.0
- Removed side panel map control (https://github.com/Darakah/obsidian-map/issues/8)
- Added on-map expandable settings tab which contains freeDraw controls cleaning UI (https://github.com/Darakah/obsidian-map/issues/2)
- Added export option for normal `Draw` plugin (combined into same export based on activation of FreeDraw)
- Implemented data retrival and display on map 
- Added `Map Paint` plugin / modified (https://github.com/SINTEF-9012/Leaflet.MapPaint)
- `Map Paint` images are exported into plugin data and added as additional layers on map load. This allows to expend and add tile layers to base map.
- Bug Fix: https://github.com/Darakah/obsidian-map/issues/9
- Bug Fix: https://github.com/Darakah/obsidian-map/issues/7
- Bug Fix: https://github.com/Darakah/obsidian-map/issues/1

## Support:
[![Github Sponsorship](https://raw.githubusercontent.com/Darakah/Darakah/e0fe245eaef23cb4a5f19fe9a09a9df0c0cdc8e1/icons/github_sponsor_btn.svg)](https://github.com/sponsors/Darakah) [<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/darakah)
