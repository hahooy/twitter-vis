$(function() {
    console.log( "ready!" );
    // Constants.
    var baseURL = "http://ec2-54-91-157-7.compute-1.amazonaws.com:8000/twitter_vis/";
    var tweetsByStatesURL = "tweets_states/"

    //Create a new instance of the word cloud visualisation.
    var myWordCloud = wordCloud('#wordcloud-vis', 1000, 500);

    // Query tweets and render hashtag word cloud.
    $.get( baseURL + tweetsByStatesURL, { date: "2017-03-16"} ).done(function( data ) {
        myWordCloud.update(JSON.parse(data)[0]['hashtags']);
        console.log( JSON.parse(data)[0]['hashtags'] );
    });
});

