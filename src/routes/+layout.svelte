<script>
	import { browser } from "$app/environment";
	import { page } from "$app/stores";
	import { webVitals } from "$lib/vitals";
	import { onMount } from "svelte";
	import "../app.css";
	import { auth, db } from "$lib/firebase/firebase";
	import { doc, getDoc, setDoc } from "firebase/firestore";
	import { authStore } from "../store/store";
	import Header from "./Header.svelte";
	import { goto } from "$app/navigation";

	/** @type {import('./$types').LayoutServerData} */
	export let data;

	$: if (browser && data?.analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId: data.analyticsId,
		});
	}

	const publicRoutes = ["/", "/signup", "/login"];

	function isPublicRoute(path) {
		return publicRoutes.includes(path);
	}

	let authChecked = false;

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			const currentPath = $page.url.pathname;

			if (!user) {
				authStore.update((curr) => ({
					...curr,
					user: null,
					data: {},
					loading: false,
					error: null,
				}));
			} else {
				try {
					const docRef = doc(db, "users", user.uid);
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
						loading: false,
						error: null,
					}));
				} catch (error) {
					console.error("Error fetching user data:", error);
					authStore.update((curr) => ({
						...curr,
						error: "Failed to fetch user data",
						loading: false,
					}));
				}
			}

			authChecked = true;
		});

		return () => unsubscribe();
	});

	$: if (authChecked && $page && $authStore) {
		const currentPath = $page.url.pathname;
		if (!$authStore.user && !isPublicRoute(currentPath)) {
			goto("/");
		} else if (
			$authStore.user &&
			isPublicRoute(currentPath) &&
			currentPath !== "/"
		) {
			goto("/dashboard");
		}
	}
</script>

{#if !authChecked || $authStore.loading}
	<div>Loading...</div>
{:else if $authStore.error}
	<div>Error: {$authStore.error}</div>
{:else}
	<div class="app">
		<!-- <Header /> -->
		<main>
			<slot />
		</main>
	</div>
{/if}

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
		margin: 4rem auto;
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
