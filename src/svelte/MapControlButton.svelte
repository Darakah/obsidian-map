<script>
    import "font-awesome/css/font-awesome.min.css";
    import WorldMapControl from "./WorldMapControl.svelte";

    let visibility = "hidden";
    function handleClick() {
        if (visibility == "hidden") {
            visibility = "visible";
            return;
        }
        visibility = "hidden";
    }
</script>

<button class="ob-map-control-button" on:click={handleClick}>
    <i class="fa fa-cogs ob-map-control-button-icon" />
</button>
<div class="ob-map-control" style="visibility: {visibility};">
    <WorldMapControl />
    <button class="ob-world-map-update-button" id="ob-world-map-update-button"
        >Filter</button
    >
</div>

<style>
    .ob-map-control-button {
        width: 40px;
        height: 40px;
        position: fixed;
        top: 10px;
        right: 5px;
        padding: 0px;
        color: var(--bright-orange);
        background-color: var(--background-primary-alt);
        font-weight: bold;
        z-index: 4;
    }

    .ob-map-control-button:hover {
        background-color: var(--background-secondary);
    }

    .ob-map-control-button-icon {
        font-size: 1.8em;
    }

    .ob-map-control {
        opacity: 1;
        z-index: 3;
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: var(--background-primary-alt);
        width: 300px;
        height: 600px;
        border-radius: 8px;
    }
</style>
