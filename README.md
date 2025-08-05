// README.md - Project Documentation
# 🌿 Leopold Nature Observer - Frontend

A modern, responsive web application for wildlife observation and community science, built with SvelteKit and featuring advanced audio processing capabilities.

## ✨ Features

- **Multi-Modal Observations**: Record wildlife through photos, audio, or both
- **Real-Time Audio Processing**: Live waveform and spectrogram visualization
- **Interactive Maps**: Clustered observation display with advanced filtering
- **AI Species Identification**: Powered by computer vision and audio analysis
- **Progressive Web App**: Offline support and native app experience
- **Responsive Design**: Optimized for mobile and desktop use
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Modern browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/leopold-frontend.git
cd leopold-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Environment Configuration

Create a `.env` file with the following variables:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_ENABLE_AUDIO_FEATURES=true
VITE_ENABLE_OFFLINE_MODE=true
```

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── AudioRecorder.svelte
│   │   ├── ObservationMap.svelte
│   │   ├── ObservationForm.svelte
│   │   └── ...
│   ├── stores/              # Svelte stores for state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── api/                # API client and services
├── routes/                 # SvelteKit route pages
│   ├── +layout.svelte      # Main application layout
│   ├── +page.svelte        # Home page (map view)
│   ├── auth/               # Authentication pages
│   └── observations/       # Observation-related pages
├── app.html               # HTML template
├── app.css               # Global styles
└── service-worker.js     # PWA service worker
```

## 🎵 Audio Features

Leopold includes advanced audio processing capabilities:

- **Real-time recording** with Web Audio API
- **Waveform visualization** during recording
- **Spectrogram generation** for frequency analysis
- **Audio feature extraction** for species identification
- **Multiple format support** (WebM, MP4, WAV)

### Audio Requirements

- Modern browser with Web Audio API support
- Microphone permissions
- HTTPS for production deployment (required for getUserMedia)

## 🗺️ Map Integration

Interactive maps powered by Leaflet with:

- **Marker clustering** for performance with large datasets
- **Real-time filtering** by species, date, observation type
- **Audio playback** directly from map popups
- **Responsive design** for mobile and desktop

## 📱 Progressive Web App

Leopold is a full PWA featuring:

- **Offline support** for observation recording
- **Background sync** when connection restored
- **App-like experience** with custom splash screen
- **Push notifications** (planned feature)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Test audio features specifically
npm run audio:test
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview

# Deploy to Vercel
npm run build && vercel deploy
```

## 🎨 Design System

Leopold uses a nature-inspired design system:

- **Forest Green** (#2F5D50) - Primary actions
- **Earth Brown** (#5C4033) - Navigation elements  
- **Sky Blue** (#76B4BD) - Interactive elements
- **Moss Green** (#A3B18A) - Backgrounds
- **Goldenrod** (#DAA520) - Highlights and badges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Named after conservationist Aldo Leopold
- Inspired by citizen science and community-driven research
- Built with modern web technologies for maximum accessibility
- Designed for nature enthusiasts and researchers worldwide

---

**Leopold Nature Observer** - Empowering community science through technology 🌿