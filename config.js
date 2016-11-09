var ids = {
    facebook : { //https://developers.facebook.com/apps/
    clientID       :  '196516660789393', // your App ID
    clientSecret   :  process.env.facebookClientSecret, // your App Secret
    callbackURL    :  'https://citybars.herokuapp.com/auth/facebook/callback',
    }
};

module.exports = ids;