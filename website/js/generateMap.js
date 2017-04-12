

$("#minval").change(function() {
  var slider_value =  $("#minval").val();
  console.log(slider_value);
  alert('changed');
  // do something..
 // generateMap(slider_value);
  gisMap.updateChoropleth(data);
});


//generateMap();

function generateMap(data) {
    
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
        highlightBorderWidth: 5,
        fills: {
             
              defaultFill: '#ABDDA4',
               'bubbleColor': ' #b3e0ff'
            }

    });
    var maxTweets = Math.max.apply(null, data.map(function (d) {
        return d.total_num_tweet;
    }));
    insertRadius(data, maxTweets);
    gisMap.bubbles(data);
    console.log("map created");
}

function insertRadius(data, maxTweets) {

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

