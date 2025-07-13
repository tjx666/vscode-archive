import yutengjingEslintConfigTypescript from '@yutengjing/eslint-config-typescript';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    yutengjingEslintConfigTypescript,
    {
        rules: {
            'security/detect-non-literal-fs-filename': 0,
            'n/prefer-global/buffer': 0,
        },
    },
]);
