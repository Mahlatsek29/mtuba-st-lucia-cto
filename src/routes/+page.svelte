<script>
	
    import { Input } from "$lib/components/ui/input";
	  import { Label } from "$lib/components/ui/label";
	  import { Button } from "$lib/components/ui/button";
	import { get } from 'svelte/store';
	import { authHandles } from '../store/store';

	let email = '';
	let password = '';
	let errorMessage = '';

	async function handleLogin() {
		try {
			await authHandles.login(email, password);
			// Redirect to the appropriate page after successful login, if needed
			window.location.href = '/'; // Change this to your desired path
		} catch (error) {
			errorMessage = error.message;
		}
	}
</script>
  
  <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-md space-y-6">
	  <div class="space-y-2 text-center">
		<h1 class="text-3xl font-bold">Welcome to CMS Tourism</h1>
		<p class="text-muted-foreground">Sign in to manage your tourism directory</p>
	  </div>
	  {#if errorMessage}
				<div class="text-red-600 text-sm">
					{errorMessage}
				</div>
			{/if}
	  <div class="space-y-4">
		<div class="space-y-2">
		  <Label bind:value={email} for="email">Email</Label>
		  <Input id="email" type="email" placeholder="m@example.com" required />
		</div>
		<div class="space-y-2">
		  <div class="flex items-center justify-between">
			<Label  for="password">Password</Label>
			<a
			  href="#"
			  class="text-sm font-medium underline underline-offset-4 hover:text-primary"
			>
			  Forgot password?
			</a>
		  </div>
		  <Input bind:value={password} id="password" type="password" required />
		</div>
		<Button type="submit" on:click={handleLogin} href="dashboard" class="w-full">			
		  Sign In
		</Button>
		<div class="text-sm text-center mt-4">
			Don't have an account? <a href="/signup" class="text-indigo-600 hover:text-indigo-500"
				>Sign up</a
			>
		</div>
		
	  </div>
	</div>
  </div>