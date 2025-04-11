#!/usr/bin/env bash

mkdir -p .next/standalone/public/_next/
cp -r .next/static/ .next/standalone/public/_next/static/
cp -r public/* .next/standalone/public/
