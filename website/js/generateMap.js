

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
               'bubbleColor': ' #b3e0ff'
            }

    });
    console.log("map created");
    return gisMap;
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

