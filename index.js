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
}

IdentificatorStrategy.prototype.authenticate = function (req, options) {
    if (req.query && req.query.code) {
        fetch(this._identificatorHost+"/api/auth?code="+req.query.code)
            .then(res => res.json())
            .then(json => {
                if (json.error)
                    return this.fail({message: json.error});
                else
                    return this.success(json);
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