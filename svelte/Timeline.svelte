<script>
    import RangeSlider from "svelte-range-slider-pips";
    import { year } from "./store.js";

    let bound = [75];
    $: {
        year.update((e) => bound);
    }
</script>

<div>
    <b style="margin-left:10px;" width="15%"> Year </b>
    <b class="world-map-time"> {bound} </b>
</div>
<RangeSlider bind:values={bound} pips suffix=" V.C." />

<style>
    .world-map-time {
        float: right;
        padding-right: 10px;
        color: hsl(46, 77%, 76%);
    }
</style>
