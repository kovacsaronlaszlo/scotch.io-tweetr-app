'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route');

Route.get('/', ({ request }) => {
  return { greeting: 'Hello world in JSON' }
});
// signup
Route.post('/signup', 'UserController.signup');

//login
Route.post('/login', 'UserController.login');

// user updating
Route.group(() => {
  Route.get('/me', 'UserController.me');
  Route.put('/update_profile', 'UserController.updateProfile')
})
  .prefix('account')
  .middleware(['auth:jwt']);

// password change
Route.put('/change_password', 'UserController.changePassword');

// to user profile
Route.get(':username', 'UserController.showProfile');

// who to follow
Route.group(() => {
  Route.get('/users_to_follow', 'UserController.usersToFollow');
})
  .prefix('users')
  .middleware(['auth:jwt']);

// following user
Route.post('/follow/:id', 'UserController.follow');

// not follow user
Route.delete('/unfollow/:id', 'UserController.unFollow');

// timeline
Route.get('/timeline', 'UserController.timeline');
