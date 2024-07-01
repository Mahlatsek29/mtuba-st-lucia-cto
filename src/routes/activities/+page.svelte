<script>
    import Button from '$lib/components/ui/button/button.svelte';
    import Card from '$lib/components/ui/card/card.svelte';
    import Input from '$lib/components/ui/input/input.svelte';
    import Label from '$lib/components/ui/label/label.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { Dialog } from '$lib/components/ui/dialog';    
    import { Select } from '$lib/components/ui/select';
    import { writable } from 'svelte/store'; 
  

  let directories = writable([
    {
      id: 1,
      name: "Yellowstone National Park",
      location: "Wyoming, USA",
      description: "A vast wilderness with geysers, hot springs, and diverse wildlife.",
      category: "National Park",
      createdAt: "2023-05-01",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    // ... other directory entries
  ]);

  let searchTerm = '';
  let filterCategory = '';
  let editingDirectory = null;
  let newDirectory = {
    name: "",
    location: "",
    description: "",
    category: "",
    imageUrl: "",
  };

  $: filteredDirectories = $directories.filter((dir) => {
    return (
      dir.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === "" || dir.category === filterCategory)
    );
  });

  function handleEditDirectory(directory) {
    editingDirectory = directory;
    newDirectory = directory ? { ...directory } : {
      name: "",
      location: "",
      description: "",
      category: "",
      imageUrl: "",
    };
  }

  function handleSaveDirectory() {
    if (editingDirectory) {
      directories.update(dirs => 
        dirs.map(dir => dir.id === editingDirectory.id ? newDirectory : dir)
      );
    } else {
      const newDir = {
        id: $directories.length + 1,
        ...newDirectory,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      directories.update(dirs => [...dirs, newDir]);
    }
    editingDirectory = null;
    newDirectory = {
      name: "",
      location: "",
      description: "",
      category: "",
      imageUrl: "",
    };
  }

  function handleDeleteDirectory(id) {
    directories.update(dirs => dirs.filter(dir => dir.id !== id));
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Tourism Directories</h1>
    <Button on:click={() => handleEditDirectory(null)}>Add New Directory</Button>
  </div>
  <div class="flex items-center mb-4">
    <Input placeholder="Search directories..." bind:value={searchTerm} class="mr-4" />
    <Select bind:value={filterCategory}>
      <option value="">All Categories</option>
      <option value="National Park">National Park</option>
      <option value="Historic Site">Historic Site</option>
      <option value="Natural Wonder">Natural Wonder</option>
    </Select>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each filteredDirectories as dir (dir.id)}
      <Card>
        <img
          src="/placeholder.svg"
          alt={dir.name}
          width={300}
          height={200}
          class="w-full h-48 object-cover rounded-t-lg"
        />
        <div class="p-4">
          <h3 class="text-lg font-bold">{dir.name}</h3>
          <p class="text-gray-500">{dir.location}</p>
          <p class="text-gray-600">{dir.description}</p>
          <p class="text-gray-500 mt-2">Category: {dir.category}</p>
          <p class="text-gray-500 mt-2">Created: {dir.createdAt}</p>
        </div>
        <div class="p-4">
          <Button variant="outline" size="sm" on:click={() => handleEditDirectory(dir)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" class="ml-2" on:click={() => handleDeleteDirectory(dir.id)}>
            Delete
          </Button>
        </div>
      </Card>
    {/each}
  </div>
</div>

{#if editingDirectory !== null}
  <Dialog open>
    <div slot="header">
      <h2>{editingDirectory ? "Edit Directory" : "Add New Directory"}</h2>
    </div>
    <div slot="body">
      <div class="grid gap-4">
        <div>
          <Label for="name">Name</Label>
          <Input id="name" bind:value={newDirectory.name} />
        </div>
        <div>
          <Label for="location">Location</Label>
          <Input id="location" bind:value={newDirectory.location} />
        </div>
        <div>
          <Label for="description">Description</Label>
          <Textarea id="description" bind:value={newDirectory.description} />
        </div>
        <div>
          <Label for="category">Category</Label>
          <Select id="category" bind:value={newDirectory.category}>
            <option value="">Select a category</option>
            <option value="National Park">National Park</option>
            <option value="Historic Site">Historic Site</option>
            <option value="Natural Wonder">Natural Wonder</option>
          </Select>
        </div>
        <div>
          <Label for="imageUrl">Image URL</Label>
          <Input id="imageUrl" bind:value={newDirectory.imageUrl} />
        </div>
      </div>
    </div>
    <div slot="footer">
      <Button variant="outline" on:click={() => editingDirectory = null}>
        Cancel
      </Button>
      <Button on:click={handleSaveDirectory}>
        {editingDirectory ? "Save Changes" : "Create Directory"}
      </Button>
    </div>
  </Dialog>
{/if}