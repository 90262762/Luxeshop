// backend/config/passport.js
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');

// ✅ Wrap in a function — only runs when called, after dotenv loads
const initPassport = () => {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        if (!user.avatar) {
          user.avatar = profile.photos[0]?.value || '';
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        name:       profile.displayName,
        email:      profile.emails[0].value,
        password:   `google_${profile.id}_${Date.now()}`,
        avatar:     profile.photos[0]?.value || '',
        isVerified: true,
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = { passport, initPassport };