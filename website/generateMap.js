function generateMap(filename) {
    var margin = { top: 20, bottom: 20, left: 20, right: 20 },
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var svg = d3.select("body")
    var canvas = d3.select(".canvas")
        .append("svg");


    var gisMap = new Datamap({
        scope: 'usa',
        element: document.getElementById('mapvis'),
        geographyConfig: {
            highlightBorderColor: '#ffc1b1'
        },
        highlightBorderWidth: 5

    });
    d3.csv("tweets_state.csv", function (d) {
        return {
            name: d.name,
            abbreviation: d.abbreviation,
            statefp: +d.statefp,
            lat: d.latitude,
            lon: d.longitude,
            tw: +d.num_tweet,
            avgSent: +d.avg_sentiment

        };
    }, function (data) {
        // console.log(data);
    });

    var x = d3.scale.linear()
        .domain([new Date('2017-04-09'), new Date('2017-04-16')])
        .range([0, width / 2])
        .clamp(true);

    var dispatch = d3.dispatch("sliderChange");

    var slider = d3.select(".slider")
        .style("width", width + "px");

    var sliderTray = slider.append("div")
        .attr("class", "slider-tray");

    var sliderHandle = slider.append("div")
        .attr("class", "slider-handle");

    sliderHandle.append("div")
        .attr("class", "slider-handle-icon")

    slider.call(d3.behavior.drag()
        .on("dragstart", function () {
            dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
            d3.event.sourceEvent.preventDefault();
        })
        .on("drag", function () {
            dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
        }));

    dispatch.on("sliderChange.slider", function (value) {
        sliderHandle.style("left", x(value) + "px")
    });

    var canvas = d3.select(".canvas")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.csv(filename, function (data) {

        console.log(data);

    });

}
