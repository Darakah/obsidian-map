import { WorldMapSettings } from './types'

export const VIEW_TYPE_OB_WORLD_MAP = 'ob_map';

export const DEFAULT_SETTINGS: WorldMapSettings = {
    mapTilesPath: 'app://local/Users/Data/Tiles/{z}/{x}/{y}.png',
    overlayData: []
}
