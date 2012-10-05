
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  next()
};


// /*
//  *  User authorizations routing middleware
//  *  Not currently used
//  */

// exports.user = {
//     hasAuthorization : function (req, res, next) {
//       if (req.profile.id != req.user.id) {
//         return res.redirect('/users/'+req.profile.id)
//       }
//       next()
//     }
// }


/*
 *  Article authorizations routing middleware
 *  TODO: Make this better, abstract out so it can be re-used
 */

exports.article = {
    hasAuthorization : function (req, res, next) {
      if (req.article.user.id != req.user.id) {
        // respond with html page
        if (req.accepts('html')) {
          res.render('403', { url: req.url });
          return;
        }

        // respond with json
        if (req.accepts('json')) {
          res.send({ error: 'Not Authorised' });
          return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not Authorised');
      }
      next()
    }
}
