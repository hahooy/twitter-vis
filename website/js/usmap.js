function usmap() {
  // Constants.
  var SENTIMENT_DOMAIN = [0, 1.8, 2, 2.2, 4];
  var SENTIMENT_COLOR_RANGE = ["#FF0000", "#e06c00", "#ffff00", "#00ffff", "#0000ff"];
  var MAP_DEFAULT_FILL = "#d7d7d7";
  var MAP_BORDER_COLOR = "#ffc1b1";
  var BUBBLE_DEFAULT_FILL = "#272D2D";
  var BUBBLE_DEFAULT_OPACITY = 0.6;
  var BUBBLE_HOVER_FILL = "rgb(217,91,67)";
  var BUBBLE_HOVER_OPACITY = 0.5;
  console.log(BUBBLE_DEFAULT_FILL);
  // Datamap.
  var gisMap = new Datamap({
      scope: 'usa',
      width: 900,
      element: document.getElementById('mapvis'),
      geographyConfig: {
        highlightBorderColor: MAP_BORDER_COLOR
      },
      highlightBorderWidth: 5,
      fills: {
        defaultFill: MAP_DEFAULT_FILL,
        0: "#FF0000",
        1.8: "#e06c00",
        2: "#ffff00",
        2.2: "#00ffff",
        4: "#0000ff",
      }
  });

  // gisMap.addPlugin("continuousLegend", continuous);
  // gisMap.continuousLegend();
  // Update the map.
  function updateMap(data) {
  // Color scale.
  var colorScale = d3.scale.linear()
                      .domain(SENTIMENT_DOMAIN)
                      .range(SENTIMENT_COLOR_RANGE);

    var allStates = Datamap.prototype.usaTopo.objects.usa.geometries.map(function(state) {
      return state.id;
    });
    var colors = {};
    for (var i = 0; i < allStates.length; i++) {
      colors[allStates[i]] = MAP_DEFAULT_FILL;
    }
    for (var i = 0; i < data.tweets_per_state.length; i++) {
      colors[data.tweets_per_state[i].abbreviation] = colorScale(data.tweets_per_state[i].avg_sentiment);
    }
    gisMap.updateChoropleth(colors, {reset: true});
  }

  // Create bubbles.
  function updateBubbles(data, wordcloud) {

	//   //console.log(data);
    insertRadius(data.tweets_per_state);
    gisMap.bubbles(data.tweets_per_state);
    d3.selectAll("circle")
      .style("fill", BUBBLE_DEFAULT_FILL)
      .style("opacity", BUBBLE_DEFAULT_OPACITY)
      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .style("fill", BUBBLE_HOVER_FILL)  
          .style("opacity", BUBBLE_HOVER_OPACITY);
        wordcloud.update(d.hashtags);
      })
      .on("mouseout", function(d) {       
        d3.select(this)
          .transition()
          .duration(500)
          .style("fill", BUBBLE_DEFAULT_FILL)
          .style("opacity", BUBBLE_DEFAULT_OPACITY);
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

  // add legend
  gisMap.legend({
    // legendTitle : "Sentiment Color",
    labels: {
      defaultFill: "No tweet",
      0: "Extremely Negative",
      1.8: "Negative",
      2: "Neutral",
      2.2: "Positive",
      4: "Extremely Positive",
    }
  });
  // draw legend
  // function continuous() {
  //   //Extra scale since the color scale is interpolated
  //   var colorScale = d3.scale.linear()
  //                     .domain(SENTIMENT_DOMAIN)
  //                     .range(SENTIMENT_COLOR_RANGE);

  //   //Calculate the variables for the temp gradient
  //   var numStops = 10;
  //   colorRange = colorScale.domain();
  //   colorRange[2] = colorRange[1] - colorRange[0];
  //   colorPoint = [];
  //   for(var i = 0; i < numStops; i++) {
  //     colorPoint.push(i * colorRange[2]/(numStops-1) + colorRange[0]);
  //   }//for i

  //   //Create the gradient
  //   d3.selectAll("div")
  //     .append("linearGradient")
  //     .attr("id", "legend")
  //     .attr("x1", "0%").attr("y1", "0%")
  //     .attr("x2", "10%").attr("y2", "100%")
  //     .selectAll("stop") 
  //     .data(d3.range(numStops))                
  //     .enter().append("stop") 
  //     .attr("offset", function(d,i) { 
  //       return colorScale( colorPoint[i] )/100;
  //     })   
  //     .attr("stop-color", function(d,i) { 
  //       return colorScale( colorPoint[i] ); 
  //     });

  //   var legendHeight = 200;
  //   //Color Legend container
  //   var legendsvg = d3.selectAll("body").append("g")
  //     .attr("class", "legendWrapper")
  //     .attr("transform", "translate(" + 20 + "," + 20 + ")");

  //   //Draw the Rectangle
  //   legendsvg.append("rect")
  //     .attr("class", "legendRect")
  //     .attr("x", 0)
  //     .attr("y", -legendHeight/2)
  //     //.attr("rx", hexRadius*1.25/2)
  //     .attr("width", 20)
  //     .attr("height", legendHeight)
  //     .style("fill", "url(#legend)");
      
  //   //Append title
  //   // legendsvg.append("text")
  //   //   .attr("class", "legendTitle")
  //   //   .attr("x", 0)
  //   //   .attr("y", -10)
  //   //   .style("text-anchor", "middle")
  //   //   .text("Number of Accidents");
  // }

  return {
    updateMap: updateMap,
    updateBubbles: updateBubbles,
  };
}







