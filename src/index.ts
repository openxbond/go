/**
 * Go vanity import path service for go.xbond.net.
 *
 * Maps go.xbond.net/<repo>[/<subpackage>...] to github.com/openxbond/<repo>,
 * for any repo name — no allowlist, no lookups. `go get` will simply fail
 * naturally if the target repo doesn't exist or isn't public.
 */

const HOST = "go.xbond.net";
const ORG = "openxbond";
const ORG_URL = `https://github.com/${ORG}`;
const DEFAULT_BRANCH = "main";

// A GitHub repo name: letters, digits, dot, dash, underscore.
const REPO_NAME_RE = /^[A-Za-z0-9._-]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function vanityPage(repo: string, subpath: string): Response {
  const repoUrl = `${ORG_URL}/${repo}`;
  const importRoot = `${HOST}/${repo}`;
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="go-import" content="${escapeHtml(importRoot)} git ${escapeHtml(repoUrl)}">
<meta name="go-source" content="${escapeHtml(importRoot)} ${escapeHtml(repoUrl)} ${escapeHtml(
    repoUrl
  )}/tree/${DEFAULT_BRANCH}{/dir} ${escapeHtml(repoUrl)}/blob/${DEFAULT_BRANCH}{/dir}/{file}#L{line}">
<meta http-equiv="refresh" content="0; url=https://pkg.go.dev/${escapeHtml(importRoot + subpath)}">
</head>
<body>
Redirecting to <a href="https://pkg.go.dev/${escapeHtml(importRoot + subpath)}">pkg.go.dev/${escapeHtml(
    importRoot + subpath
  )}</a>.
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Strip leading/trailing slashes, split into segments.
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return Response.redirect(ORG_URL, 302);
    }

    const [repo, ...rest] = segments;

    if (!REPO_NAME_RE.test(repo)) {
      return new Response("Not found", { status: 404 });
    }

    const subpath = rest.length > 0 ? `/${rest.join("/")}` : "";
    const isGoGet = url.searchParams.get("go-get") === "1";

    if (isGoGet) {
      return vanityPage(repo, subpath);
    }

    // Human/browser or doc-crawler request: send them straight to pkg.go.dev,
    // but still serve the go-import meta tag so tools that don't set
    // ?go-get=1 (rare, but some do a plain GET first) still see it.
    return Response.redirect(`https://pkg.go.dev/${HOST}/${repo}${subpath}`, 302);
  },
} satisfies ExportedHandler;
