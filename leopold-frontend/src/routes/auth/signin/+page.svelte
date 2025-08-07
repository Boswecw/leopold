<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { authStore, uiStore } from '$lib/stores';
    import { authAPI } from '$lib/api/client';
    import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-svelte';
  
    // Form state
    let email = '';
    let password = '';
    let showPassword = false;
    let isLoading = false;
    let errors: Record<string, string> = {};
  
    // Redirect handling
    let redirectTo = '/';
    
    $: if ($authStore) {
      // User is already authenticated, redirect
      goto(redirectTo);
    }
  
    onMount(() => {
      // Get redirect parameter from URL
      redirectTo = $page.url.searchParams.get('redirect') || '/';
    });
  
    function validateForm(): boolean {
      errors = {};
  
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
  
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
  
      return Object.keys(errors).length === 0;
    }
  
    async function handleSubmit() {
      if (!validateForm() || isLoading) return;
  
      isLoading = true;
  
      try {
        const { user, token } = await authAPI.signIn(email, password);
        
        // Update auth store
        authStore.login(user);
        
        // Show success message
        uiStore.showNotification('success', `Welcome back, ${user.username}!`);
        
        // Redirect to intended page
        goto(redirectTo);
        
      } catch (error: any) {
        console.error('Sign in failed:', error);
        
        if (error.status === 401) {
          errors.general = 'Invalid email or password';
        } else {
          errors.general = error.message || 'Sign in failed. Please try again.';
        }
        
        uiStore.showNotification('error', errors.general);
      } finally {
        isLoading = false;
      }
    }
  
    function togglePasswordVisibility() {
      showPassword = !showPassword;
    }
  
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    }
  </script>
  
  <svelte:head>
    <title>Sign In - Leopold Nature Observer</title>
    <meta name="description" content="Sign in to Leopold Nature Observer to record observations and contribute to wildlife research." />
  </svelte:head>
  
  <div class="auth-page min-h-screen bg-gradient-to-br from-primary-forest via-primary-sky to-secondary-moss flex items-center justify-center p-4">
    <div class="auth-container bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="auth-header bg-gradient-to-r from-primary-forest to-primary-sky text-white p-8 text-center">
        <div class="logo mb-4">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold">L</span>
          </div>
        </div>
        <h1 class="text-2xl font-bold mb-2">Welcome Back</h1>
        <p class="text-primary-sky/80 text-sm">Sign in to Leopold Nature Observer</p>
      </div>
  
      <!-- Form -->
      <div class="auth-form p-8">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                bind:value={email}
                on:keydown={handleKeydown}
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.email ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="email"
              />
            </div>
            {#if errors.email}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.email}
              </p>
            {/if}
          </div>
  
          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                on:keydown={handleKeydown}
                placeholder="Enter your password"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.password ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="current-password"
              />
              <button
                type="button"
                on:click={togglePasswordVisibility}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="w-5 h-5" />
                {:else}
                  <Eye class="w-5 h-5" />
                {/if}
              </button>
            </div>
            {#if errors.password}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.password}
              </p>
            {/if}
          </div>
  
          <!-- General Error -->
          {#if errors.general}
            <div class="error-message bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle class="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            </div>
          {/if}
  
          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="w-full bg-primary-forest hover:bg-primary-forest/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {#if isLoading}
              <div class="spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing In...
            {:else}
              Sign In
              <ArrowRight class="w-5 h-5" />
            {/if}
          </button>
  
          <!-- Forgot Password -->
          <div class="text-center">
            <a
              href="/auth/forgot-password"
              class="text-sm text-primary-forest hover:text-primary-forest/80 transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
  
      <!-- Footer -->
      <div class="auth-footer bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a
            href="/auth/signup"
            class="font-medium text-primary-forest hover:text-primary-forest/80 transition-colors"
          >
            Sign up for free
          </a>
        </p>
      </div>
    </div>
  </div>
  
  <!-- src/routes/auth/signup/+page.svelte -->
  <script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { authStore, uiStore } from '$lib/stores';
    import { authAPI } from '$lib/api/client';
    import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-svelte';
  
    // Form state
    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let showPassword = false;
    let showConfirmPassword = false;
    let agreeToTerms = false;
    let isLoading = false;
    let errors: Record<string, string> = {};
  
    // Password strength indicator
    let passwordStrength = 0;
    $: passwordStrength = calculatePasswordStrength(password);
  
    $: if ($authStore) {
      // User is already authenticated, redirect
      goto('/');
    }
  
    function calculatePasswordStrength(pass: string): number {
      let strength = 0;
      if (pass.length >= 8) strength++;
      if (/[A-Z]/.test(pass)) strength++;
      if (/[a-z]/.test(pass)) strength++;
      if (/[0-9]/.test(pass)) strength++;
      if (/[^A-Za-z0-9]/.test(pass)) strength++;
      return strength;
    }
  
    function getPasswordStrengthLabel(strength: number): string {
      switch (strength) {
        case 0:
        case 1: return 'Weak';
        case 2: return 'Fair';
        case 3: return 'Good';
        case 4:
        case 5: return 'Strong';
        default: return 'Weak';
      }
    }
  
    function getPasswordStrengthColor(strength: number): string {
      switch (strength) {
        case 0:
        case 1: return 'bg-red-500';
        case 2: return 'bg-yellow-500';
        case 3: return 'bg-blue-500';
        case 4:
        case 5: return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    }
  
    function validateForm(): boolean {
      errors = {};
  
      if (!username.trim()) {
        errors.username = 'Username is required';
      } else if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      }
  
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
  
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength < 3) {
        errors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols.';
      }
  
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
  
      if (!agreeToTerms) {
        errors.terms = 'You must agree to the Terms of Service';
      }
  
      return Object.keys(errors).length === 0;
    }
  
    async function handleSubmit() {
      if (!validateForm() || isLoading) return;
  
      isLoading = true;
  
      try {
        const { user, token } = await authAPI.signUp({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password
        });
        
        // Update auth store
        authStore.login(user);
        
        // Show success message
        uiStore.showNotification('success', `Welcome to Leopold, ${user.username}! 🌿`);
        
        // Redirect to home
        goto('/');
        
      } catch (error: any) {
        console.error('Sign up failed:', error);
        
        if (error.status === 409) {
          if (error.message.includes('username')) {
            errors.username = 'Username is already taken';
          } else if (error.message.includes('email')) {
            errors.email = 'Email is already registered';
          } else {
            errors.general = 'Account already exists';
          }
        } else {
          errors.general = error.message || 'Sign up failed. Please try again.';
        }
        
        uiStore.showNotification('error', errors.general || 'Sign up failed');
      } finally {
        isLoading = false;
      }
    }
  
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    }
  </script>
  
  <svelte:head>
    <title>Sign Up - Leopold Nature Observer</title>
    <meta name="description" content="Join Leopold Nature Observer and start contributing to wildlife research and conservation efforts." />
  </svelte:head>
  
  <div class="auth-page min-h-screen bg-gradient-to-br from-secondary-moss via-primary-sky to-primary-forest flex items-center justify-center p-4">
    <div class="auth-container bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="auth-header bg-gradient-to-r from-secondary-moss to-primary-sky text-white p-8 text-center">
        <div class="logo mb-4">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl font-bold">L</span>
          </div>
        </div>
        <h1 class="text-2xl font-bold mb-2">Join Leopold</h1>
        <p class="text-white/80 text-sm">Start your nature observation journey</p>
      </div>
  
      <!-- Form -->
      <div class="auth-form p-8">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Username Field -->
          <div class="form-group">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="text"
                bind:value={username}
                on:keydown={handleKeydown}
                placeholder="naturelover123"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.username ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="username"
              />
            </div>
            {#if errors.username}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.username}
              </p>
            {/if}
          </div>
  
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                bind:value={email}
                on:keydown={handleKeydown}
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.email ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="email"
              />
            </div>
            {#if errors.email}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.email}
              </p>
            {/if}
          </div>
  
          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                on:keydown={handleKeydown}
                placeholder="Create a strong password"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.password ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="new-password"
              />
              <button
                type="button"
                on:click={() => showPassword = !showPassword}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="w-5 h-5" />
                {:else}
                  <Eye class="w-5 h-5" />
                {/if}
              </button>
            </div>
            
            <!-- Password Strength Indicator -->
            {#if password}
              <div class="mt-2">
                <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span>Password strength:</span>
                  <span class="font-medium {passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}">
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300 {getPasswordStrengthColor(passwordStrength)}"
                    style="width: {(passwordStrength / 5) * 100}%"
                  ></div>
                </div>
              </div>
            {/if}
            
            {#if errors.password}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.password}
              </p>
            {/if}
          </div>
  
          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                bind:value={confirmPassword}
                on:keydown={handleKeydown}
                placeholder="Confirm your password"
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors {errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}"
                disabled={isLoading}
                autocomplete="new-password"
              />
              <button
                type="button"
                on:click={() => showConfirmPassword = !showConfirmPassword}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {#if showConfirmPassword}
                  <EyeOff class="w-5 h-5" />
                {:else}
                  <Eye class="w-5 h-5" />
                {/if}
              </button>
            </div>
            {#if confirmPassword && password === confirmPassword}
              <p class="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle class="w-4 h-4" />
                Passwords match
              </p>
            {:else if errors.confirmPassword}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            {/if}
          </div>
  
          <!-- Terms Agreement -->
          <div class="form-group">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={agreeToTerms}
                class="mt-1 rounded border-gray-300 text-primary-forest focus:ring-primary-forest {errors.terms ? 'border-red-500' : ''}"
                disabled={isLoading}
              />
              <span class="text-sm text-gray-600">
                I agree to the 
                <a href="/terms" class="text-primary-forest hover:underline" target="_blank">Terms of Service</a>
                and 
                <a href="/privacy" class="text-primary-forest hover:underline" target="_blank">Privacy Policy</a>
              </span>
            </label>
            {#if errors.terms}
              <p class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle class="w-4 h-4" />
                {errors.terms}
              </p>
            {/if}
          </div>
  
          <!-- General Error -->
          {#if errors.general}
            <div class="error-message bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle class="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            </div>
          {/if}
  
          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="w-full bg-primary-forest hover:bg-primary-forest/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {#if isLoading}
              <div class="spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Account...
            {:else}
              Create Account
              <ArrowRight class="w-5 h-5" />
            {/if}
          </button>
        </form>
      </div>
  
      <!-- Footer -->
      <div class="auth-footer bg-gray-50 px-8 py-6 text-center border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Already have an account?
          <a
            href="/auth/signin"
            class="font-medium text-primary-forest hover:text-primary-forest/80 transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  </div>
  
  <style>
    /* Auth page specific styles */
    .auth-page {
      min-height: 100vh;
      background-attachment: fixed;
    }
  
    .auth-container {
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  
    .auth-header {
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
    }
  
    /* Form animations */
    .form-group {
      animation: fadeInUp 0.3s ease-out;
    }
  
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    /* Input focus effects */
    input:focus {
      box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1);
    }
  
    /* Password strength colors */
    .bg-red-500 { background-color: #ef4444; }
    .bg-yellow-500 { background-color: #eab308; }
    .bg-blue-500 { background-color: #3b82f6; }
    .bg-green-500 { background-color: #22c55e; }
  
    /* Responsive design */
    @media (max-width: 640px) {
      .auth-container {
        margin: 1rem;
        border-radius: 1rem;
      }
      
      .auth-header,
      .auth-form {
        padding: 1.5rem;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .auth-container {
        border: 2px solid #000;
      }
      
      input,
      button {
        border: 2px solid currentColor;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .form-group,
      input,
      button {
        animation: none;
        transition: none;
      }
    }
  </style>