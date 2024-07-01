<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { webVitals } from '$lib/vitals';
	import Header from './Header.svelte';
	import {onMount} from 'svelte'
     import "../app.css";
	import { auth, db } from '$lib/firebase/firebase';
	import { doc, getDoc, setDoc } from 'firebase/firestore';
	import {authStore} from '../store/store'

	/** @type {import('./$types').LayoutServerData} */
	export let data;

	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId: data.analyticsId
		});
	}

	 const nonAuthRoutes = ['/', '/signup','/dashboard','/accomodation'];

onMount(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    const currentPath = window.location.pathname;
    if (!user && !nonAuthRoutes.includes(currentPath)) {
      window.location.href = '/dashboard';
      return;
    }
	if( user && currentPath == '/') {
		window.location.href = '/dashboard';
	}
    if (!user) {
      return;
    }

    let dataToSetToStore = { email: user?.email };
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        dataToSetToStore,
        {
          merge: true
        }
      );
    } else {
      const userData = docSnap.data();
      dataToSetToStore = userData;
    }

    authStore.update((curr) => {
      return {
        ...curr,
        user,
        data: dataToSetToStore,
        loading: false
      };
    });
  });
  
  return () => unsubscribe();
});
</script>

<div class="app">
	<!-- <Header /> -->

	<main>
		<slot />
	</main>

	<!-- <footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer> -->
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		/* max-width: 64rem; */
		margin: 0 auto;
		box-sizing: border-box;
		min-height: 100vh;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
