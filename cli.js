#!/usr/bin/env node

const fs = require('fs')
const readPkg = require('read-pkg')
const writePkg = require('write-pkg')
const dotProp = require('dot-prop')
const semver = require('semver')
const chalk = require('chalk')
const appInfo = require('./package.json')

const cli = require('meow')(`
version: ${appInfo.version}

Usage
$ ${appInfo.name} [options] [field=[value]]

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
$ ${appInfo.name} license  # display license field
$ ${appInfo.name} license MIT  # set license field
$ ${appInfo.name} version  # display version field
$ ${appInfo.name} v   # same as above
$ ${appInfo.name} vb  # display version_build
$ ${appInfo.name} version=2.1.1  # set version field to 2.1.1
$ ${appInfo.name} v=2.1.1  # same as above
$ ${appInfo.name} v+  # version patch
$ ${appInfo.name} v-  # version patch -1
$ ${appInfo.name} vv  # version patch
$ ${appInfo.name} vp  # version patch
$ ${appInfo.name} vi  # version minor
$ ${appInfo.name} vj  # version major
$ ${appInfo.name} b   # display build field
$ ${appInfo.name} b+  # build field plus 1
`, {
  flags: {
    dir: {
      alias: 'd'
    },
    plain: {
      alias: 'p'
    }
  }
})

const {
  flags,
  input
} = cli
let {
  dir = process.cwd()
} = flags

if(input.length===0){
  cli.showHelp()
}

const pkg = readPkg.sync({cwd: dir, normalize: false})
const SHORTCUTS = {
  v: 'version',
  b: 'build',
  'v+': 'version=patch',
  'v-': 'version=minus',
  vv: 'version=patch',
  vp: 'version=patch',
  vi: 'version=minor',
  vj: 'version=major',
  'b+': 'build=+',
  'b-': 'build=-',
  bb: 'build=+',
}
const FIELD_MAP = {
  v: 'version',
  b: 'build'
}

input.forEach(str => {
  if(str==='vb'){
    const val = dotProp.get(pkg, 'version') + '_' + dotProp.get(pkg, 'build')
    console.log(val)
    return
  }
  let [field, value] = (
    flags.plain ? str : SHORTCUTS[str] || str
  ).split('=')

  if(!flags.plain){
    field = FIELD_MAP[field] || field
  }

  let oldValue = dotProp.get(pkg, field)
  if (value === undefined) {
    // display
    console.log(oldValue)
  } else {
    // update
    let newValue = value
    if(field=='version' && /^\w+$/.test(value)) {
      const arr = oldValue.split('.')
      if(value=='minus' && arr.length>2) {
        arr[2] = parseInt(arr[2]) - 1
        newValue = arr.join('.')
        if(arr[2]<0) {
          throw new Error('version cannot be minus, new value:'+newValue)
        }
      }else {
        newValue = semver.inc(oldValue, value)
      }
    } else if (field=='build' && Number.isInteger(+oldValue)) {
      oldValue = +oldValue
      switch(value) {
        case '+':
          newValue = oldValue + 1
          break;
        case '-':
          newValue = oldValue - 1
          if(newValue<0) {
            throw new Error('build cannot be minus, new value:'+newValue)
          }
          break;
      }
    }
    if(newValue !== oldValue) {
      dotProp.set(pkg, field, newValue)
      console.log(chalk.green('[pkgw] ') + 
        chalk.blue(field) + `: ` +
        chalk.red(oldValue) +
        ` -> ` +
        chalk.red(newValue)
      )
    }
    writePkg.sync(dir, pkg, {normalize: false})
  }
})