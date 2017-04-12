

$("#minval").change(function() {
  var slider_value =  $("#minval").val();
  console.log(slider_value);
  alert('changed');
  // do something..
 // generateMap(slider_value);
  gisMap.updateChoropleth(data);
});


//generateMap();

function generateMap() {
    var gisMap = new Datamap({
        scope: 'usa',
        width: 1000,
        element: document.getElementById('mapvis'),
        geographyConfig: {
            highlightBorderColor: '#ffc1b1'
        },
        highlightBorderWidth: 5,
        fills: {
             
              defaultFill: '#ABDDA4',
              bubbleColor: '#b3e0ff'
            }

    });
    console.log("map created");
    return gisMap;
}

// Create bubbles.
function updateBubbles(map, data, wordcloud) {
  insertRadius(data);
  map.bubbles(data);
  console.log(d3.selectAll("circle").data());
  d3.selectAll("circle")
    .style("fill", "#b3e0ff")
    .style("opacity", 0.8)
    .on("mouseover", function(d) {
      console.log(d);
      d3.select(this)
        .transition()
        .duration(500)
        .style("fill", "rgb(217,91,67)")  
        .style("opacity", 0.5);
        wordcloud.update(d.hashtags);
    })
    .on("mouseout", function(d) {       
      d3.select(this)
        .transition()
        .duration(500)
        .style("fill", "#b3e0ff")
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

