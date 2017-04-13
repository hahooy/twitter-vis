$(function() {
    // Constants.
    var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    //var baseURL = "http://127.0.0.1:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/";
    var hashtagURL = "top_hashtags/";

    //Create a new instance of the word cloud visualisation.
    var smallWordCloud = wordCloud('#small-wordcloud-vis', 300, 500);
    var largeWordCloud = wordCloud('#wordcloud-vis', 1000, 300);

    // Create a gis map.
    var gisMap = generateMap();
    // Index to the current selected date.
    var currentDateIdx = 0;
    // All available dates.
    var availableDatesGlobal = [];
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
            availableDatesGlobal = getAvailableDates(dataGlobal);
            currentDateIdx = 0;
            renderSlider(availableDatesGlobal, currentDateIdx);
            console.log(currentDateIdx);
            renderData(dataGlobal[availableDatesGlobal[currentDateIdx]]);
        });
    }

    // make a new request after the user select a hashtag.
    function renderData(dataAtDate) {
        console.log(dataAtDate);
        console.log(dataAtDate.hashtags_all_states);
        smallWordCloud.update(dataAtDate.hashtags_all_states);
        largeWordCloud.update(dataAtDate.hashtags_all_states);
        updateBubbles(gisMap, dataAtDate, smallWordCloud);
        updateMap(gisMap, dataAtDate);
    }

    function getAvailableDates(data) {
        var dates = [];
        for (date in data) {
            dates.push(date);
        }
        console.log(dates);
        dates.sort(function(date1, date2) {
            return new Date(date1) - new Date(date2);
        });
        return dates;
    }

    // Initialize the slider.
    function renderSlider(date, v) {
        // Slider for choosing a date.
        console.log(date);
        if (typeof $("#slider").slider("instance") != 'undefined') {
            $("#slider").slider("destroy");
        }
        $("#slider").slider({
            orientation: "horizontal",
            value: v,
            min: 0,
            max: date.length - 1,
            change: function (event, ui) {
                $("#selectedDate").text(date[$("#slider").slider("value")]);
                currentDateIdx = ui.value;
                renderData(dataGlobal[date[currentDateIdx]]);
            }
        });
        $("#selectedDate").text(date[$("#slider").slider("value")]);
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

    console.log('before init static');
    initVisStatic();
    console.log('before query');
    queryTweets(params); // Initial query.
});

