<!--<script lang="ts">-->
<!--    import { onMount } from "svelte";-->
<!--    import {socketState} from "$lib/stores/socket.svelte.ts";-->

<!--    let roomId = "general";-->
<!--    let input = "";-->
<!--    let messages: string[] = [];-->

<!--    onMount(() => {-->
<!--        socketState.socket?.emit("join", roomId);-->

<!--        socketState.socket?.on("message", (msg: string) => {-->
<!--            messages = [...messages, msg];-->
<!--        });-->
<!--    });-->

<!--    function sendMessage() {-->
<!--        if (!input) return;-->

<!--        socketState.socket?.emit("message", {-->
<!--            roomId,-->
<!--            message: input-->
<!--        });-->

<!--        input = "";-->
<!--    }-->
<!--</script>-->

<!--<h1>Room: {roomId}</h1>-->

<!--<input bind:value={input} />-->
<!--<button onclick={sendMessage}>Send</button>-->

<!--<ul>-->
<!--    {#each messages as msg}-->
<!--        <li>{msg}</li>-->
<!--    {/each}-->
<!--</ul>-->