# Home360: 360 virtual tour viewer for interactive real estate walkthroughs

Home360 is an interactive 360-degree panorama viewer that renders multi-room real estate tours in the browser with WebGL.

The application displays equirectangular panorama photography for real estate walkthroughs. Built with Pannellum 2.5.6, Vite 7, and Tailwind CSS v4, Home360 loads 360-degree panoramic scenes with interactive navigation hotspots, camera transitions, and keyboard controls. It runs in modern desktop browsers and mobile touch screens without external plugins or backend servers.

## Architecture

Home360 operates as a client-side single-page application.

- **Rendering engine**: Pannellum 2.5.6 loads equirectangular JPEG images onto a WebGL sphere. The viewer bounds vertical camera pitch between -50 degrees and 50 degrees to prevent polar distortion. Horizontal field of view ranges from 50 degrees to 120 degrees, with a default of 110 degrees (105 degrees in the Lounge, 100 degrees in the Music Room).
- **Navigation graph**: `src/tour.js` coordinates four scenes:
  - `living-room`: Default landing scene. Links to `open-living-kitchen` and `lounge`.
  - `open-living-kitchen`: Links to `living-room`.
  - `lounge`: Links to `living-room` and `music-room`.
  - `music-room`: Links to `lounge`.
- **Scene transitions**: The `navigateToScene` function fades in a black overlay over 400 milliseconds, calls `destroy()` on the active Pannellum viewer, instantiates a new viewer for the target scene, and fades out the overlay when the new panorama finishes loading.
- **Hotspot system**: `createCustomHotspot` inserts DOM markers at exact yaw and pitch coordinates. Each marker includes an arrow icon and a text tooltip indicating the destination room.
- **User interface**: The interface includes a header with room labels, a desktop control panel with zoom and fullscreen toggles, and a bottom button bar for room selection. Tailwind CSS v4 provides styling via `@tailwindcss/vite`.
- **Mobile handling**: For screens narrower than 768 pixels, the application displays touch gesture instructions for 3 seconds. Entering fullscreen on mobile triggers `screen.orientation.lock('landscape')` when supported.

Repository layout:
- `index.html`: Entry markup, DOM containers, CDN script tags, and fallback hotspot styles.
- `src/tour.js`: Scene data, viewer lifecycle, event handlers, and keyboard shortcuts.
- `src/style.css`: Tailwind CSS v4 theme variables, glassmorphic card classes, and keyframe animations.
- `public/panos/`: Four 2:1 equirectangular JPEG images (`living-room.jpg`, `open-living-kitchen.jpg`, `lounge.jpg`, `music-room.jpg`).
- `vite.config.ts`: Vite server configuration with Tailwind plugin, bound to host `0.0.0.0` on port 5173.

## Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 10 (or npm)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/devsanthoshmk/home360.git
cd home360
pnpm install
```

## Usage

### Development server

Start the local development server:

```bash
pnpm dev
```

The Vite dev server starts at `http://localhost:5173` and binds to `0.0.0.0` on port 5173.

### Production build

Build the static site for production deployment:

```bash
pnpm build
```

Vite outputs static assets to the `dist/` directory.

### Preview build

Preview the production build locally:

```bash
pnpm preview
```

### Controls

- **Pan**: Click and drag with a mouse or swipe on a touch screen.
- **Zoom**: Click `+` or `-` in the control panel, or use the mouse scroll wheel.
- **Room hotspots**: Click any circular hotspot in the scene to move to the linked room.
- **Bottom navigation**: Click any room button to jump directly to that space.
- **Keyboard shortcuts**:
  - `ArrowRight` or `n`: Next room
  - `ArrowLeft` or `p`: Previous room
  - `1`, `2`, `3`, `4`: Jump directly to room 1, 2, 3, or 4
  - `f`: Toggle fullscreen mode

## Configuration

### Scene definitions

All room parameters live in `SCENE_CONFIG` inside `src/tour.js`. To add or edit a room, specify:

- `id`: Unique identifier matching the scene key.
- `title`: Room label shown in badges and buttons.
- `description`: Short description shown in navigation buttons.
- `image`: Path to the equirectangular image in `public/panos/`.
- `initialView`: Object containing `yaw` (-180 to 180), `pitch` (-50 to 50), and `hfov` (50 to 120).
- `hotspots`: Array of navigation targets with `pitch`, `yaw`, `targetScene`, and `label`.
- `accentColor`: Hex color assigned to the scene.

Example scene entry:

```javascript
'living-room': {
    id: 'living-room',
    title: 'Living Room',
    description: 'Bright, modern living space with large windows',
    image: '/panos/living-room.jpg',
    initialView: {
        yaw: 0,
        pitch: 0,
        hfov: 110
    },
    hotspots: [
        {
            targetScene: 'open-living-kitchen',
            yaw: -90,
            pitch: -5,
            label: 'Open Living & Kitchen'
        },
        {
            targetScene: 'lounge',
            yaw: 110,
            pitch: 0,
            label: 'Lounge'
        }
    ],
    accentColor: '#6366f1'
}
```

### Server configuration

The Vite server configuration in `vite.config.ts` controls network binding:

```typescript
export default defineConfig({
    plugins: [tailwindcss()],
    server: {
        allowedHosts: true,
        host: '0.0.0.0',
        port: 5173,
    },
})
```

Set `port` to change the listening port, or change `host` to restrict access to localhost.
