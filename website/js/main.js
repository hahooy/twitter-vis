$(function() {
    // Constants.
    var baseURL = "http://127.0.0.1:8000/twitter_vis/";
    //var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/";
    var allHashtagURL = "top_hashtags/";

    //Create a new instance of the word cloud visualisation.
    var smallWordCloud = wordCloud('#small-wordcloud-vis', 300, 500);
    var largeWordCloud = wordCloud('#wordcloud-vis', 1000, 300);

    // Create a gis map.
    var gisMap = generateMap();

    // Query parameters.
    var params = {
        date: "2017-03-13"
    };

    

    // Query wrapper.
    function queryTweets(params) {
        // Query data and render.
        $.get( baseURL + tweetsByStatesURL, params ).done(function( data ) {
            data = JSON.parse(data);
            console.log(data);
            renderData(data);
        });
    }

    // make a new request after the user select a hashtag.
    function renderData(data) {
        smallWordCloud.update(data[0].hashtags);
        largeWordCloud.update(data[0].hashtags);
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
        $("#slider").slider({
            orientation: "horizontal",
            value: 13,
            max: 19,
            min: 13,
            classes: {
              "ui-slider": "highlight"
            },
            slide: function (event, ui) {
                $("#minval").val(ui.value);
              params.date = "2017-03-" + ui.value;
              queryTweets(params);
            }
          });
        $("#minval").val($("#slider").slider("value"));

        queryTweets(params);
    }

    initVis();
});

