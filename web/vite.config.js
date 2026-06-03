import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Your default entry point
        main: resolve(__dirname, 'index.html'), 
        
        // Option A: An additional HTML page in the root directory
        residency: resolve(__dirname, 'residency.html')
      }
    }
  },
  base: "./",
  plugins: [],
  // Optional: Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
       scss: {
         silenceDeprecations: [
           'import',
           'mixed-decls',
           'color-functions',
           'global-builtin',
         ],
       },
    },
 },
})
