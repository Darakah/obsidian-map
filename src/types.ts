import { LatLng } from "leaflet";

export interface WorldMapSettings {
    mapTilesPath: string,
    overlayData: overlayTile[]
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

export type overlayTile = {
    image: string,
    bounds: coordBounds,
    zoom: number
}

export type coordBounds = {
    northEast: LatLng,
    southWest: LatLng
}
export type GeoData = GeoContainer[];