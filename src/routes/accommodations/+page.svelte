<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import { buttonVariants } from "$lib/components/ui/button";
    import Card from "$lib/components/ui/card/card.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import * as Dialog from '$lib/components/ui/dialog';
    import { Select } from "$lib/components/ui/select";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { auth, db } from "$lib/firebase/firebase";
    import {
        getStorage,
        ref,
        uploadBytes,
        getDownloadURL,
    } from "firebase/storage";
  
    import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
    
  
    let user = null;
    let directories = [];
    let isEditing = false;
    let dialogOpen = false;
  
    let currentDirectory = {
        id: null,
        name: "",
        description: "",
        category: "accommodation",
        amenities: "",
        district: "St Lucia",
        contact: "",
        emailAddress: "",
        website: "",
        image: null,
      image2: null,
      image3: null
    };
  
    onMount(() => {
        auth.onAuthStateChanged((currentUser) => {
            user = currentUser;
        });
        fetchDirectories();
    });
  
  
async function fetchDirectories() {
    const directoriesCollection = collection(db, 'Directories');
    
    // Create a query to filter directories where category is "accommodation"
    const q = query(directoriesCollection, where("category", "==", "accommodation"));

    try {
        const directoriesSnapshot = await getDocs(q);
        directories = directoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),     
        }));
        console.log('Accommodation directories fetched successfully!', directories);
    } catch (error) {
        console.error('Error fetching accommodation directories: ', error);
    }
}
  
    const storage = getStorage();
  

    async function handleSaveDirectory() {
    const directoriesCollection = collection(db, 'Directories');

    try {
        let imageUrls = await Promise.all([1, 2, 3].map(async (num) => {
            const image = currentDirectory[`image${num}`];
            if (image instanceof File) {
                const storageRef = ref(storage, `directory-images/${Date.now()}_${image.name}`);
                await uploadBytes(storageRef, image);
                return await getDownloadURL(storageRef);
            } else if (typeof image === 'string' && image.startsWith('http')) {
                return image; // If it's already a URL, return as is
            }
            return null; // If it's neither a File nor a valid URL, set to null
        }));

        const updatedDirectory = {
            ...currentDirectory,
            image: imageUrls[0],
            image2: imageUrls[1],
            image3: imageUrls[2]
        };

        // Remove File objects from updatedDirectory
        delete updatedDirectory.image1;
        delete updatedDirectory.image2;
        delete updatedDirectory.image3;

        // Remove id from updatedDirectory if it's null
        if (updatedDirectory.id === null) {
            delete updatedDirectory.id;
        }

        let savedDirectory;
        if (isEditing && currentDirectory.id) {
            const directoryDoc = doc(directoriesCollection, currentDirectory.id);
            await updateDoc(directoryDoc, updatedDirectory);
            savedDirectory = { id: currentDirectory.id, ...updatedDirectory };
            console.log('Directory updated successfully!');
        } else {
            const docRef = await addDoc(directoriesCollection, updatedDirectory);
            savedDirectory = { id: docRef.id, ...updatedDirectory };
            console.log('Directory added successfully!');
        }

        resetForm();
        await fetchDirectories(); // Refresh the list
        dialogOpen = false;

    } catch (error) {
        console.error('Error saving directory: ', error);
        alert('Error saving directory. Please try again.');
    }
}

function handleFileChange(event, imageNumber) {
    const file = event.target.files[0];
    if (file) {
        currentDirectory[`image${imageNumber}`] = file;
    }
}

function removeImage(imageNumber) {
    currentDirectory[`image${imageNumber === 1 ? '' : imageNumber}`] = null;
}

