# VTK Innovation

Project reports for the VTK Innovation project (NIH 2R01EB014955-09), published as a website with [VitePress](https://vitepress.dev/).

## Read on the web

The site is live at:

**https://patrickoleary.github.io/vtk-innovation/**

- `index.md` is the homepage
- Every `.md` file in `Aim-1/` and `vtk2026/` is a page (e.g. `Aim-1/vtk-wasm/blog.md` → `/Aim-1/vtk-wasm/blog.html`)
- Use the sidebar or the built-in search to navigate

## Edit files

All content is plain Markdown. Edit any `.md` file directly — no special format required.

```sh
git clone git@github.com:patrickoleary/vtk-innovation.git
cd vtk-innovation
```

To preview your changes locally with live reload (optional, requires Node.js):

```sh
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173/vtk-innovation/).

Adding a new `.md` file automatically creates a new page. To add it to the sidebar, edit `.vitepress/config.mjs`.

## Commit to republish

Push to `main` and the site rebuilds and republishes automatically (takes about a minute):

```sh
git add .
git commit -m "Describe your change"
git push
```

You can watch the deployment under the repo's [Actions tab](https://github.com/patrickoleary/vtk-innovation/actions). Once the "Deploy to GitHub Pages" run is green, your changes are live.
