You are a senior frontend engineer specializing in interactive WebGL and virtual tours.

Your task is to build a complete, production-quality 3D home tour website using pannellum and assets in images folder.

GOAL:
Create a realistic real-estate style 3D home tour demo that showcases engineering quality, UX, and clean code. This is a portfolio/demo project, not a toy.

TECH STACK (MANDATORY):
- Vanilla HTML, tailwind CSS, JavaScript
- Pannellum (via CDN, no build tools)
- already using vite and setted that up too
- Mobile-friendly

ASSETS:
- Use 4 equirectangular 360° panorama images (2:1 ratio)
- Assume images are located at:
  /panos/music-room.jpg
  /panos/living-room.jpg
  /panos/lounge.jpg
  /panos/open-living-kitchen.jpg

ROOM DEFINITIONS:
1. Living Room (default landing scene)
2. Open Living & Kitchen
3. Lounge
4. Music Room / Study

Room mapping (use this exactly)

image 1:

Music Room / Study
- Piano
- Guitar
- Fireplace
- Wood ceiling
- Cozy, private vibe
- Good label: Music Room or Study

image 2:

Living Room
- Bright
- Modern
- Large windows
- TV + sofa setup
- Feels like the main space
- Good label: Living Room
- This should be your default landing scene

image 3:

Lounge / Circular Sitting Area
- Curved sofa
- Central table
- Architectural / luxury feel
- Semi-outdoor vibe
- Good label:
- Lounge
- or Conversation Area
- or Luxury Sitting Area
- (Choose one and stick to it.)

image 4:

Open Living + Kitchen
- Sofas + dining + kitchen visible
- Open-plan layout
- Bright and staged
- Good label:
- Open Living & Kitchen
- or Family Room

FUNCTIONAL REQUIREMENTS:
- Render panoramas correctly in a 360° viewer to ensure that analyse the image one by yourself and after render test it
- Smooth scene transitions
- Scene-to-scene navigation using:
  - Clickable hotspots inside the panorama and use the analysis of the image and place the hotspot by yourself
  - A clean morder elegant UI room selector (buttons like map points)
- Disable extreme pitch to avoid ceiling/floor distortion
- Reasonable FOV defaults (100–110)
- Auto-load first scene
- Graceful mobile behavior (touch, orientation)

UX REQUIREMENTS:
- Clean, modern real-estate aesthetic
- Subtle transitions (fade between scenes)
- Room names visible in UI
- No clutter
- No “next/previous image” slider behavior

SCENE LOGIC:
- Living Room links to:
  - Open Living & Kitchen
  - Lounge
- Open Living & Kitchen links to:
  - Living Room
- Lounge links to:
  - Living Room
  - Music Room
- Music Room links back to:
  - Lounge

QUALITY BAR:
- Code should look like it was written by an experienced engineer
- Readable, modular JS
- No hardcoded magic values without explanation
- Sensible defaults
- Professional naming

DELIVERABLE:
Return the full source code for all files.
Explain briefly (outside the code) how to:
- Add more rooms
- Replace panorama assets
- Tune performance
