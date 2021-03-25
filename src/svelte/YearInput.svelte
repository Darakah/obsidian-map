<script>
    import { year } from "./store.js";
    let input;

    function handleInput() {
        if (input) {
            year.update((e) => parseInt(input.value));
        }
    }
</script>

<div>
    <b style="margin-left:10px;" width="15%"> Year</b>
    <input
        bind:this={input}
        class="mapInput"
        placeholder=" "
        on:input={handleInput}
    />
</div>

<style>
    .mapInput {
        margin-left: 10px;
        margin-right: 10px;
        margin-top: 10px;
        padding-left: 10px;
        padding-bottom: 5px;
        width: 65% !important;
        background-color: var(--background-secondary-alt);
        border: none;
        border-radius: 7px;
        height: auto;
        width: max-content;
        text-rendering: auto;
        color: -internal-light-dark(black, white);
        letter-spacing: normal;
        word-spacing: normal;
        text-transform: none;
        text-indent: 0px;
        text-shadow: none;
        overflow-wrap: break-word;
        color: var(--text-normal);
        appearance: textfield;
        cursor: text;
        font-family: "Comic Sans MS" !important;
        font-size: 15px !important;
    }
</style>
