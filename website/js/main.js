$(function() {
    // Constants.
    var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    var baseURL = "http://127.0.0.1:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/";
    var allHashtagURL = "top_hashtags/";

    //Create a new instance of the word cloud visualisation.
    var smallWordCloud = wordCloud('#small-wordcloud-vis', 300, 500);
    var largeWordCloud = wordCloud('#wordcloud-vis', 1000, 300);

    // Create a gis map.
    var gisMap = generateMap();

    var currentDate = "2017-03-13";
    // Query parameters.
    var params = {};
    // Query results.
    var dataGlobal = [];

    

    // Query wrapper.
    function queryTweets(params) {
        // Query data and render.
        $.get( baseURL + tweetsByStatesURL, params ).done(function( data ) {
            dataGlobal = JSON.parse(data);
            console.log(dataGlobal);
            renderData(dataGlobal[currentDate]);
        });
    }

    // make a new request after the user select a hashtag.
    function renderData(data) {
        console.log(data.hashtags_all_states);
        smallWordCloud.update(data.hashtags_all_states);
        largeWordCloud.update(data.hashtags_all_states);
        updateBubbles(gisMap, data.tweets_per_state, smallWordCloud);
    }

    // Initialize the visualizations.
    function initVis() {
        // Initial query.
        queryTweets(params);

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
                currentDate = "2017-03-" + ui.value;
                renderData(dataGlobal[currentDate]);
            }
          });
        $("#minval").val($("#slider").slider("value"));

    }
    initVis();
});

