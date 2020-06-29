var passport = require('passport-strategy'),
    fetch = require('node-fetch');

function IdentificatorStrategy (options = {}, verify) {
    for (i of ["identificatorHost", "callbackURL"])
        if (!options[i])
            throw new TypeError("IdentificatorStrategy requires the "+i+" option");

    passport.Strategy.call(this);
    this.name = 'identificator';

    this._identificatorHost = options.identificatorHost;
    this._callbackURL = options.callbackURL;
    this._verify = verify;
}

IdentificatorStrategy.prototype.authenticate = function (req, options) {
    var self = this;

    if (req.query && req.query.code) {
        function verified(err, user, info) {
            if (err)
                return self.error(err);
            if (!user)
                return self.fail("some error");
            self.success(user, info);
        }
        
        fetch(this._identificatorHost+"/api/auth?code="+req.query.code)
            .then(res => res.json())
            .then(json => {
                if (json.error)
                    return this.fail({message: json.error});
                else
                    return this._verify(json, verified);
            });
    } else
        this.redirect(this._identificatorHost+"/login?redirect_uri="+this._callbackURL);
}

IdentificatorStrategy.loadUserProfile = function(identificatorHost, userID, done) {
    fetch(identificatorHost+"/u/"+userID+"/json")
        .then(res => res.json())
        .then(json => done(null, json));
}

exports = module.exports = IdentificatorStrategy;
exports.Strategy = IdentificatorStrategy;