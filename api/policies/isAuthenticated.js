module.exports = function(req, res, next) {
   if (typeof req.session.passport.user !== 'undefined' || req.isAuthenticated()) {
        return next();
    }
    else{
        return res.redirect('/');
    }
};
