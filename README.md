# obsidian-map

Use leaflet to generate an interactive map with all geo / temporal tagged notes linked and displayed on the map 

## Example

![example_1](https://raw.githubusercontent.com/Darakah/obsidian-map/main/images/Example_4.png)

## To-Do:

- [ ] Define and implement the following display categories:
* Roads: main-roads, side-roads
* Cities
* Towns
* Political Borders
* Castles

- [ ] Define Zoom level for appearance to each of the categories
- [ ] Define graphic representation for each of the categories
- [ ] Add pop-up with information to each of the categories upon interaction

## Release Notes

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
