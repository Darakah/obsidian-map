<script>
    import TagsInput from "./TagsInput.svelte";
    import TypeInput from "./TypeInput.svelte";
    import Timeline from "./Timeline.svelte";
    import UpdateButton from "./UpdateButton.svelte";
</script>

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
</style>
