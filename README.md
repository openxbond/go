# go

Go vanity import path service for `go.xbond.net`, running as a Cloudflare
Worker.

It maps any `go.xbond.net/<repo>[/<subpackage>...]` to
`github.com/openxbond/<repo>`, so:

```sh
go get go.xbond.net/xbox
```

resolves to `github.com/openxbond/xbox`, without needing to list repos
anywhere — any repo name works, and `go get` fails naturally if the target
repo doesn't exist or isn't public.

A plain browser visit (no `?go-get=1`) redirects to the matching
[pkg.go.dev](https://pkg.go.dev) documentation page.

## Development

```sh
npm install
npm run dev     # local dev server
npm run dry-run # validate build/config without deploying
npm run deploy  # deploy to go.xbond.net
```
