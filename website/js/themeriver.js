function themeriver(selector) {
    // Set up canvas
    var margin = {top: 20, bottom: 20, left: 100, right: 20};
    var padding = {top: 10, bottom: 10, left: 10, right: 10};
    var width = 1000, height = 500;
    var graphWidth = width - margin.left - margin.right;
    var graphHeight = height - margin.top - margin.bottom;
    var sideGraphWidth = width / 2;
    var sideGraphHeight = height / 3;
    var sideGraphGraphWidth = sideGraphWidth - margin.left - margin.right;
    var sideGraphGraphHeight = sideGraphHeight - margin.top - margin.bottom;
    var colorScheme = ['#014636', '#016c59', '#02818a', '#3690c0', '#67a9cf', '#a6bddb', '#d0d1e6', '#ece2f0', '#fff7fb'];

    var canvas = d3v4.select(selector)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);
    var sideGraph = d3v4.select('#side-graph')
                    .append('svg')
                    .attr('width', sideGraphWidth)
                    .attr('height', sideGraphHeight);

    function getAvailableDates(data) {
        var dates = [];
        for (date in data) {
            dates.push(date);
        }

        dates.sort(function(date1, date2) {
            return new Date(date1) - new Date(date2);
        });
        return dates;
    }

    function preprocess(data) {
        /*
            Original format:  {'2017-04-15': {
                                    'hashtags_all_states': [{'text': '#something', 'size': 1000}]
                                    }
                                }
            Target format: [
                            {'date': '2017-04-15', '#something': 1000}
                            ]
        */
        var dataProcessed = [];
        var trendingWords = {};
        var dates = getAvailableDates(data);
        for (date in data) {
            var hashtags = data[date].hashtags_all_states;
            for (var i = 0; i < 3 && i < hashtags.length; i++) {
                trendingWords[hashtags[i].text] = 0;
            }
        }
        dates.forEach(function(date) {
            var d = {'date': date};
            var hashtags = data[date].hashtags_all_states;
            var hashtagsMap = {};
            for (var i = 0; i < data[date].hashtags_all_states.length; i++) {
                hashtagsMap[hashtags[i].text] = hashtags[i].size;
            }
            for (word in trendingWords) {
                if (word in hashtagsMap) {
                    d[word] = hashtagsMap[word];
                } else {
                    d[word] = 0;
                }
            }
            dataProcessed.push(d);
        });
        
        return dataProcessed;
    }

    function update(data, currentDateIdx, renderData) {
        data = preprocess(data);
        console.log(data);
        if (data.length == 0) {
            return;
        }
        // Initial setup.
        var timeLabel = 'date';
        var timeSteps = [];
        var maxTotal = 0;
        var keys = [];
        // Get all categories.
        for (k in data[0]) {
            if (k != timeLabel) {
                keys.push(k);
            }
        }

        // Find out the max total value.
        for (var i = 0; i < data.length; i++) {
            var total = 0;
            var time = data[i][timeLabel];
            timeSteps.push(time);
            for (var j = 0; j < keys.length; j++) {
                var type = keys[j];
                if (data[i][type] != '') {
                    total += parseFloat(data[i][type]);
                }
            }
            maxTotal = Math.max(maxTotal, total);
        }
        timeSteps.sort();

        // Main graph variables.
        var stack = d3v4.stack().offset(d3v4.stackOffsetSilhouette).keys(keys)(data);
        var xScale = d3v4.scaleBand().range([margin.left, graphWidth + margin.left]).domain(timeSteps);
        var yScale = d3v4.scaleLinear().range([graphHeight + margin.top, margin.top]).domain([-maxTotal/2, maxTotal/2]);
        var yAxisScale = d3v4.scaleLinear().range([graphHeight + margin.top, margin.top]).domain([0, maxTotal]);
        var colorScale = d3v4.scaleOrdinal().range(colorScheme);
        var xAxis = d3v4.axisBottom(xScale);
        var yAxis = d3v4.axisLeft(yAxisScale);
        var tooltip = d3v4.select(selector + ' > div.tooltip');
        console.log(tooltip);
        var vBar = d3v4.select(selector + ' > div.vBar');


        var xToTimeIdx = function(x) {
            // x is the x coordinate and d is all the time steps.
            return Math.floor(timeSteps.length * (x - xScale(timeSteps[0])) / graphWidth);
        }

        // Maximum value of any category.
        var maxV = 0;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < keys.length; j++) {
                if (data[i][keys[j]] != '') {
                    maxV = Math.max(maxV, parseFloat(data[i][keys[j]]));
                }
            }
        }

        // Side graph variables.
        var xScaleSideGraph = d3v4.scaleBand().range([margin.left, margin.left + sideGraphGraphWidth]).domain(keys);
        var yScaleSideGraph = d3v4.scaleLinear().range([sideGraphGraphHeight + margin.top, margin.top]).domain([0, maxV]);
        var xAxisSideGraph = d3v4.axisBottom(xScaleSideGraph);
        var yAxisSideGraph = d3v4.axisLeft(yScaleSideGraph);

        // Append axis to side graph.
        sideGraph.append('g')
            .attr('transform', 'translate(0,' + (sideGraphHeight - margin.bottom) + ')')
            .attr('class', 'axis')
            .call(xAxisSideGraph);
        sideGraph.append('g')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .attr('class', 'axis')
            .call(yAxisSideGraph);

        // Append ThemeRiver graph.
        canvas.selectAll('g')
            .data(stack)
            .enter()
            .append('g')
            .attr('fill', function(d) {return colorScale(d.key);})
            .append('path')
            .attr('class', 'path')
            .attr('d', d3v4.area()
                        .curve(d3v4.curveCardinal)
                        .x(function(d) {return xScale(d.data[timeLabel]) + xScale.bandwidth() / 2;})
                        .y0(function(d) {return yScale(parseFloat(d[1]));})
                        .y1(function(d) {return yScale(parseFloat(d[0]));}));

        // Append axis.
        canvas.append('g')
            .attr('transform', 'translate(0,' + (graphHeight + margin.top) + ')')
            .attr('class', 'axis')
            .call(xAxis);
        canvas.append('g')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .attr('class', 'axis')
            .call(yAxis);

        // Hovering on a path.
        canvas.selectAll('.path')
            .on('mouseover', function(d, i) {
                canvas.selectAll('.path')
                    .attr('opacity', function(d, j) {
                        if (i === j) {
                            return 1;
                        } else {
                            return 0.5;
                        }
                    });
            })
            .on('mouseout', function() {
                canvas.selectAll('.path')
                    .attr('opacity', 1);
                tooltip.style('display', 'none');
                vBar.style('display', 'none');
            })
            .on('mousemove', function(d, i) {
                var mX = d3v4.mouse(this)[0], mY = d3v4.mouse(this)[1];
                var timeIdx = xToTimeIdx(mX);
                tooltip.select('.content')
                        .text(keys[i] + ', ' + timeSteps[timeIdx] + ', ' + (d[timeIdx][1] - d[timeIdx][0]));
                tooltip.style('left', (xScale(timeSteps[timeIdx]) + xScale.bandwidth() / 2) + 'px')
                    .style('top', mY + 'px')
                    .style('display', 'block');
                vBar.style('left', (xScale(timeSteps[timeIdx]) + xScale.bandwidth() / 2) + 'px')
                    .style('top', '0px')
                    .style('display', 'block');
                var currentData = [];
                for (var k in data[timeIdx]) {
                    if (k != timeLabel) {
                        currentData.push({'label': k, 'val': data[timeIdx][k]});
                    }
                }
                sideGraph.selectAll('.rect').remove();
                for (var k = 0; k < currentData.length; k++) {
                    var h = yScaleSideGraph(0) - yScaleSideGraph(parseFloat(currentData[k].val)) || 0;
                    sideGraph.append('rect')
                            .attr('class', 'rect')
                            .attr('fill', colorScale(currentData[k].label))
                            .attr('x', xScaleSideGraph(currentData[k].label))
                            .attr('y', margin.top + sideGraphGraphHeight - h)
                            .attr('height', h)
                            .attr('width', sideGraphGraphWidth / currentData.length);
                }
            });
    };

    return {
        update: update
    };
}



