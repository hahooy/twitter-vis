$(function() {
    // Constants.
    var baseURL = "http://127.0.0.1:8000/twitter_vis/";
    //var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/"
    var allHashtagURL = "top_hashtags/"

    //Create a new instance of the word cloud visualisation.
    var smallWordCloud = wordCloud('#small-wordcloud-vis', 300, 300);
    var largeWordCloud = wordCloud('#wordcloud-vis', 1000, 300);

    // Query parameters.
    var params = {
        date: "2017-03-16"
    };

    // Create a gis map.
    var gisMap = generateMap();

    // Query wrapper.
    function queryTweets(params) {
        // Query data and render.
        $.get( baseURL + tweetsByStatesURL, params ).done(function( data ) {
            var data = JSON.parse(data);
            console.log(data);
            renderData(data);
        });
    }

    // make a new request after the user select a hashtag.
    function renderData(data) {
        smallWordCloud.update(data[0]['hashtags']);
        largeWordCloud.update(data[0]['hashtags']);
        insertRadius(data);
        gisMap.bubbles(data);
    }

    // Initialize the visualizations.
    function initVis() {
        // Autocomplete for hashtags.
        $.get( baseURL + allHashtagURL, { limit: 100} ).done(function( data ) {
            console.log( JSON.parse(data) );
            var options = {
                data: JSON.parse(data),
                list: {
                    maxNumberOfElements: 10,
                    match: {
                        enabled: true
                    },
                    onClickEvent: function() {
                        var value = $("#search-hashtag").getSelectedItemData();
                        console.log(value);
                        params.hashtag = value;
                        queryTweets(params);
                    }
                },
                placeholder: "choose a hashtag"
            };
            $("#search-hashtag").easyAutocomplete(options);
        });

        // Slider for choosing a date.
        $("#slider-5").slider({
            orientation: "horizontal",
            value: 13,
            max: 19,
            min: 13,
            classes: {
              "ui-slider": "highlight"
            },
            slide: function (event, ui) {
              $("#minval").val(ui.value);
              //generateMap(ui.value);
            }
          });
        $("#minval").val($("#slider-5").slider("value"));

        queryTweets(params);
    }

    initVis();
});

