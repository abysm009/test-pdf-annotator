# 📄 PDF Annotation App

> 🚀 A clean, modular PDF annotation application built with Next.js and TypeScript. Upload, view, draw lines & polygons, zoom, pan, and tile multi-page PDFs with ease.

**Built as a Fullstack Developer test task for Permhunt - ZorosAI** 💼

---

## ✨ Features

- 📤 **PDF Upload & Rendering** - Drag and drop or select PDF files
- 🖊️ **Annotation Tools** - Draw lines and polygons with precision
- 🔍 **Zoom & Pan** - Navigate through documents smoothly  
- 📑 **Multi-page Tiling** - Efficient rendering of large documents
- 📱 **Responsive UI** - Tailwind-powered design that works everywhere
- 🧩 **Modular Architecture** - Clean, extensible codebase

---

## 🏗️ Project Structure

```
src/
├── 📁 components/
│   ├── 🎨 AnnotationCanvas.tsx
│   ├── 🛠️ AnnotationToolbar.tsx
│   ├── 📤 FileUpload.tsx
│   ├── 🏠 PDFAnnotationApp.tsx
│   └── 📖 PDFViewer.tsx
├── 📁 hooks/
├── 📁 lib/
├── 📁 pages/
└── 📁 styles/
```

*Each major responsibility is split into a component so new features or swaps (e.g. switching canvas libraries) remain low-friction.* 🔄

---

## 🔧 Main Components

### 🎨 AnnotationCanvas.tsx
The drawing surface backed by **Fabric.js**. Manages shapes (lines, polygons), object transform, selection and exports annotation JSON.

> **Why Fabric.js?** Provides an object layer on top of canvas so you can treat shapes as first-class objects (move/scale/rotate) instead of pixel-level drawing.

### 🛠️ AnnotationToolbar.tsx
Tool picker for modes like *Select*, *Line*, *Polygon*, *Pan*, and *Zoom*. Minimal UI that can be extended with additional tools (text, highlight).

### 📖 PDFViewer.tsx
Responsible for PDF rendering (per-page). Handles zoom and tiling logic so only the visible pages/tiles are rendered for performance.

### 📤 FileUpload.tsx
Simple drag-and-drop / input upload wrapper that uses the browser FileReader API. It hands file blobs to the viewer for parsing with PDF.js.

### 🏠 PDFAnnotationApp.tsx
Top-level container that orchestrates file upload → rendering → annotation. It maintains shared state and passes props to the viewer and canvas.

---

## 🛠️ Tech Stack

| Technology | Purpose | Badge |
|------------|---------|-------|
| **Next.js + TypeScript** | Robust routing, static optimization and strong typing | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) |
| **React + Hooks** | Predictable component composition and isolated state | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) |
| **PDF.js** | Battle-tested PDF renderer used by major projects | ![PDF.js](https://img.shields.io/badge/PDF.js-FF6B35?style=flat&logo=mozilla&logoColor=white) |
| **Fabric.js** | Object model for canvas; simplifies annotation editing/selection | ![Canvas](https://img.shields.io/badge/Fabric.js-FF6B6B?style=flat&logo=html5&logoColor=white) |
| **TailwindCSS** | Utility-first styling for fast, consistent UI development | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) |

---

## 📈 Scalability & Extensibility

1. **🧩 Modular components** — swap or extend parts with minimal risk
2. **🎣 Hooks for logic** — share and reuse annotation/zoom logic across screens or features
3. **🎯 Tiling & lazy render** — only render visible pages to reduce memory/CPU use on large PDFs
4. **💾 Annotation persistence** — export/import JSON for versioning, sync and backend storage
5. **🔄 Real-time collaboration** — add WebSocket sync later without changing core canvas model

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/abysm009/test-pdf-annotator.git
cd test-pdf-annotator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

🌐 Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

---

## 🔮 Future Improvements

- 📝 Text and highlight annotation tools
- 💾 Export/import annotations (JSON / SDF / XFDF)
- 🌐 Backend for collaborative editing and storage
- 📱 Mobile / touch optimizations
- ♿ Accessibility improvements (keyboard nav, ARIA)
- 🔐 User authentication and permissions
- 🎨 Custom annotation styles and colors
- 📊 Analytics and usage tracking

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 About

**Prepared for:** Permhunt - ZorosAI  
**Developer:** [Lordel Cariaga](https://github.com/abysm009)  
**GitHub:** [@abysm009](https://github.com/abysm009)

---
