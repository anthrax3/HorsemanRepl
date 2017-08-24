# Horseman REPL

This is a REPL for [Horseman.js](http://www.horsemanjs.org/). It could pretty easily be ported over the PhantomJS. It allows you to issue commands to horseman one at a time and view the result afterwards (then loop).

![demo](https://raw.githubusercontent.com/timhuff/HorsemanRepl/master/demo.gif)

## Running

I've decided it's probably not necessary to put this on npm. If anyone would like the ability to install this globally and run a `horseman-repl` shell command to launch the REPL, submit an issue and I'll publish it to npm. To run it, execute these commands:

```
git clone https://github.com/timhuff/HorsemanRepl.git
cd HorsemanRepl
yarn install
yarn start
```

then visit http://localhost:3333, as instructed.

## Debug Console

The debug console is visible at http://localhost:3334
