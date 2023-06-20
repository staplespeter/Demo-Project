import path from 'path';
import { fileURLToPath } from 'url';

export default {
    isProduction: () => { return process.env.NODE_ENV?.toLowerCase() === 'production' },
    getModuleDir: () => { return path.dirname(fileURLToPath(import.meta.url)) }
}