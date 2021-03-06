export interface WorldMapSettings {
    mapTilesPath: string
}

export interface GeoContainer {
	yearStart: number;
    yearEnd: number;
	title: string;
    type: string;
    lat: number;
    long: number;
    class: string;
	img: string;
	innerHTML: string;
	path: string;
}

export type GeoData = GeoContainer[];