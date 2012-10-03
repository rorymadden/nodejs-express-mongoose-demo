
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongodb')

exports.boot = function(app, config, passport){
  bootApplication(app, config, passport)
}

// App settings and middleware

function bootApplication(app, config, passport) {

  app.set('showStackError', true)

  app.use(express.static(__dirname + '/public'))

  app.use(express.logger(':method :url :status'))

  // set views path, template engine and default layout
  app.set('views', __dirname + '/app/views')
  app.set('view engine', 'jade')

  app.configure(function () {
    // dynamic helpers
    app.use(function (req, res, next) {
      res.locals.appName = 'Nodejs Express Mongoose Demo'
      res.locals.title = 'Nodejs Express Mongoose Demo'
      res.locals.showStack = app.showStackError
      res.locals.req = req
      res.locals.formatDate = function (date) {
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        return monthNames[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()
      }
      res.locals.stripScript = function (str) {
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      }
      res.locals.createPagination = function (pages, page) {
        var url = require('url')
          , qs = require('querystring')
          , params = qs.parse(url.parse(req.url).query)
          , str = ''

        params.page = 0
        var clas = page == 0 ? "active" : "no"
        str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">First</a></li>'
        for (var p = 1; p < pages; p++) {
          params.page = p
          clas = page == p ? "active" : "no"
          str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">'+ p +'</a></li>'
        }
        params.page = --p
        clas = page == params.page ? "active" : "no"
        str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">Last</a></li>'

        return str
      }

      next()
    })

    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    app.use(express.session({
      secret: 'noobjs',
      store: new mongoStore({
        url: config.db,
        collection : 'sessions'
      })
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(express.favicon())

    // routes should be at the last
    app.use(app.router)

    // Since this is the last non-error-handling
    // middleware use()d, we assume 404, as nothing else
    // responded.

    // $ curl http://localhost:3000/notfound
    // $ curl http://localhost:3000/notfound -H "Accept: application/json"
    // $ curl http://localhost:3000/notfound -H "Accept: text/plain"

    app.use(function(req, res, next){
      res.status(404);
      
      // respond with html page
      if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
      }

      // respond with json
      if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
      }

      // default to plain-text. send()
      res.type('txt').send('Not found');
    });

    // error-handling middleware, take the same form
    // as regular middleware, however they require an
    // arity of 4, aka the signature (err, req, res, next).
    // when connect has an error, it will invoke ONLY error-handling
    // middleware.

    // If we were to next() here any remaining non-error-handling
    // middleware would then be executed, or if we next(err) to
    // continue passing the error, only error-handling middleware
    // would remain being executed, however here
    // we simply respond with an error page.

    app.use(function(err, req, res, next){
      // we may use properties of the error object
      // here and next(err) appropriately, or if
      // we possibly recovered from the error, simply next().
      res.status(err.status || 500);
      res.render('500', { error: err });
    });
  });
  
  app.configure('development', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    app.locals.pretty = true;
    app.enable('verbose errors');
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
    app.disable('verbose errors');
    app.set('showStackError', false);
  });

}
