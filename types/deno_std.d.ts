declare module "@std/http/file-server" {
  export function serveDir(req: Request, opts?: any): Promise<Response>;
}
