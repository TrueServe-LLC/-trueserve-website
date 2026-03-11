/**
 * Ambient type declarations for Deno globals when editing Supabase Edge Functions in VS Code.
 * This ensures TypeScript doesn't complain about "Cannot find name 'Deno'" 
 * even if the Deno language server/extension is not fully active.
 */

declare namespace Deno {
  export interface ServeOptions {
    port?: number;
    hostname?: string;
  }
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}
