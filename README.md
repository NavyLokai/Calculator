# Calculator

A modern, responsive calculator web app built with plain HTML, CSS and JavaScript. No frameworks and no build step, so it runs directly on GitHub Pages.

**Live demo:** https://navylokai.github.io/Calculator/

![Screenshot](screenshot.png)

## Features

- Addition, subtraction, multiplication and division
- Percentage (%), plus/minus (±), square root (√) and square (x²)
- AC (clear), ⌫ (delete last digit) and =
- Display shows the current number and the previous expression (e.g. `12 × 3 =`)
- History of the last 10 calculations, saved in the browser (click one to reuse it)
- Full keyboard support
- Light/dark theme that remembers your choice
- Safe evaluation: no `eval()`; handles floating-point errors (0.1 + 0.2 = 0.3) and division by zero
- Responsive and accessible (ARIA labels, visible focus outlines)

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| 0–9, . | Enter numbers |
| + − * / | Operators |
| Enter or = | Calculate |
| Backspace | Delete last digit |
| Esc | Clear |
| % | Percent |

## Project structure

```
calculator/
├── index.html
├── css/style.css
├── js/calculator.js
├── README.md
├── .gitignore
└── .github/workflows/deploy.yml
```

## Run locally

1. Open the `calculator` folder in VS Code (**File → Open Folder**).
2. Install the **Live Server** extension.
3. Open `index.html` and click **Go Live** in the bottom-right corner.

You can also just double-click `index.html` to open it in a browser.

## Deploy to GitHub Pages

1. Create a new empty repository on GitHub named `calculator`.
2. In the VS Code terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: calculator app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/calculator.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The included workflow deploys the site on every push to `main`.
   (Alternatively choose **Deploy from a branch → main → / (root)** and the workflow isn't needed.)
4. After about a minute the site is live at `https://<your-username>.github.io/calculator/`.

## License

MIT
