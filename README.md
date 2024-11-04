# Project Setup

We’re using **Vite** as our frontend development tool for fast builds and live reloading. It’s currently set up for local development but can be swapped out if needed.

If you’re new to Node.js, take a look at the `package.json` file. There’s a `"scripts"` section where I’ve added:

```json
"scripts": {
  "front-dev": "vite"
}
```

This allows you to quickly start Vite by running:

    npm run front-dev

Don’t forget to install all dependencies by running:

    npm install

This will install everything listed in package.json that Vite and Express need.

You can start the backend using `npm run start`. It will output the port it's listening on, go to localhost:your_port as a url in a web browser to visit the page.

# Main Entry Point
The main entry point for the application is src/main.js. This is where we set up the Express server and can build out API routes as needed.

# Directory Overview
    public/ – Holds all static files served to the frontend, like HTML, images, and stylesheets.
    public/js/ – Contains frontend JavaScript files for the UI.
    src/ – Holds the main application code and API routes for the backend.
