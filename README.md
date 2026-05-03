# YouTube Video Listing

A small static web page that lists YouTube-style video metadata from [FreeAPI](https://api.freeapi.app/api/v1/public/youtube/videos) — no API key or backend required.

## Features

- Fetches paginated video data and renders cards with thumbnail, title, channel, views, publish date, and duration.
- Previous / Next pagination aligned with the API’s `page` and `totalPages` fields.
- Loading placeholders and a clear error state if the network request fails.
- Links open the corresponding video on YouTube in a new tab.

## Tech stack

- HTML5, CSS3 (responsive grid, dark theme)
- Vanilla JavaScript (`fetch`, no frameworks)

## Project structure

| File        | Role                                      |
| ----------- | ----------------------------------------- |
| `index.html` | Markup, layout regions, script/style tags |
| `style.css`  | Visual design and responsive layout        |
| `logic.js`   | API calls, parsing, rendering, pagination  |

## How to run

1. Clone or download this folder.
2. Open `index.html` in a modern browser.

If `fetch` to the public API is blocked (for example strict `file://` policies), serve the folder locally:

```bash
cd "/path/to/Youtube videos listing"
npx --yes serve .
```

Then open the URL printed in the terminal (often `http://localhost:3000`).

## API

- **Endpoint:** `https://api.freeapi.app/api/v1/public/youtube/videos`
- **Pagination:** append `?page=1`, `?page=2`, and so on.

Response shape is handled in `logic.js`: each item in `data.data` wraps the video under an `items` property (YouTube-style nested objects).

## Credits

Video thumbnails, titles, and channel names belong to their respective creators on YouTube. This project only displays data returned by FreeAPI for learning and demo purposes.
