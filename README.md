<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PDF Annotation App — README</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* small tweaks for code blocks and layout */
    pre { background: rgba(15,23,42,0.6); padding: 1rem; border-radius: .5rem; overflow:auto; }
    .glass { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); backdrop-filter: blur(6px); }
    .badge { background: linear-gradient(90deg,#06b6d4,#7c3aed); -webkit-background-clip: text; color: transparent; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 leading-relaxed antialiased">
  <div class="max-w-5xl mx-auto p-8">
    <header class="flex items-start gap-6 mb-8">
      <div class="w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l6.16-3.422A12.083 12.083 0 0118 20.25C16.59 20.25 15.25 19.89 14.09 19.23L12 18" />
        </svg>
      </div>
      <div>
        <h1 class="text-3xl font-extrabold">PDF Annotation App <span class="text-slate-400 text-lg font-medium">(Next.js + TypeScript)</span></h1>
        <p class="mt-2 text-slate-400">A clean, modular PDF annotation application — upload, view, draw lines & polygons, zoom, pan, and tile multi-page PDFs.</p>
        <p class="mt-3 text-sm text-slate-400">Built as a Fullstack Developer test task for <span class="font-medium">Permhunt - ZorosAI</span>.</p>
      </div>
    </header>

    <main class="space-y-8">
      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Features</h2>
        <ul class="mt-4 grid gap-2 sm:grid-cols-2">
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> PDF Upload & Rendering</li>
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> Annotation Tools (lines, polygons)</li>
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> Zooming & Panning</li>
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> Tiling / multi-page display</li>
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> Tailwind-powered responsive UI</li>
          <li class="flex items-start gap-3"><span class="text-teal-300">•</span> Clean, modular code for easy extension</li>
        </ul>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Project Structure</h2>
        <pre class="mt-4"><code>src/
 ├── components/
 │   ├── AnnotationCanvas.tsx
 │   ├── AnnotationToolbar.tsx
 │   ├── FileUpload.tsx
 │   ├── PDFAnnotationApp.tsx
 │   └── PDFViewer.tsx
 ├── hooks/
 ├── lib/
 ├── pages/
 └── styles/
</code></pre>
        <p class="mt-3 text-slate-400">Each major responsibility is split into a component so new features or swaps (e.g. switching canvas libraries) remain low-friction.</p>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Main Components</h2>

        <div class="mt-4 space-y-4">
          <article>
            <h3 class="text-lg font-semibold">AnnotationCanvas.tsx</h3>
            <p class="text-slate-400 mt-1">The drawing surface backed by <span class="font-medium">Fabric.js</span>. Manages shapes (lines, polygons), object transform, selection and exports annotation JSON.</p>
            <p class="mt-2 text-sm text-slate-400">Reason: Fabric.js provides an object layer on top of canvas so you can treat shapes as first-class objects (move/scale/rotate) instead of pixel-level drawing.</p>
          </article>

          <article>
            <h3 class="text-lg font-semibold">AnnotationToolbar.tsx</h3>
            <p class="text-slate-400 mt-1">Tool picker for modes like <em>Select</em>, <em>Line</em>, <em>Polygon</em>, <em>Pan</em>, and <em>Zoom</em>. Minimal UI that can be extended with additional tools (text, highlight).</p>
          </article>

          <article>
            <h3 class="text-lg font-semibold">PDFViewer.tsx</h3>
            <p class="text-slate-400 mt-1">Responsible for PDF rendering (per-page). Handles zoom and tiling logic so only the visible pages/tiles are rendered for performance.</p>
          </article>

          <article>
            <h3 class="text-lg font-semibold">FileUpload.tsx</h3>
            <p class="text-slate-400 mt-1">Simple drag-and-drop / input upload wrapper that uses the browser FileReader API. It hands file blobs to the viewer for parsing with PDF.js.</p>
          </article>

          <article>
            <h3 class="text-lg font-semibold">PDFAnnotationApp.tsx</h3>
            <p class="text-slate-400 mt-1">Top-level container that orchestrates file upload → rendering → annotation. It maintains shared state and passes props to the viewer and canvas.</p>
          </article>
        </div>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Tech Stack & Package Choices</h2>
        <ul class="mt-4 space-y-2 text-slate-400">
          <li><span class="font-medium">Next.js + TypeScript</span> — robust routing, static optimization and strong typing for fewer runtime errors.</li>
          <li><span class="font-medium">React + Hooks</span> — predictable component composition and isolated state with custom hooks.</li>
          <li><span class="font-medium">PDF.js</span> — battle-tested PDF renderer used by major projects for accurate page draws.</li>
          <li><span class="font-medium">Fabric.js</span> — object model for canvas; simplifies annotation editing/selection.</li>
          <li><span class="font-medium">TailwindCSS</span> — utility-first styling for fast, consistent UI development.</li>
        </ul>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Scalability & Extensibility</h2>
        <ol class="mt-4 list-decimal ml-5 text-slate-400 space-y-2">
          <li><strong>Modular components</strong> — swap or extend parts with minimal risk.</li>
          <li><strong>Hooks for logic</strong> — share and reuse annotation/zoom logic across screens or features.</li>
          <li><strong>Tiling & lazy render</strong> — only render visible pages to reduce memory/CPU use on large PDFs.</li>
          <li><strong>Annotation persistence</strong> — export/import JSON for versioning, sync and backend storage.</li>
          <li><strong>Real-time collaboration</strong> — add WebSocket sync later without changing core canvas model.</li>
        </ol>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Install & Run</h2>
        <pre class="mt-4"><code># clone
git clone https://github.com/your-username/test-pdf-annotator.git
cd test-pdf-annotator

# install
npm install

# dev
npm run dev

# build
npm run build
</code></pre>
        <p class="mt-3 text-slate-400">Open <span class="font-semibold">http://localhost:3000</span> after running the dev server.</p>
      </section>

      <section class="glass p-6 rounded-2xl shadow-md">
        <h2 class="text-2xl font-semibold">Future Improvements</h2>
        <ul class="mt-4 space-y-2 text-slate-400">
          <li>Text and highlight annotation tools</li>
          <li>Export/import annotations (JSON / SDF / XFDF)</li>
          <li>Backend for collaborative editing and storage</li>
          <li>Mobile / touch optimizations</li>
          <li>Accessibility improvements (keyboard nav, ARIA)</li>
        </ul>
      </section>

      <section class="p-6 rounded-2xl">
        <div class="text-sm text-slate-400">License: <span class="font-medium">MIT</span></div>
      </section>

    </main>

    <footer class="mt-10 text-center text-slate-500 text-sm">
      <div>Prepared for <strong>Permhunt - ZorosAI</strong> • Candidate: <strong>Lordel Cariaga</strong></div>
      <div class="mt-2">Generated README (HTML) — copy into your repo as <code>README.html</code> or link it from GitHub Pages for a nicer presentation.</div>
    </footer>
  </div>
</body>
</html>
