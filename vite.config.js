import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      options: {
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: false,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        splitStrings: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
      },
      apply: 'build'
    })
  ],
})
