# coincharts

[![CircleCI](https://circleci.com/gh/tohjustin/coincharts/tree/master.svg?style=shield&circle-token=3fd04aa6997f211630fc7d4f45931bef1953a97b)](https://circleci.com/gh/tohjustin/coincharts/tree/master)
[![codecov](https://codecov.io/gh/tohjustin/coincharts/branch/master/graph/badge.svg)](https://codecov.io/gh/tohjustin/coincharts)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A cryptocurrency price chart built with [React.js](https://facebook.github.io/react/), [D3.js](https://d3js.org/) & [Coinbase API](https://developers.coinbase.com/api/v2).

- Bootstrapped with [create-react-app](https://github.com/facebookincubator/create-react-app)
- UI design based off [https://www.coinbase.com/charts](https://www.coinbase.com/charts)

<p align="center">
  <img src="./readme/screenshot.png">
</p>

## Installation

Prerequisites: [Node](https://nodejs.org/en/download/) & [npm](https://docs.npmjs.com/getting-started/installing-node) installed on your system.

``` bash
git clone https://github.com/tohjustin/coincharts.git && cd ./coincharts
npm install
```

## Getting Started

``` bash
# Runs the app in development mode at `localhost:3000`
npm run start

# Takes a snapshot of responses from coinbase API & saves them into JSON files in `public/priceData` (for offline development)
npm run updatePriceData

# Create production build in `/build` folder
npm run build

# Serve production build at `localhost:5000`
npm run serve

# Deploy app with `now.sh` using configuration defined in `now.json`
npm run deploy
```
