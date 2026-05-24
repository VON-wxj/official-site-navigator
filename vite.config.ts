import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, writeFileSync, readFileSync } from 'fs';

function copyManifest() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      mkdirSync(dist, { recursive: true });

      // Copy manifest.json
      copyFileSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'));

      // Copy _locales
      const localesSrc = resolve(__dirname, 'public/_locales');
      const localesDst = resolve(dist, '_locales');
      if (existsSync(localesSrc)) {
        mkdirSync(localesDst, { recursive: true });
        copyRecursive(localesSrc, localesDst);
      }

      // Fix popup HTML: remove crossorigin and use relative paths
      const popupHtml = resolve(dist, 'src/popup/index.html');
      if (existsSync(popupHtml)) {
        let html = readFileSync(popupHtml, 'utf-8');
        // Remove crossorigin from script and link tags (causes issues in extensions)
        html = html.replace(/ crossorigin/g, '');
        // Convert absolute paths to relative for extension compatibility
        html = html.replace(/src="\/assets\//g, 'src="../../assets/');
        html = html.replace(/href="\/assets\//g, 'href="../../assets/');
        // Remove modulepreload links (can cause issues)
        html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
        writeFileSync(popupHtml, html);
      }
    },
  };
}

function copyRecursive(src: string, dst: string) {
  for (const entry of readdirSync(src)) {
    const srcPath = resolve(src, entry);
    const dstPath = resolve(dst, entry);
    if (statSync(srcPath).isDirectory()) {
      mkdirSync(dstPath, { recursive: true });
      copyRecursive(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@background': resolve(__dirname, 'src/background'),
      '@content': resolve(__dirname, 'src/content'),
      '@popup': resolve(__dirname, 'src/popup'),
      '@data': resolve(__dirname, 'src/data'),
    },
  },
  build: {
    outDir: 'dist',
    emptyDirOnBuild: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          if (chunk.name === 'content') return 'content.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
