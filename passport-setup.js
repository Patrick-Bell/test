const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const registerRouter = require('./register');
const User = require('./models/user'); // Assuming the User model is in the models folder


async function getUserByEmail(email) {
  console.log('Searching for user with email:', email);
  try {
    const trimmedEmail = email.trim().toLowerCase();
    console.log('Trimmed and lowercased email:', trimmedEmail);
    const user = await User.findOne({ email: trimmedEmail });
    console.log('Found user:', user);
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error.message);
    return null;
  }
}

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    try {
      console.log('Attempting to authenticate user with email:', email);
  
      const user = await getUserByEmail(email.toLowerCase());
  
      if (!user) {
        console.log('No user with that email:', email);
        return done(null, false, { message: 'No user with that email' });
      }
  
      let passwordMatch = false;
  
      try {
        // Use bcrypt.compareSync for synchronous comparison
        passwordMatch = bcrypt.compareSync(password, user.password);
      } catch (compareError) {
        console.error('Error during password comparison:', compareError);
        return done(null, false, { message: 'Incorrect password' });
      }
  
      if (passwordMatch) {
        console.log('User authenticated successfully:', user);
        return done(null, user);
      } else {
        console.log('Password incorrect for user:', user.username);
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      return done(error);
    }
  };
  
  
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

  passport.serializeUser((user, done) => {
    console.log('Serializing user. User ID:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user. User ID:', id);
    // Implement logic to fetch user by id and pass it to done
    const user = await getUserById(id);
    done(null, user);
  });
}

module.exports = initialize;