<script>
  export let images = [];
  let currentImageIndex = 0;

  // Function to change the image index every 5 seconds
  function startImageRotation() {
    setInterval(() => {
      currentImageIndex = (currentImageIndex + 1) % images.length;
    }, 5000);
  }

  // Start the image rotation when the component is mounted
  import { onMount } from 'svelte';
  onMount(() => {
    startImageRotation();
  });
  
</script>

<div class="image-carousel">
  {#if images.length > 0}
    <img
      src={images[currentImageIndex]}
      alt={`Image ${currentImageIndex + 1}`}
      class="w-full h-48 object-cover"
    />
  {:else}
    <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
      <span class="text-gray-500">No image available</span>
    </div>
  {/if}
</div>
