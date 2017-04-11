

$("#minval").change(function() {
  var slider_value =  $("#minval").val();
  console.log(slider_value);
  alert('changed');
  // do something..
 // generateMap(slider_value);
  gisMap.updateChoropleth(data);
});


//generateMap();

function generateMap(slider_value) {
    
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



    var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/"

    var params = {};
    if (slider_value != null) {
        params.date = "2017-03-"+slider_value;
    }

    $.get(baseURL + tweetsByStatesURL, params).done(function (data) {

        data = JSON.parse(data);
        var maxTweets = Math.max.apply(null, data.map(function (d) {
            return d.total_num_tweet;
        }

        ));
        insertRadius(data, maxTweets);

        console.log(data);
        gisMap.bubbles(data);
        

    });





//gisMap.svg.selectAll('.bubbles').on('click', function() {...});





    /* d3.csv(filename, function (d) {
         return {
           /*  name: d.name,
             abbreviation: d.abbreviation,
             statefp: +d.statefp,
             lat: d.latitude,
             lon: d.longitude,
             tw: +d.num_tweet,
             avgSent: +d.avg_sentiment
 */

    /*lat: d.latitude,
           lon: d.longitude,
           tw: +d.total_num_tweet,
           avgSent: +d.avg_sentiment,
           radius: +d.radius
       };
   }, function (data) {
       // console.log(data);
   });

   /*var x = d3.scale.linear()
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
*/



    /*d3.csv(filename, function (data) {

        console.log(data);

    });*/

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

