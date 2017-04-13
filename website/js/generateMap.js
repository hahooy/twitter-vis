function generateMap() {
  var gisMap = new Datamap({
      scope: 'usa',
      width: 1000,
      element: document.getElementById('mapvis'),
      geographyConfig: {
          highlightBorderColor: MAP_BORDER_COLOR
      },
      highlightBorderWidth: 5,
      fills: {
            defaultFill: MAP_DEFAULT_FILL,
            bubbleColor: BUBBLE_DEFAULT_FILL
          }

  });
  console.log("map created");
  return gisMap;
}

// Update the map.
function updateMap(map, data) {
  // Color scale.
  var colorScale = d3.scale.linear()
                            .domain(SENTIMENT_DOMAIN)
                            .range(SENTIMENT_COLOR_RANGE);
  var allStates = Datamap.prototype.usaTopo.objects.usa.geometries.map(function(state) {
    return state.id
  });
  console.log(data);
  var colors = {};
  for (var i = 0; i < allStates.length; i++) {
    colors[allStates[i]] = MAP_DEFAULT_FILL;
  }
  for (var i = 0; i < data.tweets_per_state.length; i++) {
    colors[data.tweets_per_state[i].abbreviation] = colorScale(data.tweets_per_state[i].avg_sentiment);
  }
  map.updateChoropleth(colors, {reset: true});
}

// Create bubbles.
function updateBubbles(map, data, wordcloud) {
  insertRadius(data.tweets_per_state);
  map.bubbles(data.tweets_per_state);
  console.log(d3.selectAll("circle").data());
  d3.selectAll("circle")
    .style("fill", "#b3e0ff")
    .style("opacity", 0.8)
    .on("mouseover", function(d) {
      console.log(d);
      d3.select(this)
        .transition()
        .duration(500)
        .style("fill", BUBBLE_HOVER_FILL)  
        .style("opacity", 0.5);
      wordcloud.update(d.hashtags);
    })
    .on("mouseout", function(d) {       
      d3.select(this)
        .transition()
        .duration(500)
        .style("fill", BUBBLE_DEFAULT_FILL)
        .style("opacity", 0.8);
      wordcloud.update(data.hashtags_all_states);
    });
}

// Calculate the radius of the bubbles based on the number of tweets.
function insertRadius(data) {
    var maxTweets = Math.max.apply(null, data.map(function (d) {
        return d.total_num_tweet;
    }));

    for (var i = 0; i < data.length; i++) {
        var tweets = data[i].total_num_tweet;
        if (tweets == maxTweets) {
            data[i].radius = ((tweets / maxTweets) * 100) - 30;
           
        } else {
            data[i].radius = (tweets / maxTweets) * 100;
        }
         data[i].fillKey='bubbleColor';
    }
}

