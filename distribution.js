let Distr = null;

const distributions = {};

const Util = {
  assert: (b, str) => {
    if (!b) console.error(str);
  }
}

$(() => {
  /**
   * A map from IDs to distribution objects.
   * A distribution object consists of
   *  - `config`: the configuration of the distribution
   *  - `node`: the jQuery object that refers to the DOM node where the distribution is rendered.
   */
  

  const makeHistogram = (id, config) => {
    const Margins = {
      top: 30,
      right: 10,
      bottom: 25,
      left: 50
    };

    const BarSizes = {
      height: config.totalHeight - Margins.top - Margins.bottom,
      width: config.barWidth
    };

    const HistSizes = {
      barSpacing: config.barSpacing,
      xAxisY: Margins.top + BarSizes.height,
      yAxisX: Margins.left,
      width: Margins.left + BarSizes.width * config.items.length + config.barSpacing * (config.items.length + 1) ,
      height: config.totalHeight,
    };

    const svg = Snap(`#${id}`);
    svg.attr('width', HistSizes.width);
    svg.attr('height', HistSizes.height);

    svg.attr('fontSize', '12px');
    
    // Draw x-axis
    const xAxis = svg.line(0, HistSizes.xAxisY, HistSizes.width, HistSizes.xAxisY);
    const xAxisLabelsGroup = svg.group();

    console.log(config.items)
    const xAxisLabelMeasures = {
      initialLength: HistSizes.yAxisX + HistSizes.barSpacing + BarSizes.width / 2,
      increment: HistSizes.barSpacing + BarSizes.width
    }
    for (let i = 0; i < config.items.length; i++) {
      const t = svg.text(xAxisLabelMeasures.initialLength + i * xAxisLabelMeasures.increment, HistSizes.xAxisY + 5, config.items[i]);
      t.attr({
        textAnchor: 'middle',
        alignmentBaseline: 'hanging',
        fill: '#999'
      });
    }

    // Draw y-axis
    const yAxis = svg.line(HistSizes.yAxisX, 0, HistSizes.yAxisX, HistSizes.height);
    
    let labelX = HistSizes.yAxisX;
    let labelY = HistSizes.xAxisY;

    const yAxisLabelGroup = svg.group();
    for (let i = 1; i <= 10; i += 1) {
      const t = svg.text(HistSizes.yAxisX - 10, HistSizes.xAxisY - i * BarSizes.height / 10, `${i*10}%`)
      t.attr({
        textAnchor: 'end',
        alignmentBaseline: 'middle',
        fill: '#999'
      });
      yAxisLabelGroup.add(t);
    }
        
    const axes = svg.group(xAxis, yAxis);
    axes.attr({
      stroke: '#DDD',
      strokeWidth: '1'
    });

    const updateBarHeight = (barIdx, delta) => {
      const bar = bars[barIdx];
      const oldHeight = parseInt(bar.attr('height'));
      let newHeight = Math.max(0, oldHeight + delta)
      const oldY = parseInt(bar.attr('y'));
      let newY = Math.max(0, oldY - delta)
      if (newY > HistSizes.xAxisY) newY = HistSizes.xAxisY;
      if (newY < HistSizes.xAxisY - BarSizes.height) newY = HistSizes.xAxisY - BarSizes.height;
      if (newHeight < 0)  newHeight = 0;
      if (newHeight > BarSizes.height) newHeight = BarSizes.height;
      bar.attr('height', newHeight);
      bar.attr('y', newY);
    }

    // Draw slots
    const slots = {};
    const slotsGroup = svg.group();
    const slotMeasures = {
      initialX: HistSizes.yAxisX + HistSizes.barSpacing,
      xIncrement: HistSizes.barSpacing + BarSizes.width
    }
    for (let i = 0; i < config.items.length; i++) {
      const r = svg.rect(slotMeasures.initialX + i * slotMeasures.xIncrement, Margins.top, BarSizes.width, BarSizes.height);
      r.attr('opacity', '0.0')
      r.mouseover(function() {
        this.attr({opacity: '1.0'})
      });
      r.mouseout(function() {
        this.attr({opacity: '0.0'})
      });
      $(r.node).on('mousewheel', function (e) {
        updateBarHeight(i, e.originalEvent.deltaY);
        e.preventDefault(); 
        console.log(e)
      });

      slotsGroup.add(r);
      slots[i] = r;
    }
    slotsGroup.attr({
      fill: 'transparent',
      stroke: '#CCC',
      strokeWidth: '1.5',
      strokeDasharray: '5'
    });

    console.log(slots)

    // Draw actual bars
    const bars = {};
    const barsGroup = svg.group();
    const barMeasures = slotMeasures;
    for (let i = 0; i < config.masses.length; i++) {
      const barHeight = config.masses[i] / 100 * BarSizes.height;
      const r = svg.rect(barMeasures.initialX + i * barMeasures.xIncrement, Margins.top + BarSizes.height - barHeight, BarSizes.width, barHeight);

      r.mouseover(function() {
        slots[i].attr({opacity: '1.0'})
      });
      r.mouseout(function() {
        slots[i].attr({opacity: '0.0'})
      });
      $(r.node).on('mousewheel', function (e) {
        updateBarHeight(i, e.originalEvent.deltaY);
        e.preventDefault(); 
        console.log(e)
      });
      barsGroup.add(r);
      bars[i] = r;
    }
    barsGroup.attr({
      fill: '#B3E5FC',
      stroke: '#4FC3F7',
      strokeWidth: '2',
    });
    console.log(svg);

    return svg;
  };

  Distr = {
    create: (id, config) => {
      Util.assert(config.masses.length === config.items.length, "masses and items must have the same length! ");
      const svg = makeHistogram(id, config);
      distributions[id] = { config: config, node: svg };
      $(`#${id}`).css({ boxShadow: '0px 1px 11px 0px rgba(0,0,0,0.2)' });
      $(`#${id}`).append(svg);
    }
  }

});