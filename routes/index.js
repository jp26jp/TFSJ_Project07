const express = require("express"),
      twitter = require("../config"),
      routes  = express.Router()

const promiseTweets = new Promise(resolve => {
    let tweetArray = []
    twitter.get("statuses/user_timeline", {screen_name: twitter.screen_name, count: 5}, (err, tweets) => {
        tweets.forEach(tweet => {
            const currentDate = new Date(),
                  dateOfTweet = new Date(tweet.created_at)
            let daysSinceTweet          = parseInt((currentDate - dateOfTweet) / 1000 / 60 / 60 / 24),
                hoursSinceTweet         = parseInt((currentDate - dateOfTweet) / 1000 / 60 / 60),
                formattedTimeSinceTweet = ""
            if (daysSinceTweet) {
                // readjust the hours
                hoursSinceTweet = hoursSinceTweet - (daysSinceTweet * 24)
                formattedTimeSinceTweet += `${daysSinceTweet}d `
            }
            if (hoursSinceTweet) {formattedTimeSinceTweet += `${hoursSinceTweet}h`}
            
            tweetArray.push({
                                name          : tweet.user.name,
                                screen_name   : tweet.user.screen_name,
                                photo         : tweet.user.profile_image_url_https,
                                url           : `https://twitter.com/${tweet.user.screen_name}`,
                                text          : tweet.text,
                                created_at    : formattedTimeSinceTweet,
                                retweet_count : tweet.retweet_count,
                                favorite_count: tweet.favorite_count,
                                favorited     : tweet.favorited,
                                retweeted     : tweet.retweeted
                            })
            console.log("Tweet added!")
        })
        resolve(tweetArray)
    })
})

const promiseFollowers = new Promise(resolve => {
    let followerArray = []
    twitter.get("followers/list", {count: 5}, (error, followers) => {
        followers = followers.users
        if (followers !== undefined) {
            followers.forEach(follower => {
                followerArray.push({
                                       name       : follower.name,
                                       screen_name: follower.screen_name,
                                       url        : `https://twitter.com/${follower.screen_name}`,
                                       photo      : follower.profile_image_url_https,
                                       id         : follower.id,
                                       following  : follower.following
                                   })
                console.log("Follower added!")
            })
        }
        resolve(followerArray)
    })
})

const promiseDirectMessages = new Promise(resolve => {
    
    const myTwitterId = new Promise(resolve1 => twitter.get("users/show", {screen_name: twitter.screen_name}, (error, data) => resolve1(data.id)))
    
    myTwitterId.then(id => {
        let directMessageArray = []
        twitter.get("direct_messages/events/list", {count: 5}, (error, messages) => {
            messages = messages.events
            if (messages !== undefined) {
                messages.forEach(message => {
                    const userProfilePhoto = new Promise(resolve1 => twitter.get("users/show", {user_id: message.message_create.sender_id}, (error, data) => resolve1(data.profile_image_url_https)))
                    userProfilePhoto.then(photo => {
                        const self = message.message_create.sender_id == id
                        const timeStamp = new Date(parseInt(message.created_timestamp))
                        console.log(timeStamp)
                        directMessageArray.push({
                                                    timeStamp: formatDate(timeStamp),
                                                    photo    : photo,
                                                    text     : message.message_create.message_data.text,
                                                    self     : self
                                                })
                    })
                })
            }
            resolve(directMessageArray)
        })
    })
})

Promise.all([promiseTweets, promiseFollowers, promiseDirectMessages]).then(results => {
    routes.get("/", (request, response) => response.render("index", {
        tweetArray        : results[0],
        followerArray     : results[1],
        directMessageArray: results[2]
    }))
})

function formatDate(date) {
    let hours   = date.getHours(),
        minutes = date.getMinutes(),
        ampm    = hours >= 12 ? "pm" : "am"
    
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes
    
    const strTime = hours + ":" + minutes + " " + ampm
    
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime
}

module.exports = routes
