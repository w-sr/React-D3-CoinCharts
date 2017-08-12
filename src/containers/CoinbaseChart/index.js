import React, { Component } from 'react';

import _ from 'lodash';

import Chart from './../../components/Chart';
import InfoBox from './../../components/InfoBox';
import Tabs from './../../components/Tabs';

import { CRYPTOCURRENCY, DURATION } from './constants';
import {
  prependPlusSymbol,
  fetchPriceData,
  fetchSpotPrices,
  formatCurrency,
} from './utils';

import './index.css';

const ACTIVE_CURRENCY = 'USD';
const CRYPTOCURRENCY_LIST = _.toArray(CRYPTOCURRENCY);
const DURATION_LIST = _.toArray(DURATION);
const INITIAL_STATE = {
  activePriceHistory: [],
  activeSpotPrice: 0,
  selectedCryptocurrencyIndex: 0,
  selectedDurationIndex: 0,
  spotPrices: [],
};

class CoinbaseChart extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    const {
      selectedCryptocurrencyIndex,
      selectedDurationIndex,
    } = this.state;
    this.fetchPriceMetrics(selectedCryptocurrencyIndex, selectedDurationIndex);
  }

  fetchPriceMetrics(cryptocurrencyIndex, durationIndex) {
    const cryptocurrency = CRYPTOCURRENCY_LIST[cryptocurrencyIndex];
    const duration = DURATION_LIST[durationIndex];

    const promises = [
      fetchPriceData(cryptocurrency.key, ACTIVE_CURRENCY, duration.key),
      fetchSpotPrices(CRYPTOCURRENCY_LIST, ACTIVE_CURRENCY),
    ];

    Promise.all(promises)
      .then(([activePriceHistory, spotPrices]) => {
        this.setState({
          activeSpotPrice: spotPrices[cryptocurrencyIndex],
          activePriceHistory: activePriceHistory.prices,
          spotPrices,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleCryptocurrencyChange = (nextIndex) => {
    this.setState({ selectedCryptocurrencyIndex: nextIndex });
    this.fetchPriceMetrics(nextIndex, this.state.selectedDurationIndex);
  }

  handleDurationChange = (nextIndex) => {
    this.setState({ selectedDurationIndex: nextIndex });
    this.fetchPriceMetrics(this.state.selectedCryptocurrencyIndex, nextIndex);
  }

  renderCryptocurrencyTabs() {
    const { spotPrices } = this.state;
    const tabOptions = CRYPTOCURRENCY_LIST.map((e, index) => {
      if (spotPrices[index]) {
        const price = spotPrices[index].amount;
        const formattedPrice = formatCurrency(price, ACTIVE_CURRENCY, { prependPlusSymbol: false });
        return `${e.name} · ${formattedPrice}`;
      }

      return `${e.name}`;
    });

    return (
      <Tabs
        onChange={this.handleCryptocurrencyChange}
        options={tabOptions}
        selectedIndex={this.state.selectedCryptocurrencyIndex}
      />
    );
  }

  renderDurationTabs() {
    return (
      <Tabs
        onChange={this.handleDurationChange}
        options={DURATION_LIST.map(e => e.codename)}
        selectedIndex={this.state.selectedDurationIndex}
      />
    );
  }

  renderInfoBoxes() {
    const {
      activePriceHistory,
      activeSpotPrice,
      selectedCryptocurrencyIndex,
      selectedDurationIndex,
      spotPrices,
    } = this.state;

    if (activePriceHistory.length === 0) {
      return null;
    }

    const cryptocurrency = CRYPTOCURRENCY_LIST[selectedCryptocurrencyIndex];
    const duration = DURATION_LIST[selectedDurationIndex];

    const spotPrice = spotPrices[selectedCryptocurrencyIndex].amount;
    const currentPrice = activeSpotPrice.amount;
    const oldPrice = _.last(activePriceHistory).price;

    // Compute the price metric values
    const percentageDifference = _.round(((currentPrice / oldPrice) - 1) * 100, 2);
    const priceDifference = currentPrice - oldPrice;

    const formattedSpotPrice = formatCurrency(spotPrice, ACTIVE_CURRENCY);
    const formattedPercentageDifference = prependPlusSymbol(percentageDifference, priceDifference);
    let formattedPriceDifference = formatCurrency(priceDifference, ACTIVE_CURRENCY);
    formattedPriceDifference = prependPlusSymbol(formattedPriceDifference, priceDifference);

    const priceMetrics = [
      { label: `${cryptocurrency.name} price`, value: formattedSpotPrice },
      { label: `${duration.humanize} (${ACTIVE_CURRENCY})`, value: formattedPriceDifference },
      { label: `${duration.humanize} (%)`, value: `${formattedPercentageDifference}%` },
    ];

    // Display only the cryptocurrency's spot price when duration 'ALL' is selected
    return (
      priceMetrics &&
      priceMetrics
        .filter((e, index) => (
          (duration !== DURATION.ALL) ||
          (duration === DURATION.ALL && index === 0)
        ))
        .map(e => (
          <InfoBox key={e.label} label={e.label} value={e.value} />
        ))
    );
  }

  renderPriceHistoryChart() {
    return (
      <Chart data={this.state.activePriceHistory} />
    );
  }

  render() {
    return (
      <div className="coinbase-chart">
        <div>
          { this.renderCryptocurrencyTabs() }
          { this.renderDurationTabs() }
        </div>
        <div>
          { this.renderInfoBoxes() }
        </div>
        <div>
          { this.renderPriceHistoryChart() }
        </div>
      </div>
    );
  }
}

export default CoinbaseChart;
