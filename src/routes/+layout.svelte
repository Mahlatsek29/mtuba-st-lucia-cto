<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { webVitals } from '$lib/vitals';
	import { onMount } from 'svelte'
    import "../app.css";
	import { auth, db } from '$lib/firebase/firebase';
	import { doc, getDoc, setDoc } from 'firebase/firestore';
	import { authStore } from '../store/store'

	/** @type {import('./$types').LayoutServerData} */
	export let data;

	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId: data.analyticsId
		});
	}

	const nonAuthRoutes = ['/', '/signup'];

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			const currentPath = window.location.pathname;
			if (!user && !nonAuthRoutes.includes(currentPath)) {
				console.log("there is no user and current path is ", currentPath)
				window.location.href = '/';
				return;
			}
			if (user && currentPath == '/') {
				console.log("user is ", user)
				window.location.href = '/dashboard';
			}
			if (!user) {
				return;
			}

			const docRef = doc(db, 'users', user.uid);
			const docSnap = await getDoc(docRef);
			let dataToSetToStore;

			if (!docSnap.exists()) {
				dataToSetToStore = {
					email: user?.email,					
				};
				await setDoc(docRef, dataToSetToStore, { merge: true });
			} else {
				dataToSetToStore = docSnap.data();
			}

			authStore.update((curr) => ({
				...curr,
				user,
				data: dataToSetToStore,
				loading: false
			}));

		
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
