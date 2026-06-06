import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: '/api/auth/google/callback',
      proxy: true, // Crucial for HTTPS on Render/Heroku
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('Google account must have an email associated with it'), null);
      }

      const googleId = profile.id;
      const name = profile.displayName;
      const profilePicture = profile.photos?.[0]?.value;

      try {
        // 1. Try to find by Google ID
        let user = await User.findOne({ googleId });
        if (user) {
          return done(null, user);
        }

        // 2. Try to find by Email (for users who registered locally first)
        user = await User.findOne({ email });
        if (user) {
          // Link Google ID to existing account
          user.googleId = googleId;
          if (!user.name) user.name = name;
          if (!user.profilePicture) user.profilePicture = profilePicture;
          await user.save();
          return done(null, user);
        }

        // 3. Create a new Google User
        user = new User({
          googleId,
          email,
          name,
          profilePicture,
        });
        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize user for sessions (though we use stateless JWT, Passport requires these)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
