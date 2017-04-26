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

  //Bubble hover
  function hoverMap(data, flag)
  {
	  if(flag==false) return;
	  var pos, neg, neu, currDate;
	  
	  pos = data.total_pos_tweet;
	  neg = data.total_neg_tweet;
	  neu = data.total_neu_tweet;

	  var state = data.name;
	  var dataforPlot=[ {
		  x:['Positive','Negative','Neutral'],
		  y:[pos, neg, neu],
		  type:'bar',
		  marker: {
        color: 'rgb(0, 191, 255)'
      }
    }];
  	var layout = {
        title: state,
        font:{
        family: 'Raleway, sans-serif'
        },
        showlegend: false,
        xaxis: {
        tickangle: 0
        },
        yaxis: {
        zeroline: false,
        gridwidth: 2
       },
       bargap :0.05
      };
  	Plotly.newPlot('hoverinfo', dataforPlot, layout);  	  
  }
  
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
    gisMap.bubbles( data.tweets_per_state);
    d3.selectAll("circle")
      .style("fill", BUBBLE_DEFAULT_FILL)
      .style("opacity", BUBBLE_DEFAULT_OPACITY)
      .on("mouseover", function(d) {
        hoverMap(d, true);		
		
        d3.select(this)
          .transition()
          .duration(500)
          .style("fill", BUBBLE_HOVER_FILL)  
          .style("opacity", BUBBLE_HOVER_OPACITY);
        wordcloud.update(d.hashtags);
		
      })
      .on("mouseout", function(d) {     

        hoverMap(d, false); 
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
      4: "Extremely Positive"
    }
  });

  return {
    updateMap: updateMap,
    updateBubbles: updateBubbles,
  };
}







