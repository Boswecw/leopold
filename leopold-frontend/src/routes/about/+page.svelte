<!-- src/routes/about/+page.svelte -->
<script lang="ts">
    import { TreePine, Camera, Mic, Users, Map, Target, Heart, Leaf } from 'lucide-svelte';
  </script>
  
  <svelte:head>
    <title>About | Leopold Nature Observer</title>
    <meta name="description" content="Learn about Leopold Nature Observer, a community-driven platform for documenting and sharing wildlife observations.">
  </svelte:head>
  
  <!-- Hero Section -->
  <section class="hero bg-gradient-to-r from-green-700 via-green-600 to-blue-600 text-white py-20">
    <div class="container mx-auto px-4 text-center">
      <div class="flex justify-center mb-6">
        <div class="bg-white/20 p-4 rounded-full">
          <TreePine class="w-12 h-12" />
        </div>
      </div>
      <h1 class="text-5xl font-bold mb-6">About Leopold</h1>
      <p class="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
        Named after conservationist Aldo Leopold, our platform empowers citizen scientists to document, 
        share, and learn about the natural world around them. Every observation contributes to our 
        understanding of biodiversity and conservation.
      </p>
    </div>
  </section>
  
  <!-- Mission Section -->
  <section class="mission py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <Target class="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            To democratize nature observation and create a comprehensive, community-driven database 
            of wildlife and plant observations that supports conservation efforts worldwide.
          </p>
        </div>
  
        <div class="grid md:grid-cols-3 gap-8">
          <div class="mission-card text-center p-6">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Community Science</h3>
            <p class="text-gray-700">
              Engage everyday people in scientific research by making nature observation 
              accessible, fun, and meaningful for everyone.
            </p>
          </div>
  
          <div class="mission-card text-center p-6">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Biodiversity Protection</h3>
            <p class="text-gray-700">
              Support conservation efforts by providing researchers and organizations with 
              valuable data on species distribution and behavior patterns.
            </p>
          </div>
  
          <div class="mission-card text-center p-6">
            <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Nature Connection</h3>
            <p class="text-gray-700">
              Foster deeper connections between people and nature through observation, 
              learning, and shared discovery experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="features py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p class="text-lg text-gray-700 max-w-2xl mx-auto">
            Leopold combines cutting-edge technology with user-friendly design to make 
            nature observation accessible to everyone.
          </p>
        </div>
  
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Camera class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Photo Documentation</h3>
            <p class="text-gray-700">
              Capture high-quality images of wildlife and plants with automatic metadata 
              recording including GPS location and timestamp.
            </p>
          </div>
  
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Mic class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Audio Recording</h3>
            <p class="text-gray-700">
              Record bird songs, insect sounds, and other natural audio with advanced 
              spectrogram analysis and species identification.
            </p>
          </div>
  
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Map class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Interactive Maps</h3>
            <p class="text-gray-700">
              Explore observations on interactive maps with clustering, filtering, and 
              real-time updates from the community.
            </p>
          </div>
  
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Target class="w-6 h-6 text-orange-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">AI Species ID</h3>
            <p class="text-gray-700">
              Get instant species suggestions using machine learning models trained on 
              millions of observations and scientific databases.
            </p>
          </div>
  
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Community Sharing</h3>
            <p class="text-gray-700">
              Share discoveries, learn from experts, and participate in citizen science 
              projects with naturalists worldwide.
            </p>
          </div>
  
          <div class="feature-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TreePine class="w-6 h-6 text-teal-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Conservation Impact</h3>
            <p class="text-gray-700">
              Track your contributions to biodiversity research and see how your 
              observations support real conservation projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Aldo Leopold Quote Section -->
  <section class="quote py-16 bg-green-50">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div class="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <TreePine class="w-10 h-10 text-green-600" />
        </div>
        <blockquote class="text-2xl text-gray-800 font-light italic mb-6 leading-relaxed">
          "A thing is right when it tends to preserve the integrity, stability, and beauty 
          of the biotic community. It is wrong when it tends otherwise."
        </blockquote>
        <cite class="text-lg text-gray-600 font-medium">— Aldo Leopold</cite>
        <p class="text-sm text-gray-500 mt-2">A Sand County Almanac (1949)</p>
      </div>
    </div>
  </section>
  
  <!-- Call to Action -->
  <section class="cta py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">Join the Leopold Community</h2>
      <p class="text-xl mb-8 max-w-2xl mx-auto">
        Start documenting nature today and become part of a global movement to understand 
        and protect our planet's incredible biodiversity.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/observations/new"
          class="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-flex items-center justify-center gap-2"
        >
          <Camera class="w-5 h-5" />
          Record First Observation
        </a>
        <a 
          href="/observations"
          class="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold inline-flex items-center justify-center gap-2"
        >
          <Map class="w-5 h-5" />
          Explore Observations
        </a>
      </div>
    </div>
  </section>
  
  <!-- Stats Footer -->
  <section class="stats-footer py-12 bg-gray-900 text-white">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
        <div>
          <div class="text-3xl font-bold text-green-400 mb-2">0+</div>
          <div class="text-gray-400">Observations Recorded</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-blue-400 mb-2">0+</div>
          <div class="text-gray-400">Species Documented</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-purple-400 mb-2">0+</div>
          <div class="text-gray-400">Active Contributors</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-orange-400 mb-2">0+</div>
          <div class="text-gray-400">Conservation Projects</div>
        </div>
      </div>
    </div>
  </section>