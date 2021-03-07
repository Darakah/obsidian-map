<script>
    import TagsInput from "./TagsInput.svelte";
    import TypeInput from "./TypeInput.svelte";
    import Timeline from "./Timeline.svelte";
</script>

<div
    class="leaflet-control-layers leaflet-control-layers-expanded ob-free-draw-settings"
>
    <form>
        <input
            class="leaflet-control-layers-overlays FreeDrawControl"
            id="FreeDrawControl"
            type="checkbox"
        />
        <i class="fa fa-pencil" style="font-size: 1.8em;" />
        <input
            class="leaflet-control-layers-overlays freeEdit"
            id="freeEdit"
            type="checkbox"
        />
        <i class="fa fa-hand-o-down" style="font-size: 1.8em;" />
    </form>
</div>

<TagsInput />

<br />

<TypeInput />

<br />

<div class="world-map-timeline">
    <Timeline />
</div>

<style>
    .world-map-timeline {
        position: absolute;
        bottom: 0px;
        width: 100%;
        padding-bottom: 10px;
    }

    .ob-free-draw-settings {
        background-color: var(--background-primary-alt);
        border: none;
        margin-top: 10px;
    }
</style>
