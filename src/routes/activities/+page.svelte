<script>
  import Button from "$lib/components/ui/button/button.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Select } from "$lib/components/ui/select";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { auth, db } from "$lib/firebase/firebase";
  
  import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
  } from "firebase/storage";
  import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
  } from "firebase/firestore";
    import ImageCarousel from "../ImageCarousel.svelte";

  let user = null;
  let directories = [];
  let isEditing = false;
  let dialogOpen = false;
  let stLuciaRegion = 0;
 let mtubatubaRegion = 0;
 let mfekakiRegion = 0;
 let dukudukuRegion = 0;

  let currentDirectory = {
    id: null,
    name: "",
    description: "",
    category: "activity",
    amenities: "",
    district: "St Lucia",
    contact: "",
    emailAddress: "",
    website: "",
    images: [], // Changed from image to images
  };

  onMount(() => {
    auth.onAuthStateChanged((currentUser) => {
      user = currentUser;
    });
    fetchDirectories();
  });
  

 

  async function fetchDirectories() {
    const directoriesCollection = collection(db, "Directories");
    const q = query(
      directoriesCollection,
      where("category", "==", "activity"),
    );

    try {
      const directoriesSnapshot = await getDocs(q);
      directories = directoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      stLuciaRegion = directories.filter(dir => dir.district === "St Lucia").length;
    mtubatubaRegion = directories.filter(dir => dir.district === "Mtubatuba").length;
    dukudukuRegion = directories.filter(dir => dir.district === "Dukuduku").length;
    mfekakiRegion = directories.filter(dir => dir.district === "Mfekaki").length;
    } catch (error) {
      console.error("Error fetching accommodation directories: ", error);
    }
  }

  const storage = getStorage();

  async function handleSaveDirectory() {
    console.log("handleSaveDirectory called", currentDirectory);

    const directoriesCollection = collection(db, "Directories");
    console.log("currentDirectory.id is ", currentDirectory.id);
    try {
      let imageUrls = [];

      for (const image of currentDirectory.images) {
        const imageBlob = await fetch(image).then(res => res.blob());
        const storageRef = ref(storage, `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        await uploadBytes(storageRef, imageBlob);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      if (isEditing && currentDirectory.id) {
        // Update existing directory
        const docRef = doc(db, "Directories", currentDirectory.id);
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
        currentDirectory.id = newDocRef.id; // Capture the new document ID
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

  function handleEditDirectory(directory) {
    console.log("handleEditDirectory called", directory);
    isEditing = true;
    currentDirectory = { ...directory, id: directory.id };
    console.log("currentDirectory is ", currentDirectory);
    dialogOpen = true;
    console.log("dialogOpen set to", dialogOpen);
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

  async function handleDeleteDirectory(directoryId) {
    if (!directoryId) {
      console.error("Error: Directory ID is null or undefined");
      return;
    }

    if (confirm("Are you sure you want to delete this directory?")) {
      try {
        await deleteDoc(doc(db, "Directories", directoryId));
        console.log("Directory deleted successfully!");

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

  function resetForm() {
    currentDirectory = {
      id: null, // Reset id when adding a new directory
      name: "",
      description: "",
      category: "activity",
      amenities: "",
      district: "St Lucia",
      contact: "",
      emailAddress: "",
      website: "",
      images: [], // Changed from image to images
    };
  }
</script>

<div class="p-6">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Activity Directories</h1>
    <!-- <Button on:click={handleAddNewDirectory}>Add Directory</Button> -->
  </div>
<div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-10"
  >
    <div>
      <Card.Root>
        <Card.Header>
          <Card.Title>Mtubtuba region</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">{mtubatubaRegion}</div>
              <div class="text-muted-foreground">Total</div>
            </div>

            <div>
              <Button href={`/activities/${encodeURIComponent("Mtubatuba")}`}
                >View</Button
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
    <div>
      <Card.Root>
        <Card.Header>
          <Card.Title>St Lucia region</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold">{stLuciaRegion}</div>
              <div class="text-muted-foreground">Total</div>
            </div>

            <div>
              <Button href={`/activities/${encodeURIComponent("St Lucia")}`}
                >View</Button
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
    <div>
      <Card.Root>
        <Card.Header>
          <Card.Title>Dukuduku Region</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div>
                            <div class="text-2xl font-bold">{dukudukuRegion}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div>

            <div>
             <Button href={`/activities/${encodeURIComponent("Dukuduku")}`}
                >View</Button
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
    <div>
      <Card.Root>
        <Card.Header>
          <Card.Title>Mfekaki region</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between">
            <div>
                            <div class="text-2xl font-bold">{mfekakiRegion}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div>

            <div>
              <Button href={`/activities/${encodeURIComponent("Mfekaki")}`}
                >View</Button
              >
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
  >
    {#each directories as dir (dir.id)}
      <Card.Root>
       

          <ImageCarousel images={dir.images} />
        <div class="p-4">
          <h3 class="text-lg font-bold">{dir.name}</h3>
          <p class="text-gray-500">{dir.district}</p>          
          
        </div>
       
      </Card.Root>
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
        <Label class="text-right" for="amenities">Category</Label>
        <Input
          id="amenities"
          bind:value={currentDirectory.amenities}
          class="col-span-3"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label class="text-right" for="district">District</Label>
        <Select
          id="district"
          bind:value={currentDirectory.district}
          class="col-span-3"
        >
          <option value="St Lucia">St Lucia</option>
          <!-- Add more district options here -->
        </Select>
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
