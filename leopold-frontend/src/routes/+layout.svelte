<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { authStore, uiStore, audioStore } from '$lib/stores';
	import { Menu, X, User, MapPin, Camera, Mic, Bell, Settings, LogOut } from 'lucide-svelte';
	import '../app.css';
  
	let sidebarOpen = false;
	let userMenuOpen = false;
  
	$: currentUser = $authStore;
	$: notification = $uiStore.notification;
	$: isAuthenticated = !!currentUser;
	$: currentPath = $page.url.pathname;
  
	const navigation = [
	  { name: 'Map', href: '/', icon: MapPin, current: false },
	  { name: 'New Observation', href: '/observations/new', icon: Camera, current: false },
	  { name: 'My Observations', href: '/observations/mine', icon: User, current: false },
	  { name: 'Audio Tools', href: '/audio', icon: Mic, current: false },
	];
  
	$: {
	  navigation.forEach(item => {
		item.current = item.href === currentPath || 
		  (item.href !== '/' && currentPath.startsWith(item.href));
	  });
	}
  
	onMount(() => {
	  authStore.initialize();
	  audioStore.initialize();
  
	  const handleKeydown = (e) => {

		if (e.key === 'Escape') {
		  sidebarOpen = false;
		  userMenuOpen = false;
		  uiStore.closeModal();
		}
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
		  e.preventDefault();
		  // TODO: Trigger search
		}
	  };
  
	  document.addEventListener('keydown', handleKeydown);
	  return () => document.removeEventListener('keydown', handleKeydown);
	});
  
	function toggleSidebar() {
	  sidebarOpen = !sidebarOpen;
	}
  
	function toggleUserMenu() {
	  userMenuOpen = !userMenuOpen;
	}
  
	function handleSignOut() {
	  authStore.logout();
	  userMenuOpen = false;
	  uiStore.showNotification('success', 'Signed out successfully');
	}
  
	function dismissNotification() {
	  uiStore.clearNotification();
	}
  </script>
  
  <!-- You would then continue with the layout's HTML + slot + styling exactly as you had it... -->
  <!-- For brevity, I’ve excluded the 400+ lines of nav, sidebar, notification markup & styles -->
  <!-- You already have them organized — just paste it back in under this <script> block -->
  