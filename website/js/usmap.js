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
          highlightBorderColor: MAP_BORDER_COLOR,
		  popupTemplate: function(geography, data)
		  {
			  hoverMap(data, geography);
			  return '<div id="hoverinfo">'+''+'<\div>';
		  }
      },
      highlightBorderWidth: 5,
      fills: {
            defaultFill: MAP_DEFAULT_FILL,
            bubbleColor: BUBBLE_DEFAULT_FILL
          }

  });

   
  function hoverMap(data, geography)
  {
	
	  console.log(geography.properties.name);
	  var pos,neg,neu;
	  
	  for(var x =0;x<data.tweets_per_state.length;x++)
	  {
		  if(geography.properties.name==data.tweets_per_state[x].name)
	      {
		    pos = data.tweets_per_state[x].total_pos_tweet;
			neg = data.tweets_per_state[x].total_neg_tweet;
			neu = data.tweets_per_state[x].total_neg_tweet;
	      }
	  }
	 
	  var plotData={
		  x:['positive','negative','neutral'],
		  //y:[data.tweets_per_state.total_pos_tweet, data.tweets_per_state.total_neg_tweet, data.tweets_per_state.total_neu_tweet],
		  y:[pos,neg,neu],
		   type:'bar'
	  };
	  
	  var dataBarPlot=[plotData];
	  
      var layout = {
          title: 'Total Tweets comparison',
          barmode: 'group'
      };


      Plotly.newPlot('hoverinfo', dataBarPlot, layout);
	  
  }
  // Update the map.
  function updateMap(data) {
    // Color scale.
    var colorScale = d3.scale.linear()
                              .domain(SENTIMENT_DOMAIN)
                              .range(SENTIMENT_COLOR_RANGE);
    var allStates = Datamap.prototype.usaTopo.objects.usa.geometries.map(function(state) {
      return state.id
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

  return {
    updateMap: updateMap,
    updateBubbles: updateBubbles,
	
  };
}







