<script>
    // import { Menu, ChevronDown } from 'lucide-svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    
    let isMenuOpen = false;
    let isDropdownOpen = false;
  </script>
  
  <div class="flex min-h-screen w-full">
    <aside class="fixed inset-y-0 left-0 z-10 flex h-full w-14 flex-col border-r bg-background sm:w-60">
      <div class="flex h-14 items-center justify-center border-b sm:justify-start sm:pl-5">
        <a href="#" class="flex items-center gap-2">
          <!-- <CompassIcon class="h-6 w-6" /> -->
          <span class="text-lg font-semibold sm:block">Tourism Directory</span>
        </a>
      </div>
      <nav class="flex flex-1 flex-col items-start gap-2 overflow-auto px-2 py-4">
        {#each ['Destinations', 'Activities', 'Accommodations', 'Reviews', 'Settings'] as item}
          
        <a    href="#"
            class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <!-- <svelte:component this={{ Destinations: MapPinIcon, Activities: ActivityIcon, Accommodations: HomeIcon, Reviews: StarIcon, Settings: SettingsIcon }[item]} class="h-5 w-5" /> -->
            <span class="text-sm font-medium sm:block">{item}</span>
          </a>
        {/each}
      </nav>
    </aside>
    
    <div class="flex flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
        <button on:click={() => isMenuOpen = !isMenuOpen} class="sm:hidden">
         
          <span class="sr-only">Toggle menu</span>
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold sm:text-xl">Dashboard</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative">
            <button on:click={() => isDropdownOpen = !isDropdownOpen} class="overflow-hidden rounded-full">
              <img src="/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg" width={36} height={36} alt="Avatar" class="rounded-full" />
            </button>
            {#if isDropdownOpen}
              <div class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">My Account</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Support</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Logout</a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </header>
      
      <main class="flex-1 bg-muted/40 p-4 sm:p-6">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each [
            { title: 'Total Destinations', description: 'Number of destinations in the directory', count: 142},
            { title: 'Total Activities', description: 'Number of activities in the directory', count: 87},
            { title: 'Total Accommodations', description: 'Number of accommodations in the directory', count: 215},
            { title: 'Total Reviews', description: 'Number of reviews in the directory', count: 1342}
          ] as card}
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div class="p-6">
                <h3 class="text-lg font-semibold">{card.title}</h3>
                <p class="text-sm text-muted-foreground">{card.description}</p>
              </div>
              <div class="p-6 flex items-center justify-between">
                <div class="text-4xl font-bold">{card.count}</div>
                <!-- <svelte:component this={card.icon} class="h-10 w-10 text-primary" /> -->
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Additional sections (Recent Updates, Quick Actions, Upcoming Events) can be added here following a similar pattern -->
        
      </main>
    </div>
  </div>
  
  <!-- <script context="module">
    function CompassIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" /><circle cx="12" cy="12" r="10" /></svg>`;
    }
  
    function MapPinIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>`;
    }
  
    function ActivityIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg>`;
    }
  
    function HomeIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>`;
    }
  
    function StarIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>`;
    }
  
    function SettingsIcon(props) {
      return `<svg ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>`;
    }
  </script> -->