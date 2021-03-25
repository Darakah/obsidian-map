import { WorldMapSettings } from './types';

export const VIEW_TYPE_OB_WORLD_MAP = 'ob_map';

export const SETTINGS: WorldMapSettings = {
    mapTilesPath: 'app://local/Users/Data/Tiles/{z}/{x}/{y}.png',
    overlayTilesPath: 'Resources/Map/',
    mapData: {
        0: {
            0: {

            }
        }
    },
    markerLayers: ['Capital', 'Town', 'City', 'Sea Port', 'Portal', 'Castle', 'Barrack', 'Base',
        'Ruins', 'Guild', 'Shop', 'Dungeon', 'Military', 'Household'],
    tileLayers: ['Cities', 'Borders', 'Main Roads', 'Secondary Roads', 'Waterways', 'Airways'],
    tileLayersActive: ['Political', 'Cultural', 'Religion', 'Rivers']
};