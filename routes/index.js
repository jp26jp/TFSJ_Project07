const express = require("express"),
      routes  = express.Router(),
      Twitter = require("twit"),
      twitter = new Twitter({
                                consumer_key       : "LgV5kimtal3yqn24cHHAsw3Fx",
                                consumer_secret    : "b9m5lAAWn85VJ677LvuK329tRj69h5XrQwvLZfFun3lv5ewzVE",
                                access_token       : "2222187433-Ge0Eacps8RQgJrXCoaysyO8OZlbMwTg0ZBMTAzz",
                                access_token_secret: "AkktN84cIoYXo002uHSMBk9JbQjBkdkxmopIdD53sqteT",
                                timeout_ms         : 60 * 1000,  // optional HTTP request timeout to apply to all requests.
                                strictSSL          : true     // optional - requires SSL certificates to be valid.
                            })

let recentTweets = []

const recentTweetPromise = new Promise((resolve, reject) => {
    twitter.get("statuses/user_timeline", {screen_name: "jp26jp", count: 5}, (err, tweets, response) => {

        tweets.forEach(tweet => {
            // create recentTweet variable
            let recentTweet = {}

            // add new values to variable
            recentTweet.name = tweet.user.name
            recentTweet.screen_name = tweet.user.screen_name
            recentTweet.photo = tweet.user.profile_image_url_https
            recentTweet.url = tweet.user.url
            recentTweet.text = tweet.text
            recentTweet.created_at = tweet.created_at
            recentTweet.retweet_count = tweet.retweet_count
            recentTweet.favorite_count = tweet.favorite_count
            recentTweet.favorited = tweet.favorited
            recentTweet.retweeted = tweet.retweeted

            recentTweets.push(recentTweet)
        })


        resolve(recentTweets)
    })
})

Promise.all([recentTweetPromise]).then(results => {
           routes.get("/", (request, response) => {
               response.render("index", {
                   recentTweets
               })
           })
       })
       .catch(error => {

       })

module.exports = routes
