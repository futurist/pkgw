## pkgw
package.json writer

### Usage

Only use this lib from cli:

```
npm install -g pkgw
```

Then use `pkgw` from cli.

```
Usage
  $ pkgw [options] [field[=value]]

  Options
  --version           Show version info
  --help              Show help info
  --plain, -p         Plain mode, without shortcuts
  --dir, -d           Dir (default ./) for the package.json

  Field[=Value]
  Field can be any package.json field, with below shortcuts added:

  v|version[+vpmj]    Display/Update version field
  b|build[+-b]         Display/Update build field

  Examples
  $ pkgw license  # display license field
  $ pkgw license MIT  # set license field
  $ pkgw version  # display version field
  $ pkgw v   # same as above
  $ pkgw vb  # display version_build
  $ pkgw version=2.1.1  # set version field to 2.1.1
  $ pkgw v=2.1.1  # same as above
  $ pkgw v+  # version patch
  $ pkgw vv  # version patch
  $ pkgw vp  # version patch
  $ pkgw vi  # version minor
  $ pkgw vj  # version major
  $ pkgw b   # display build field
  $ pkgw b+  # build field plus 1
```