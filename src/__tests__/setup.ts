import { loadEnvFile } from 'process'
try { loadEnvFile('.env.local') } catch {}
