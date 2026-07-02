import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const httpMethods = ["get", "post", "put", "patch", "delete"] as const;

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? routeFiles(target)
      : entry.name === "route.ts"
        ? [target]
        : [];
  });
}

function routePath(file: string) {
  const apiRoot = path.join(process.cwd(), "src", "app", "api");
  const directory = path.relative(apiRoot, path.dirname(file));
  return `/api/${directory
    .split(path.sep)
    .map((segment) => segment.replace(/^\[([^.]*)\]$/, "{$1}"))
    .join("/")}`;
}

describe("OpenAPI parity", () => {
  it("documents every concrete Next.js API operation without stale entries", () => {
    const apiRoot = path.join(process.cwd(), "src", "app", "api");
    const actual = routeFiles(apiRoot)
      .filter((file) => !file.includes(`[...all]`))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        const methods = [
          ...source.matchAll(
            /export async function (GET|POST|PUT|PATCH|DELETE)\b/g,
          ),
        ];
        return methods.map((match) => `${match[1]} ${routePath(file)}`);
      })
      .sort();

    const spec = JSON.parse(
      readFileSync(path.join(process.cwd(), "public", "openapi.json"), "utf8"),
    ) as { paths: Record<string, Record<string, unknown>> };
    const documented = Object.entries(spec.paths)
      .filter(([route]) => !route.startsWith("/api/auth/sign-"))
      .flatMap(([route, operations]) =>
        httpMethods
          .filter((method) => method in operations)
          .map((method) => `${method.toUpperCase()} ${route}`),
      )
      .sort();

    expect(documented).toEqual(actual);
  });
});
