#!/bin/sh
grunt build
git add dist && git commit -m "Build"
git subtree push --prefix dist origin gh-pages

