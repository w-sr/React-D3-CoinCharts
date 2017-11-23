import React, { Component } from "react";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import { area as d3Area, line as d3Line } from "d3-shape";
import { extent } from "d3-array";
import { interpolatePath } from "d3-interpolate-path";
import { scaleLinear, scaleTime } from "d3-scale";
import { select } from "d3-selection";
import "d3-transition";

import { PROPTYPES } from "../../constants";
import { CHART_PADDING_TOP, TRANSITION } from "./constants";

const INITIAL_STATE = {
  previousColor: undefined,
  previousScaledData: [],
  scaledData: [],
  skipTransition: false
};

class Chart extends Component {
  static scaleData(data, height, width) {
    const scalePriceToY = scaleLinear()
      .range([height, CHART_PADDING_TOP])
      .domain(extent(data, d => d.price));

    const scaleTimeToX = scaleTime()
      .range([0, width])
      .domain(extent(data, d => d.time));

    return data.map(({ price, time }) => ({
      price: scalePriceToY(price),
      time: scaleTimeToX(time)
    }));
  }

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentWillReceiveProps(nextProps) {
    const { data: nextData, height: nextHeight, width: nextWidth } = nextProps;
    const { color, width } = this.props;
    const { scaledData } = this.state;

    // Don't update if next set of data is not ready
    if (nextData.length === 0) {
      return;
    }

    const nextScaledData = Chart.scaleData(nextData, nextHeight, nextWidth);
    const previousScaledData =
      scaledData.length > 0
        ? scaledData
        : nextScaledData.map(({ time }) => ({ price: nextHeight, time }));

    this.setState({
      skipTransition: width !== nextWidth,
      previousColor: color,
      previousScaledData,
      scaledData: nextScaledData
    });
  }

  shouldComponentUpdate(nextProps) {
    const { data, height, width } = this.props;
    const { data: nextData, height: nextHeight, width: nextWidth } = nextProps;

    // Don't update if next set of data is not ready
    if (nextData === undefined || nextData.length === 0) {
      return false;
    }

    return (
      !isEqual(data, nextData) ||
      !isEqual(height, nextHeight) ||
      !isEqual(width, nextWidth)
    );
  }

  componentDidUpdate() {
    const { color, height } = this.props;
    const {
      previousColor = color,
      previousScaledData,
      scaledData,
      skipTransition
    } = this.state;
    const chart = select(this.svgNode);
    const transitionDuration = skipTransition ? 0 : TRANSITION.duration;

    const area = d3Area()
      .x(d => d.time)
      .y0(height)
      .y1(d => d.price);
    const line = d3Line()
      .x(d => d.time)
      .y(d => d.price);

    const previousAreaChart = area(previousScaledData);
    const previousLineChart = line(previousScaledData);
    const areaChart = area(scaledData);
    const lineChart = line(scaledData);

    chart.selectAll("path").remove();

    chart
      .append("path")
      .attr("class", "Chart-area")
      .attr("d", previousAreaChart)
      .style("fill", previousColor.fill)
      .transition()
      .duration(transitionDuration)
      .ease(TRANSITION.ease)
      .attrTween("d", () => interpolatePath(previousAreaChart, areaChart))
      .style("fill", color.fill);

    chart
      .append("path")
      .attr("class", "Chart-line")
      .attr("d", previousLineChart)
      .style("stroke", previousColor.stroke)
      .transition()
      .duration(transitionDuration)
      .ease(TRANSITION.ease)
      .attrTween("d", () => interpolatePath(previousLineChart, lineChart))
      .style("stroke", color.stroke);
  }

  render() {
    const nodeRef = node => {
      this.svgNode = node;
    };

    return <g ref={nodeRef} />;
  }
}

Chart.propTypes = {
  color: PROPTYPES.COLOR.isRequired,
  data: PROPTYPES.PRICE_DATA.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired
};

export default Chart;
