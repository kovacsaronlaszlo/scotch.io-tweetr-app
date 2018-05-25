'use strict'

const Favorite = use('App/Models/Favorite');

class FavoriteController {

  // favorite tweet
  async favorite ({ request, auth, response }) {

    // hitelesített felhasználó
    const user = auth.current.user

    const tweetId = request.input('tweet_id')

    const favorite = await Favorite.findOrCreate(
      { user_id: user.id, tweet_id: tweetId },
      { user_id: user.id, tweet_id: tweetId }
    )

    return response.json({
      status: 'success',
      data: favorite
    })
  }

  // not favorite tweet
  async unFavorite ({ params, auth, response }) {

    // hitelesített felhasználó
    const user = auth.current.user

    // lekérdezzük a kedveltett
    await Favorite.query()
      .where('user_id', user.id)
      .where('tweet_id', params.id)
      .delete()

    return response.json({
      status: 'success',
      data: null
    })
  }

}

module.exports = FavoriteController
