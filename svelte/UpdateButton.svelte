<script>
    // import store variables
    import { getTypes, getTags, getYear } from '../utils'
    import { View, Plugin } from 'obsidian';

    function handleClick() {
        alert(`Tags: ${getTags()} \nTypes: ${getTypes()} \nYear: ${getYear()}`);
    }

    // get all markdown files
</script>

<button class="ob-world-map-update-button" on:click={handleClick}> Filter </button>

<style>
    .ob-world-map-update-button {
        margin-left: 215px;
        margin-right: 10px;
        margin-top: 10px;
        right: 20px;
        background-color: var(--background-secondary-alt);
        border: none;
        border-radius: 7px;
        height: auto;
        font-family: "Comic Sans MS" !important;
        font-size: 15px !important;
    }

    .ob-world-map-update-button:hover {
        top: -2px;
        box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
    }
</style>