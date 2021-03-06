import type { TFile, MetadataCache, Vault } from 'obsidian'
import type { GeoData, GeoContainer } from './types'
import { tags, types, year } from './svelte/store'
import L from 'leaflet'

/**
 * Verify wether file contains all required tags
 * @param file - TFile of obsidian vault
 * @param tagList - list of all tags to check for
 * @param metadataCache - Vault metadata cache handler
 */
export function FilterMDFiles(file: TFile, tagList: String[], metadataCache: MetadataCache) {
    var fileCache = metadataCache.getFileCache(file);
    let tags = [''];

    if (fileCache && fileCache.tags) {
        tags = fileCache.tags.map(i => i.tag.substring(1,))
    }

    if (fileCache.frontmatter && fileCache.frontmatter.tags) {
        return tagList.every(function (val) { return fileCache.frontmatter.tags.concat(tags).indexOf(val) >= 0; })
    }
    return false;
}

/**
 * Return Geo data for specified file otherwise null
 * @param file - TFile of obsidian vault
 * @param appVault - obsidian vault handler
 */
export async function getFileGeoData(file: TFile, appVault: Vault,): Promise<GeoContainer> {
    // Create a DOM Parser
    const domparser = new DOMParser()
    const doc = domparser.parseFromString(await appVault.read(file), 'text/html')
    let geoData = doc.getElementsByClassName('ob-world-map')

    let element = geoData[0];
    if (!(element instanceof HTMLElement)) {
        return null;
    }

    let dateStart;
    // check if a valid year is specified
    if (element.dataset.datestart == '-') {
        // if it is a negative year
        dateStart = parseInt(element.dataset.datestart.substring(1, element.dataset.datestart.length)) * -1;
    } else {
        dateStart = parseInt(element.dataset.datestart);
    }
    if (!dateStart) {
        return null;
    }

    let dateEnd;
    // check if a valid year is specified
    if (element.dataset.dateend == '-') {
        // if it is a negative year
        dateEnd = parseInt(element.dataset.dateend.substring(1, element.dataset.dateend.length)) * -1;
    } else {
        dateEnd = parseInt(element.dataset.dateend);
    }
    if (!dateEnd) {
        return null;
    }

    // if not title is specified use note name
    let noteTitle = element.dataset.title ?? file.name;
    let noteClass = element.dataset.class ?? "";
    let noteType = element.dataset.type ?? "city"
    let noteLang = parseFloat(element.dataset.loc.split('/')[0]) ?? 0
    let noteLong = parseFloat(element.dataset.loc.split('/')[1]) ?? 0
    let noteImg = element.dataset.img ?? ""
    let notePath = '/' + file.path;

    return {
        yearStart: dateStart,
        yearEnd: dateEnd,
        title: noteTitle,
        type: noteType,
        lat: noteLang,
        long: noteLong,
        class: noteClass,
        img: noteImg,
        innerHTML: element.innerHTML,
        path: notePath
    }
}

/**
 * Filter files based on specified tag list
 * @param fileList - TFile list of obsidian vault
 * @param tagList - list of tags to filter by
 * @param fileCache - obsidian meatadata cache handler
 */
export function filterNotes(fileList: TFile[], tagList: string[], fileCache: MetadataCache): TFile[] {
    return fileList.filter(file => FilterMDFiles(file, tagList, fileCache));
}

/**
 * Return array of parsed tags from world map control panel
 */
export function getTags(): string[] {
    let parsedTags;
    tags.subscribe(value => {
        parsedTags = value.trim().split(';')
    })
    return parsedTags;
}

/**
 * Return current year focus from world map control panel 
 */
export function getYear(): number {
    let yearSelected;
    year.subscribe(value => {
        yearSelected = value
    })
    return yearSelected;
}

/**
 * Return selected types from world map control panel 
 */
export function getTypes(): number {
    let typesSelected;
    types.subscribe(value => {
        typesSelected = value
    })
    return typesSelected;
}

// Delay passed function for specified timeout
export function debounce(func: any, wait?: number, immediate?: boolean) {
    let timeout: number;

    return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = +setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

export async function getMapData(fileList: TFile[], vaultCache: MetadataCache, vault: Vault): Promise<GeoData> {

    let notesFiltered = filterNotes(fileList, getTags(), vaultCache)
    let yearSelect = getYear();
    let geoData = [];
    for (let i = 0; i < notesFiltered.length; i++) {
        let data = await getFileGeoData(notesFiltered[i], vault)
        if (!data) {
            continue;
        }

        if (yearSelect <= data.yearEnd && yearSelect >= data.yearStart) {
            geoData.push(data)
        }
    }
    return geoData;
}

export async function updateMap(fileList: TFile[], vaultCache: MetadataCache, vault: Vault, leafletMap: any) {
    let geoData = await getMapData(fileList, vaultCache, vault)
    console.log(geoData)

    let cities = L.layerGroup();

    for (let i = 0; i < geoData.length; i++) {
        var marker = L.circle([geoData[i].lat, geoData[i].long], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(cities);
    }

    let dungeons = L.featureGroup({});
    let assassinGuild = L.featureGroup({});
    let magicalForest = L.featureGroup({});
    let remains = L.featureGroup({});
    let herbalistShop = L.featureGroup({});
    let potionShop = L.featureGroup({});
    let blacksmith = L.featureGroup({});
    let artificer = L.featureGroup({});
    let adventurerGuild = L.featureGroup({});
    let warriorGuild = L.featureGroup({});

    let overlayMaps = {
        "Cities": cities,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Dungeon.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Dungeon": dungeons,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Assassins_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Assassin Guild": assassinGuild,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Magical_Forest.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Magical Forest": magicalForest,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Remains.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Remains": remains,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Herbalist_Shop_2.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Herbalist Shop": herbalistShop,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Potion_Shop.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Potion Shop": potionShop,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Blacksmith_Shop.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Blacksmith": blacksmith,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Artificer_Shop_1.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Artificer": artificer,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Adventurer_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Adventurer Guild": adventurerGuild,
        "\u003cdiv style=\u0027position: relative; display: inline-block; width: 30px !important; height: 30px\u0027\u003e\u003cimg src=\u0027app://local/Users/gaby/Desktop/Nehlam/Resources/Images/Layer_Warrior_Guild.jpg\u0027width=25px height=25px /\u003e\u003c/div\u003e Warrior Guild": warriorGuild
    };

    L.control.layers(null, overlayMaps, { "autoZIndex": true, "collapsed": true, "position": "bottomleft" }).addTo(leafletMap);

    leafletMap.on('zoomend', function () {
        var zoomlevel = leafletMap.getZoom();
        if (zoomlevel < 5) {
            if (leafletMap.hasLayer(cities)) {
                leafletMap.removeLayer(cities);
            } else {
                console.log("no point layer active");
            }
        }
        if (zoomlevel >= 5) {
            if (leafletMap.hasLayer(cities)) {
                console.log("layer already added");
            } else {
                leafletMap.addLayer(cities);
            }
        }
        console.log("Current Zoom Level =" + zoomlevel)
    });
}