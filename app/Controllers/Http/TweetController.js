'use strict'

const Tweet = use('App/Models/Tweet');
const Reply = use('App/Models/Reply');

class TweetController {

  // tweet method
  async tweet ({ request, auth, response }) {

    // hitelesített felhasználó
    const user = auth.current.user

    // elmentjük a tweet-et az adatbázisban
    const tweet = await Tweet.create({
      user_id: user.id,
      tweet: request.input('tweet')
    })

    // letöltjüka  tweet kapcsolatait
    await tweet.loadMany(['user', 'favorites', 'replies'])

    return response.json({
      status: 'success',
      message: 'Tweet kiment!',
      data: tweet
    })
  }

  // show tweet method
  async show ({ params, response }) {
    try {
      const tweet = await Tweet.query()
        .where('id', params.id)
        .with('user')
        .with('replies')
        .with('replies.user')
        .with('favorites')
        .firstOrFail()

      return response.json({
        status: 'success',
        data: tweet
      })
    } catch (error) {
      return response.status(404).json({
        status: 'error',
        message: 'Tweet nem található!'
      })
    }
  }

  // reply tweet
  async reply ({ request, auth, params, response }) {

    // hitelesített felhasználó
    const user = auth.current.user

    // megkapjuk a tweet-et a megadott ID-val
    const tweet = await Tweet.find(params.id)

    // az adatbázis továbbra is fennáll
    const reply = await Reply.create({
      user_id: user.id,
      tweet_id: tweet.id,
      reply: request.input('reply')
    })

    // lekérdezzük a felhasználót aki válaszolt
    await reply.load('user')

    return response.json({
      status: 'success',
      message: 'Válasz posztolva!',
      data: reply
    })
  }

  // destroy tweet
  async destroy ({ request, auth, params, response }) {

    // hitelesített felhasználó
    const user = auth.current.user

    // megkapunk egy tweet a megadott azonosítóval
    const tweet = await Tweet.query()
      .where('user_id', user.id)
      .where('id', params.id)
      .firstOrFail()

    await tweet.delete()

    return response.json({
      status: 'success',
      message: 'Tweet-et töröltük!',
      data: null
    })
  }

}

module.exports = TweetController
