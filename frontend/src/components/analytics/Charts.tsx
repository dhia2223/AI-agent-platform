// frontend/src/components/analytics/Charts.tsx
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ChartProps {
  data: { [key: string]: any }[];
  xField: string;
  yField: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 20, right: 30, bottom: 40, left: 40 };

export function LineChart({
  data,
  xField,
  yField,
  width = 600,
  height = 300,
  margin = defaultMargin,
}: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xField]))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField]) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3
      .line<typeof data[0]>()
      .x((d) => xScale(d[xField])! + xScale.bandwidth() / 2)
      .y((d) => yScale(d[yField]))
      .curve(d3.curveMonotoneX);

    // Append group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(yScale));

    // Add labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('text-anchor', 'middle')
      .text(xField);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text(yField);
  }, [data, xField, yField, width, height, margin]);

  return <svg ref={ref} width={width} height={height} />;
}

export function BarChart({
  data,
  xField,
  yField,
  width = 400,
  height = 300,
  margin = defaultMargin,
}: ChartProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xField]))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField]) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Append group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d[xField])!)
      .attr('y', (d) => yScale(d[yField]))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d[yField]))
      .attr('fill', '#4f46e5');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(yScale));

    // Add labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('text-anchor', 'middle')
      .text(xField);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .text(yField);
  }, [data, xField, yField, width, height, margin]);

  return <svg ref={ref} width={width} height={height} />;
}