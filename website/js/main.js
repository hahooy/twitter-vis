$(function() {
    // Constants.
    var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    //var baseURL = "http://127.0.0.1:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/";
    var hashtagURL = "top_hashtags/";

    // UI variables.
    var smallWCWidth = 300;
    var smallWCHeight = 500;
    var largeWCWidth = 1000;
    var largeWCHeight = 300;

    //Create a new instance of the word cloud visualisation.
    var smallWordCloud = wordCloud('#small-wordcloud-vis', smallWCWidth, smallWCHeight);
    var largeWordCloud = wordCloud('#wordcloud-vis', largeWCWidth, largeWCHeight);

    // Create a gis map.
    var gisMap = usmap();
    // Create a slider for the map.
    var slider = mapslider();
    // Query parameters.
    var params = {};


    // Query wrapper.
    function queryTweets(params) {
        // Query data and render.
        $.get( baseURL + tweetsByStatesURL, params ).done(function( data ) {
            data = JSON.parse(data);
            console.log(data);
            slider.update(data, 0, renderData);
            renderData(data[slider.getCurrentDate()]);
        });
    }

    // make a new request after the user select a hashtag.
    function renderData(dataAtDate) {
        console.log(dataAtDate);
        console.log(dataAtDate.hashtags_all_states);
        smallWordCloud.update(dataAtDate.hashtags_all_states);
        largeWordCloud.update(dataAtDate.hashtags_all_states);
        gisMap.updateBubbles(dataAtDate, smallWordCloud);
        gisMap.updateMap(dataAtDate);
    }


    // Initialize visualizations that don't rely on the server.
    function initVisStatic() {
        // Autocomplete for hashtags.
        var options = {
            url: function(phrase) {
                return baseURL + hashtagURL + "?phrase=" + phrase;
            },
            list: {
                maxNumberOfElements: 15,
                match: {
                    enabled: true
                },
                onClickEvent: function() {
                    var value = $("#search-hashtag").getSelectedItemData();
                    params.hashtag = value;
                    console.log(params);
                    queryTweets(params);
                }
            },
            placeholder: "choose a hashtag",
            requestDelay: 500,
            theme: "square"
        };
        $("#search-hashtag").easyAutocomplete(options);
    }


    initVisStatic();
    queryTweets(params); // Initial query.
});

