# history-buffer

Store and navigate a historical list of values such as command strings.

## Overview

A history buffer embodies the idea of a *current* entry and navigating to
the *previous*, *next*, *first*, *last* entries.

Consider a textbox or command prompt where pressing `up`, `down`, `home`, and
`end` allow you to navigate through the command history. This library provides
a place to store and retrieve those historical values. It does not provide the
textbox, keyboard events, etc.

## Usage

Install history-buffer to your node project:

```bash
npm install history-buffer
```

## Hacking

Retrieve a full copy of this repository with git, build, and run tests:

```bash
git clone https://github.com/costigo/history-buffer
cd history-buffer
npm install
npm run build
npm test
```
