<script>
  import Button from "$lib/components/ui/button/button.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import Card from "$lib/components/ui/card/card.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Select } from "$lib/components/ui/select";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { auth, db } from "$lib/firebase/firebase";
  import { page } from "$app/stores";
  import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
  import { collection, addDoc, query, where, getDocs, getDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

  import ImageCarousel from "../../ImageCarousel.svelte";
  
  const region = $page.params.region;
  
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
    district: region,
    contact: "",
    emailAddress: "",
    website: "",
    images: [],
  };
   
  onMount(() => {
    auth.onAuthStateChanged((currentUser) => {
      user = currentUser;
      
    });
    
    fetchDirectories();
  });

  $: console.log("dialogOpen changed:", dialogOpen);

  async function fetchDirectories() {
    const directoriesCollection = collection(db, "Directories");
    const q = query(
      directoriesCollection,
      where("district", "==", region),
      where("category", "==", "accommodation"),
    );

    try {
      const directoriesSnapshot = await getDocs(q);
      directories = directoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(
        "Accommodation directories fetched successfully for region:", region,
        directories
      );
       
    } catch (error) {
      console.error("Error fetching accommodation directories: ", error);
    }
  }

  const storage = getStorage();

 
// Function to delete a single image from storage
async function deleteImageFromStorage(imageUrl) {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log("Image deleted successfully from storage");
  } catch (error) {
    console.error("Error deleting image from storage: ", error);
  }
}

// Function to delete all images associated with a directory
async function deleteDirectoryImages(images) {
  for (const imageUrl of images) {
    await deleteImageFromStorage(imageUrl);
  }
}

// Updated handleSaveDirectory function
async function handleSaveDirectory() {
  console.log("handleSaveDirectory called", currentDirectory);

  const directoriesCollection = collection(db, "Directories");
  console.log("currentDirectory.id is ", currentDirectory.id);
  try {
    let imageUrls = [];

    // Upload new images
    for (const image of currentDirectory.images) {
      if (image.startsWith('data:')) { // Check if it's a new image (data URL)
        const imageBlob = await fetch(image).then(res => res.blob());
        const storageRef = ref(storage, `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        await uploadBytes(storageRef, imageBlob);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      } else {
        imageUrls.push(image); // Keep existing image URLs
      }
    }

    if (isEditing && currentDirectory.id) {
      // Get the existing directory data
      const docRef = doc(db, "Directories", currentDirectory.id);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.data();

      // Delete removed images from storage
      const removedImages = existingData.images.filter(img => !imageUrls.includes(img));
      await deleteDirectoryImages(removedImages);

      // Update existing directory
      await updateDoc(docRef, {
        name: currentDirectory.name,
        description: currentDirectory.description,
        category: currentDirectory.category,
        amenities: currentDirectory.amenities,
        district: currentDirectory.district,
        contact: currentDirectory.contact,
        emailAddress: currentDirectory.emailAddress,
        website: currentDirectory.website,
        images: imageUrls,
      });
      console.log("Directory updated successfully!");
    } else {
      // Add new directory
      const newDocRef = await addDoc(directoriesCollection, {
        name: currentDirectory.name,
        description: currentDirectory.description,
        category: currentDirectory.category,
        amenities: currentDirectory.amenities,
        district: currentDirectory.district,
        contact: currentDirectory.contact,
        emailAddress: currentDirectory.emailAddress,
        website: currentDirectory.website,
        images: imageUrls,
      });
      currentDirectory.id = newDocRef.id;
      console.log("New directory added successfully!");
    }

    // Refresh the list of directories
    await fetchDirectories();

    // Close the dialog and reset the form
    dialogOpen = false;
    resetForm();
  } catch (error) {
    console.error("Error saving directory: ", error);
  }
}
  function handleFileChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          currentDirectory.images = [...currentDirectory.images, reader.result];
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function removeImage(index) {
    currentDirectory.images = currentDirectory.images.filter((_, i) => i !== index);
  }

 // Updated handleDeleteDirectory function
async function handleDeleteDirectory(directoryId) {
  if (!directoryId) {
    console.error("Error: Directory ID is null or undefined");
    return;
  }

  if (confirm("Are you sure you want to delete this directory?")) {
    try {
      // Get the directory data
      const docRef = doc(db, "Directories", directoryId);
      const docSnap = await getDoc(docRef);
      const directoryData = docSnap.data();

      // Delete images from storage
      await deleteDirectoryImages(directoryData.images);

      // Delete the document from Firestore
      await deleteDoc(docRef);
      console.log("Directory and associated images deleted successfully!");

      // Refresh the list of directories
      await fetchDirectories();
    } catch (error) {
      console.error("Error deleting directory: ", error);
    }
  }
}


  function handleAddNewDirectory() {
    isEditing = false;
    resetForm();
    dialogOpen = true;
  }

  function handleEditDirectory(directory) {
    isEditing = true;
    currentDirectory = { ...directory };
    dialogOpen = true;
  }

  function resetForm() {
    currentDirectory = {
      id: null,
      name: "",
      description: "",
      category: "accommodation",
      amenities: "",
      district: region,
      contact: "",
      emailAddress: "",
      website: "",
      images: [],
    };
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Accommodation Directories</h1>
    <Button on:click={handleAddNewDirectory}>Add Directory</Button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {#each directories as dir (dir.id)}
      <Card>        
        <ImageCarousel images={dir.images} />
        <div class="p-4">
          <h3 class="text-lg font-bold">{dir.name}</h3>
          <p class="text-gray-500">{dir.district}</p>
          <p class="text-gray-600">{dir.description}</p>
          <p class="text-gray-500 mt-2">Amenities: {dir.amenities}</p>
          <p class="text-gray-500 mt-2">Email: {dir.emailAddress}</p>
          <p class="text-gray-500 mt-2">Website: {dir.website}</p>
        </div>
        <div class="p-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            on:click={() => handleEditDirectory(dir)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            on:click={() => {
              console.log("Delete button clicked. dir object:", dir);
              handleDeleteDirectory(dir.id);
            }}
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
      <Dialog.Title>{isEditing ? "Edit Directory" : "Add New Directory"}</Dialog.Title>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="name">Name</Label>
        <Input
          id="name"
          bind:value={currentDirectory.name}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="description">Description</Label>
        <Textarea
          id="description"
          bind:value={currentDirectory.description}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="amenities">Amenities</Label>
        <Input
          id="amenities"
          bind:value={currentDirectory.amenities}
          class="col-span-3"
        />
      </div>
     
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="contact">Contact</Label>
        <Input
          id="contact"
          bind:value={currentDirectory.contact}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="email">Email</Label>
        <Input
          id="email"
          type="email"
          bind:value={currentDirectory.emailAddress}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="website">Website</Label>
        <Input
          id="website"
          bind:value={currentDirectory.website}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="image">Images</Label>
        <Input
          id="image"
          type="file"
          on:change={handleFileChange}
          class="col-span-3"
          multiple
        />
      </div>
      {#if currentDirectory.images && currentDirectory.images.length > 0}
        <div class="grid grid-cols-4 items-center gap-4">
          <div class="col-span-3 col-start-2">
            {#each currentDirectory.images as image, index}
              <div class="relative mb-2">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  class="max-w-full h-auto"
                />
                <Button on:click={() => removeImage(index)} class="absolute top-0 right-0 p-1">
                  Remove
                </Button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <Dialog.Footer>
      <Button on:click={handleSaveDirectory}>{isEditing ? "Update" : "Add"} Directory</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>