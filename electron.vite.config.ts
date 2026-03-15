import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: 'dist/main',
            lib: {
                entry: './src/main/index.ts',
                formats: ['cjs'],
            },
            rollupOptions: {
                output: {
                    format: 'cjs',
                },
            },
        },
        resolve: {
            alias: {
                '@main': path.resolve(__dirname, 'src/main'),
                '@renderer': path.resolve(__dirname, 'src/renderer'),
                '@preload': path.resolve(__dirname, 'src/preload'),
                '@shared': path.resolve(__dirname, 'src/shared'),
            },
        },
    },

    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: 'dist/preload',
            lib: {
                entry: './src/preload/index.ts',
                formats: ['cjs'],
            },
            rollupOptions: {
                output: {
                    format: 'cjs',
                },
            },
        },
        resolve: {
            alias: {
                '@preload': path.resolve(__dirname, 'src/preload'),
                '@shared': path.resolve(__dirname, 'src/shared'),
            },
        },
    },

    renderer: {
        root: '.',
        base: './',
        build: {
            outDir: 'dist/renderer',
            rollupOptions: {
                input: {
                    index: './index.html',
                },
            },
        },
        plugins: [react()],
        resolve: {
            alias: {
                '@main': path.resolve(__dirname, 'src/main'),
                '@renderer': path.resolve(__dirname, 'src/renderer'),
                '@preload': path.resolve(__dirname, 'src/preload'),
                '@shared': path.resolve(__dirname, 'src/shared'),
            },
        },
        server: {
            port: 3001,
        },
    },
});
