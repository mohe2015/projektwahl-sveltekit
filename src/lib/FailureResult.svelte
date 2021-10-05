<script lang="ts">
    import { hasErrors } from "./error-handling";
import type { Result } from "./types";

    export let result: Result<unknown>;
</script>

{#if hasErrors(result)}
    <div class="alert alert-danger" role="alert">
        Fehler:<br />
        {#each Object.entries(result.failure) as [attribute, message]}
            {attribute}: {message}<br />
        {/each}
    </div>
{/if}