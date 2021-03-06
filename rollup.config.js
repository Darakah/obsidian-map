import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import autoPreprocess from "svelte-preprocess";
import styles from "rollup-plugin-styles";

export default {
    input: "src/main.ts",
    output: {
        dir: '.',
        sourcemap: 'inline',
        format: 'cjs',
        exports: 'default',
        assetFileNames: "[name]-[hash][extname]"
    },
    external: ["obsidian", "fs", "os", "path"],
    plugins: [
        svelte({
            emitCss: false,
            preprocess: autoPreprocess(),
        }),
        typescript(),
        nodeResolve({ browser: true }),
        commonjs(),
        styles(),
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs({
            include: "node_modules/**",
        }),
    ],
};