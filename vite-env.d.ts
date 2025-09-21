// FIX: Removed the reference to "vite/client" to resolve a "Cannot find type definition file" error.
// The interfaces below provide the necessary types for import.meta.env.

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
