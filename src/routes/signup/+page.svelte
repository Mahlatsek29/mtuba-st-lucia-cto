<script>
  import { onMount } from 'svelte';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
//   import { auth, db } from '../firebase'; // import your Firebase config
  import { doc, setDoc } from 'firebase/firestore';
  import { Button } from '$lib/components/ui/button';
	import { auth,db } from '$lib/firebase/firebase';

  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';

  async function handleSignUp() {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: user.email,
      });

      alert("Sign-up successful!");
      window.location.href = '/'; // redirect after sign-up
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Error signing up: " + error.message);
    }
  }
</script>

<style>
  /* Include any additional styles if needed */
</style>

<div class="max-w-md mx-auto space-y-6 my-5">
  <div class="space-y-2 text-center">
    <h1 class="text-3xl font-bold">Sign Up</h1>
    <p class="text-gray-500 dark:text-gray-400">Create your account to get started.</p>
  </div>
  <div class="space-y-4">
    <div class="space-y-2">
      <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
      <input id="username" bind:value={username} type="text" placeholder="Enter your username" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    <div class="space-y-2">
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
      <input id="email" bind:value={email} type="email" placeholder="Enter your email" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    <div class="space-y-2">
      <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
      <input id="password" bind:value={password} type="password" placeholder="Enter your password" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    <div class="space-y-2">
      <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
      <input id="confirm-password" bind:value={confirmPassword} type="password" placeholder="Confirm your password" required class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    <Button type="button" on:click={handleSignUp} class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Sign Up
    </Button>
  </div>
  <!-- <hr class="my-8 border-t border-gray-300" /> -->
  <!-- <div class="space-y-4">
    <Button class="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
      <ChromeIcon class="mr-2 h-4 w-4" />
      Sign up with Google
    </Button>
  </div> -->
</div>
