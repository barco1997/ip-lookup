# IP Lookup

A Vue 3 + TypeScript web application that translates IP addresses into geographic locations, showing country and real-time local time.

## Features

- Look up any IPv4 or IPv6 address to find its geographic location
- Add multiple IP rows for simultaneous lookups
- Client-side IP validation with friendly error messages
- Real-time local clock (hh:mm:ss) for each resolved location
- Loading states with disabled inputs during search
- Graceful error handling

## Tech Stack

- **Vue 3**
- **TypeScript**
- **Vite** for fast development and builds
- **Vitest** + **Vue Test Utils** for unit testing
- **ipapi.co** for IP geolocation (free HTTPS, no key required)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start development server      |
| `npm run build`      | Type-check and build for prod |
| `npm run preview`    | Preview production build      |
| `npm test`           | Run tests once                |
| `npm run test:watch` | Run tests in watch mode       |
| `npm run type-check` | Run TypeScript type checking  |
