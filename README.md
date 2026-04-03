# ForgeFit Tracker

ForgeFit Tracker is a simple gym fitness tracker website that also works as an installable Progressive Web App (PWA).

## Features

- Log workouts with name, focus area, duration, effort, and notes
- Save body metrics like weight and body fat percentage
- Track weekly workout goal, workout streak, and weekly minutes
- Works offline after first load with a service worker
- Can be installed on supported phones and desktops like an app

## Run locally

Because this is a PWA, run it from a local web server instead of opening `index.html` directly.

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Publish on the internet

You can deploy this folder as a static site on:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

## Install as an app

After deployment over HTTPS, open the site in Chrome, Edge, or a supported mobile browser and use the browser's install option.

## Files

- `index.html` - app structure
- `styles.css` - responsive styling
- `app.js` - tracker logic and local storage
- `manifest.webmanifest` - app install settings
- `sw.js` - offline caching
