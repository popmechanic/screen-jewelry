# Screen Jewelry - Cinematic Frame Capture CMS

A web-based content management system for capturing, annotating, and showcasing cinematic moments from video files.

## Features

### Editor/CMS Features
- **Video Playback**: Support for standard video formats (MP4, MOV, MKV, WebM)
- **Frame-by-Frame Navigation**: Precise control with keyboard shortcuts
- **Frame Capture**: Capture still frames at any timestamp
- **Metadata Management**: Add movie information, IMDB links, notes, and tags
- **Content Dashboard**: Manage, search, filter, and publish captures
- **Authentication**: Secure access with magic code authentication

### Public Gallery Features
- **Cinematic Presentation**: Full-screen display with scroll-snap navigation
- **Metadata Display**: Toggle to show/hide movie information
- **Keyboard Navigation**: Arrow keys for browsing, 'I' for info toggle
- **Responsive Design**: Optimized for desktop and mobile viewing

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Database**: InstantDB (real-time sync)
- **Styling**: Tailwind CSS
- **Authentication**: InstantDB Magic Codes
- **Storage**: InstantDB File Storage

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd screen-jewelry
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your InstantDB credentials:
```
NEXT_PUBLIC_INSTANT_APP_ID=your-app-id
INSTANT_ADMIN_TOKEN=your-admin-token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Editors

1. **Sign In**: Navigate to `/editor` and sign in with your email
2. **Upload Video**: Select a video file from your local system
3. **Navigate Frames**:
   - Use spacebar to play/pause
   - Left/Right arrows for frame stepping
   - Shift+Left/Right to skip 10 seconds
4. **Capture Frame**: Press 'C' when paused to capture the current frame
5. **Add Metadata**: Fill in movie details, IMDB link, notes, and tags
6. **Manage Captures**: Visit `/dashboard` to view, edit, publish, or delete captures

### For Viewers

1. **Browse Gallery**: Visit the homepage to see published captures
2. **Navigate**:
   - Use arrow keys or scroll to move between images
   - Press 'I' to toggle metadata display
3. **View Details**: See movie information, timestamp, and IMDB links

## Keyboard Shortcuts

### Video Player
- `Space`: Play/Pause
- `Left Arrow`: Previous frame
- `Right Arrow`: Next frame
- `Shift + Left`: Skip backward 10s
- `Shift + Right`: Skip forward 10s
- `C`: Capture frame (when paused)

### Gallery
- `Arrow Up/Left`: Previous capture
- `Arrow Down/Right`: Next capture
- `I`: Toggle info display

## Project Structure

```
screen-jewelry/
├── app/
│   ├── page.tsx           # Public gallery
│   ├── editor/            # Video editor page
│   ├── dashboard/         # CMS dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── VideoPlayer.tsx    # Video playback component
│   ├── MetadataForm.tsx   # Capture metadata form
│   └── Auth.tsx           # Authentication components
├── lib/
│   └── db.ts              # InstantDB configuration
├── instant.schema.ts      # Database schema
└── public/                # Static assets
```

## Database Schema

### Entities
- **captures**: Stored frame captures with metadata
- **videos**: Video file information
- **$users**: User accounts
- **$files**: Uploaded frame files

### Permissions
- Public viewers can see published captures
- Authenticated users can create and manage their own captures
- Only capture owners can edit or delete their content

## Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.