export interface WorldMapSettings {
    mapTilesPath: string,
    overlayTilesPath: string,
    mapData: MapData,
    markerLayers: string[],
    tileLayers: string[],
    tileLayersActive: string[];
}

export interface MapData {
    [yearStart: number]: {
        [yearEnd: string]: {
            [mapLayer: string]: info[];
        };
    };
}

export type info = {
    path: string,
    img: string,
    markerInfo: string[],
    tags: string[],
    coord: number[];
};