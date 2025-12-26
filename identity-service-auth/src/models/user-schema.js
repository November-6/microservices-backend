const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });


// basically a function that will run before the 'Save' event on this schema

// anytime u wanna use user.save, it will take care of password hashing so we dont have to do it again and again 

userSchema.pre('save', async function (next) {
  try{

    if (this.isModified('passwordHash')) {
      this.passwordHash = await argon2.hash(this.passwordHash);
    }
  }catch(err){
    return next(err);
  }

})

// compares password, will be used during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  try{
    return argon2.verify(this.passwordHash, enteredPassword);
  }catch(err){
    throw err;
  }
}


// even idk what this does 
userSchema.index({ username: 'text' });


const userModel = mongoose.model('User', userSchema);
module.exports = userModel;


