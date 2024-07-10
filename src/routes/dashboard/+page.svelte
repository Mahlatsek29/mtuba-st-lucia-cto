<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import { onMount } from "svelte";
    import { auth, db } from "$lib/firebase/firebase";
    import { collection, getDocs } from "firebase/firestore";
    import { signOut } from "firebase/auth";
    import { goto } from "$app/navigation";
    

    let user = null;
    let directories = [];
    let accommodationCount = 0;
    let activityCount = 0;

    onMount(() => {
        auth.onAuthStateChanged((currentUser) => {
            user = currentUser;
        });
        fetchDirectories();
    });

    async function fetchDirectories() {
        const directoriesCollection = collection(db, "Directories");

        try {
            const directoriesSnapshot = await getDocs(directoriesCollection);
            directories = directoriesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log("Directories fetched successfully!", directories);
            
            accommodationCount = directories.filter(dir => dir.category === "accommodation").length;
            activityCount = directories.filter(dir => dir.category === "activity").length;
        } catch (error) {
            console.error("Error fetching directories: ", error);
        }
    }


    async function handleLogout() {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
            goto("/login"); // Redirect to login page after logout
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }
</script>

<div class="p-6">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Tourism Directories</h1>
        <div class="flex items-center space-x-4">
           
            <Button on:click={handleLogout} variant="outline">Logout</Button>
        </div>
    </div>
     <h3 class="text-2xl font-bold">
                Number of Directories: {directories.length}
            </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-10">

        <div>
            <Card.Root>
                <Card.Header>
                    <Card.Title>Accommodations</Card.Title>
                    
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold">{accommodationCount}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div>

                        <div>
                            <Button href="/accommodations">View</Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
        <div>
            <Card.Root>
                <Card.Header>
                    <Card.Title>Activities</Card.Title>
                   
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold">{activityCount}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div>

                        <div>
                            <Button href="/activities">View</Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
        <div>
            <Card.Root>
                <Card.Header>
                    <Card.Title>News about Accommodations</Card.Title>
                   
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center justify-between">
                        <!-- <div>
                            <div class="text-2xl font-bold">{activityCount}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div> -->

                        <div>
                            <Button href="">View</Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
        <div>
            <Card.Root>
                <Card.Header>
                    <Card.Title>News about Activities</Card.Title>
                   
                </Card.Header>
                <Card.Content>
                    <div class="flex items-center justify-between">
                        <!-- <div>
                            <div class="text-2xl font-bold">{activityCount}</div>
                            <div class="text-muted-foreground">Total</div>
                        </div> -->

                        <div>
                            <Button href="">View</Button>
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
        
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each directories as dir (dir.id)}
            <Card.Root>
                <img
                    src={dir.images ? dir.images[0] : "/placeholder-image.jpg"}
                    alt={dir.name}
                    width={300}
                    height={200}
                    class="w-full h-48 object-cover rounded-t-lg"
                />
                <div class="p-2">
                    <h3 class="text-lg font-bold">{dir.name}</h3>
                    <p class="text-gray-500">{dir.category}</p>
                </div>
            </Card.Root>
        {/each}
    </div>
</div>