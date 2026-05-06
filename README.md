# Austin Roberts Portfolio

This is my personal portfolio site, built with React, TypeScript, and Vite.

The idea was to make something that feels a little more personal than a normal portfolio page: part developer portfolio, part terminal, part clean resume site. The terminal is not just decoration. It accepts commands, types responses out character-by-character, can navigate the site, download the resume, and starts a small message flow through Formspree.

## What It Includes

- React + TypeScript front end
- Vite build setup
- Interactive terminal panel
- Mobile terminal drawer
- Home and experience views
- Resume download link
- Contact/message flow
- Responsive layout
- Open Graph and Twitter card metadata
- Site content generated from a single JSON file

## Running Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Content

Most of the personal content for the site lives in:

```text
src/content/profile.json
```

That file drives the headline, resume content, work experience, contact links, terminal responses, and several of the smaller content blocks across the site. Keeping it in one place makes the site easier to update without digging through components.

## Deployment

This project is set up as a static Vite site. For Cloudflare Pages, the important values are:

```text
Build command: npm run build
Output directory: dist
```

## License

This project is available under the MIT License.

If something here is useful, feel free to borrow from it, adapt it, or use it as a starting point. The personal content, images, resume, and branding are specific to me, so swap those out before using it for your own site.
