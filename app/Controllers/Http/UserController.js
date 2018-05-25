'use strict'

const User = use('App/Models/User');
const Hash = use('Hash');
const Tweet = use('App/Models/Tweet');

class UserController {


  // sign up method
  async signup({request, auth, response}) {

    const userData = request.only(['name', 'username', 'email', 'password']);

    try {
      const user = await User.create(userData)
      const token = await auth.generate(user)

      return response.json({
        status: 'success',
        data: token
      })
    } catch(error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the user, please try again later.'
      })
    }

  }

  // login method
  async login ({ request, auth, response }) {
    try {
      const token = await auth.attempt(
        request.input('email'),
        request.input('password')
      )

      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      response.status(400).json({
        status: 'error',
        message: 'Invalid email/password'
      })
    }
  }

  // me update method
  async me ({ auth, response }) {
    const user = await User.query()
      .where('id', auth.current.user.id)
      .with('tweets', builder => {
        builder.with('user')
        builder.with('favorites')
        builder.with('replies')
      })
      .with('following')
      .with('followers')
      .with('favorites')
      .with('favorites.tweet', builder => {
        builder.with('user')
        builder.with('favorites')
        builder.with('replies')
      })
      .firstOrFail()

    return response.json({
      status: 'success',
      data: user
    })
  }

  // user profile update method
  async updateProfile ({ request, auth, response }) {
    try {
      const user = auth.current.user

      user.name = request.input('name')
      user.username = request.input('username')
      user.email = request.input('email')
      user.location = request.input('location')
      user.bio = request.input('bio')
      user.website_url = request.input('website_url')

      await user.save()

      return response.json({
        status: 'success',
        message: 'Profile updated!',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem updating profile, please try again later.'
      })
    }
  }

  // password change method
  async changePassword ({ request, auth, response }) {

    // jelenleg hitelesített felhasználó
    const user = auth.current.user

    // ellenőrzi a jelszó helyességet
    const verifyPassword = await Hash.verify(
      request.input('password'),
      user.password
    )

    // 400-as hiba esetén megjelenő üzenet
    if (!verifyPassword) {
      return response.status(400).json({
        status: 'error',
        message: 'A jelenlegi jelszó nem ellenőrizhető! Kérlek próbáld újra.'
      })
    }

    // hash-seli és menti az új jelszót
    user.password = await Hash.make(request.input('newPassword'))
    await user.save()

    return response.json({
      status: 'success',
      message: 'Password updated!'
    })
  }

  // user profile method
  async showProfile ({ request, params, response }) {
    try {
      const user = await User.query()
        .where('username', params.username)
        .with('tweets', builder => {
          builder.with('user')
          builder.with('favorites')
          builder.with('replies')
        })
        .with('following')
        .with('followers')
        .with('favorites')
        .with('favorites.tweet', builder => {
          builder.with('user')
          builder.with('favorites')
          builder.with('replies')
        })
        .firstOrFail()

      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }
  }

  // who to follow
  async usersToFollow ({ params, auth, response }) {

    // jelenleg hitelesített felhasználó
    const user = auth.current.user

    // szerezzen azon felhasználók azonosítási azonosítóit, akiket a jelenleg hitelesített felhasználó már követi
    const usersAlreadyFollowing = await user.following().ids()

    // azok a felhasználók, akiket a jelenleg hitelesített felhasználó már nem követi
    const usersToFollow = await User.query()
      .whereNot('id', user.id)
      .whereNotIn('id', usersAlreadyFollowing)
      .pick(3)

    return response.json({
      status: 'success',
      data: usersToFollow
    })
  }

  // following user
  async follow ({ request, auth, response }) {

    // jelenleg hitelesített felhasználó
    const user = auth.current.user

    // követők hozzáadása a felhasználóhoz
    await user.following().attach(request.input('user_id'))

    return response.json({
      status: 'success',
      data: null
    })
  }

  // not follow user
  async unFollow ({ params, auth, response }) {

    // jelenleg hitelesített felhasználó
    const user = auth.current.user

    // eltávolítja a felhasználót a követők közül
    await user.following().detach(params.id)

    return response.json({
      status: 'success',
      data: null
    })
  }

  // user timeline
  async timeline ({ auth, response }) {

    const user = await User.find(auth.current.user.id)

    // getteljük egy tömb ID-jait a felhasználó követői közül
    const followersIds = await user.following().ids()

    // hozzáadjuk a felhasználó ID-ját a tömbhöz
    followersIds.push(user.id)

    const tweets = await Tweet.query()
      .whereIn('user_id', followersIds)
      .with('user')
      .with('favorites')
      .with('replies')
      .fetch()

    return response.json({
      status: 'success',
      data: tweets
    })
  }


}

module.exports = UserController