function resetForm() {
    currentDirectory = {
        id: null,
        name: "",
        description: "",
        category: "accommodation",
        amenities: "",
        district: "St Lucia",
        contact: "",
        emailAddress: "",
        website: "",
        image: null,
        image2: null,
        image3: null
    };
}

  
async function handleDeleteDirectory(directoryId) {
    if (!directoryId) {
        console.error('Error: No directory ID provided for deletion');
        return;
    }

    const directoriesCollection = collection(db, 'Directories');
    try {
        const directoryDoc = doc(directoriesCollection, directoryId);
        await deleteDoc(directoryDoc);
        console.log('Directory deleted successfully!');
        fetchDirectories(); // Fetch updated directory list after deletion
    } catch (error) {
        console.error('Error deleting directory: ', error);
        alert('Error deleting directory. Please try again.');
    }
}
  
    function handleEditDirectory(directory) {
        isEditing = true;
        currentDirectory = { ...directory };
        dialogOpen = true;
    }
  
    function handleAddNewDirectory() {
        isEditing = false;
        resetForm();
        dialogOpen = true;
    }
  
  </script>
  
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Tourism Directories</h1>
        <Button on:click={handleAddNewDirectory}>Add Directory</Button>
    </div>
   
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each directories as dir (dir.id)}
            <Card>
                <img
                    src={dir.image || '/placeholder-image.jpg'}
                    alt={dir.name}
                    width={300}
                    height={200}
                    class="w-full h-48 object-cover rounded-t-lg"
                />
                
                <div class="p-4">
                    <h3 class="text-lg font-bold">{dir.name}</h3>
                    <p class="text-gray-500">{dir.district}</p>
                    <p class="text-gray-600">{dir.description}</p>
                    <p class="text-gray-500 mt-2">Amenities: {dir.amenities}</p>
                    <p class="text-gray-500 mt-2">Email: {dir.emailAddress}</p>
                    <p class="text-gray-500 mt-2">Website: {dir.website}</p>                   
                </div>
                <div class="p-4 flex justify-between">
                    <Button variant="outline" size="sm" on:click={() => handleEditDirectory(dir)}>Edit</Button>
                    <Button
                        variant="outline"
                        size="sm"
                        on:click={() => handleDeleteDirectory(dir.id)}
                    >
                        Delete
                    </Button>
                </div>
            </Card>
        {/each}
    </div>
  </div>
  
  <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
      <Dialog.Header>
        <Dialog.Title>{isEditing ? 'Edit Directory' : 'Add Directory'}</Dialog.Title>
        <Dialog.Description>
          {isEditing ? 'Edit the details of the existing directory.' : 'Fill out the form to add a new tourism directory.'}
        </Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="name">Name of the directory</Label>
          <Input id="name" bind:value={currentDirectory.name} placeholder="Enter directory name" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            bind:value={currentDirectory.description}
            placeholder="Describe the directory"
          />
        </div>
        <div class="grid gap-2">
          <Label for="amenities">Amenities</Label>
          <Input id="amenities" bind:value={currentDirectory.amenities} placeholder="Enter amenities" />
        </div>
        <div class="grid gap-2">
          <Label for="district">District</Label>
          <Input id="district" bind:value={currentDirectory.district} placeholder="Enter district" />
        </div>
        <div class="grid gap-2">
          <Label for="contact">Contact</Label>
          <Input id="contact" bind:value={currentDirectory.contact} placeholder="Enter contact information" />
        </div>
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" bind:value={currentDirectory.emailAddress} placeholder="Enter email address" />
        </div>
        <div class="grid gap-2">
          <Label for="website">Website</Label>
          <Input id="website" bind:value={currentDirectory.website} placeholder="Enter website URL" />
        </div>
        {#each [1, 2, 3] as imageNum}
          <div class="grid gap-2">
            <Label for="image{imageNum}">Directory Image {imageNum}</Label>
            <Input id="image{imageNum}" type="file" accept="image/*" on:change={(e) => handleFileChange(e, imageNum)} />
            {#if currentDirectory[`image${imageNum}`]}
              <div class="relative">
                <img 
                  src={currentDirectory[`image${imageNum}`] instanceof File 
                    ? URL.createObjectURL(currentDirectory[`image${imageNum}`]) 
                    : currentDirectory[`image${imageNum}`]} 
                  alt="Preview {imageNum}" 
                  class="w-full h-32 object-cover rounded" 
                />
                <button
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  on:click={() => removeImage(imageNum)}
                >
                  X
                </button>
              </div>
            {:else}
              <div class="w-full h-32 bg-gray-200 flex items-center justify-center rounded">
                <span class="text-gray-500">No image uploaded</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <Dialog.Footer>
        <Button type="submit" on:click={handleSaveDirectory}>
          {isEditing ? 'Save Changes' : 'Add Directory'}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>