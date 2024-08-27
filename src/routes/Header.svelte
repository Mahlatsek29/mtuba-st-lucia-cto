<script>
	import { auth, db } from "$lib/firebase/firebase";
	import { onMount } from "svelte";
	import { authHandles } from "../store/store";
	import { collection, query, where, getDocs } from "firebase/firestore";
	import { goto } from "$app/navigation";

	let user = null;
	let cartItems = [];

	onMount(() => {
		auth.onAuthStateChanged(async (currentUser) => {
			user = currentUser;
			if (user) {
				await fetchCartItems();
			}
		});
	});

	async function fetchCartItems() {
		if (!user) return;

		const cartQuery = query(
			collection(db, "Cart"),
			where("userId", "==", user.uid),
		);
		const querySnapshot = await getDocs(cartQuery);

		cartItems = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		console.log("Cart items:", cartItems);
	}

	async function handleLogout() {
		try {
			await authHandles.logout();
			cartItems = []; // Clear cart items on logout
			goto("/");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	}

	function navigateToCart() {
		goto("/cart");
	}
</script>

<header class="fixed inset-x-0 top-0 z-50">
	<div class="navbar bg-base-100 justify-between">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            /></svg
          >
					<!-- <img src={logo} alt="SvelteKit" /> -->
				</div>
				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
				>
					<li><a href="/">Home</a></li>
					<li><a href="/shop">Shop</a></li>
					<li><a href="/about">About Us</a></li>
					<li><a href="/contact">Contact Us</a></li>
				</ul>
			</div>
			<img
				class="h-24 w-25 rounded-lg"
				src="favicon.png"
				alt="Thandanani Logo"
			/>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				<li>
					<a
						href="/"
						class="hover:bg-[#f29c3e] transition duration-300"
						>Home</a
					>
				</li>
				<li>
					<a
						href="/shop"
						class="hover:bg-[#f29c3e] transition duration-300 text"
						>Shop</a
					>
				</li>
				<li>
					<a
						href="/about"
						class="hover:bg-[#f29c3e] transition duration-300"
						>About Us</a
					>
				</li>
				<li>
					<a
						href="/contact"
						class="hover:bg-[#f29c3e] transition duration-300"
						>Contact Us</a
					>
				</li>
			</ul>
		</div>
		<div class="navbar-end">
			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn btn-ghost btn-circle"
				>
					<!-- <div class="indicator">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/></svg
						>
						<span class="badge badge-sm indicator-item"
							>{cartItems.length}</span
						>
					</div> -->
				</div>
				<div
					tabindex="0"
					class="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow"
				>
					<div class="card-body">
						<span class="font-bold text-lg"
							>{cartItems.length} Items</span
						>
						<div class="card-actions">
							<button
								on:click={navigateToCart}
								class="btn bg-[#f29c3e] btn-block text-white"
								>View cart</button
							>
						</div>
					</div>
				</div>
			</div>
			<div class="dropdown dropdown-end">
				<div
					tabindex="0"
					role="button"
					class="btn bg-[#f29c3e] btn-circle avatar"
				>
					{#if user}
						<div class="w-10 rounded-full">
							<img
								alt="Tailwind CSS Navbar component"
								src={user.photoURL ||
									"https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"}
							/>
						</div>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							class="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
							/>
						</svg>
					{/if}
				</div>

				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
				>
					{#if user}
						<li>
							<a href="profile" class="justify-between">
								Profile
								<span class="badge">New</span>
							</a>
						</li>
						<li><a on:click={handleLogout}>Logout</a></li>
					{:else}
						<li><a href="/login">Login</a></li>
					{/if}
				</ul>
			</div>
		</div>
	</div>
</header>
