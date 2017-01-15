module.exports = function(req, res, next) {
   // if (req.isAuthenticated()) {
   if (typeof req.session.passport.user !== 'undefined' || req.isAuthenticated()) {
        return next();
    }
    else{
        return res.redirect('/');
    }
};
