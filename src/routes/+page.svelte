<script>
	  import { Input } from "$lib/components/ui/input";
	  import { Label } from "$lib/components/ui/label";
	  import { Button } from "$lib/components/ui/button";

  </script>
  
  <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-md space-y-6">
	  <div class="space-y-2 text-center">
		<h1 class="text-3xl font-bold">Welcome to CMS Tourism</h1>
		<p class="text-muted-foreground">Sign in to manage your tourism directory</p>
	  </div>
	  <div class="space-y-4">
		<div class="space-y-2">
		  <Label for="email">Email</Label>
		  <Input id="email" type="email" placeholder="m@example.com" required />
		</div>
		<div class="space-y-2">
		  <div class="flex items-center justify-between">
			<Label for="password">Password</Label>
			<a
			  href="#"
			  class="text-sm font-medium underline underline-offset-4 hover:text-primary"
			>
			  Forgot password?
			</a>
		  </div>
		  <Input id="password" type="password" required />
		</div>
		<Button type="submit" href="dashboard" class="w-full">
			
		  Sign In
		</Button>
	  </div>
	</div>
  </div>