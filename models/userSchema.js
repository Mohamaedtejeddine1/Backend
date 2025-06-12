const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    profilImage: {
  type: String,
  default: '', 
},
    username: {
      type: String,
      required: false,
      unique: true,
    },
   
    telephone: {
      type: String
    }
    ,
    email: {
      type: String,

      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    emailVerified: { type: Boolean, default: false },
    // In your userSchema (e.g., User.js)
    telephone: {
      type: String,
      required: false, // set to true if mandatory
    },

    location: {
      type: String,
      required: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
      compatible:String,
      matchedSkills:String,
      newPassword:String,
      cvLink: String,
    password: {
      type: String,
     required: true,
      minLength: 8,
    
    },
  
    loginCount: {
  type: Number,
  default: 0
},
isOnline: {
  type: Boolean,
  default: false
},lastLogin: {
  type: Date 
},education:String,
    role: {
      type: String,
      enum: ["admin", "candidat", "recruteur"],
    },
    profil: { type: String },
offres: [
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Offre" },
    titre: String
  }
],
    cvAnalysis: {
      type: Map,
      of: String,  // You can make this an object if you need more detailed structure
    },

 
    experiences: [{ type: String, }], // keep as array so future updates work.
    competance: [{ type: String }],
     linkedin: {
      type: String,
      required: false,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Invalid LinkedIn URL'],
    },

  company: { type: String },
  poste: { type: String },
  },



  { timestamps: true }
);











userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip hashing if password is not modified
  try {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Email not found");
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      throw new Error("Invalid password");
    }

    return user; // Return the user if authentication is successful
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};


userSchema.post("save", async function (req, res, next) {
  console.log("new user was created & saved successfully");
  next();
});
/*
userSchema.statics.login = async function (email, password) {
    //console.log(email, password);
    const user = await this.findOne({ email });
    //console.log(user)
    if (user) {
      const auth = await bcrypt.compare(password,user.password);
      //console.log(auth)
      if (auth) {
        // if (user.etat === true) {
        //   if (user.ban === false) {
            return user;
        //   } else {
        //     throw new Error("ban");
        //   }
        // } else {
        //   throw new Error("compte desactive ");
        // }
      } else {
        throw new Error("password invalid"); 
      }
    } else {
      throw new Error("email not found");
    }
};*/


userSchema.statics.register = async function (username, email, password, role) {
  if (!["candidat", "recruteur"].includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await this.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = new this({ username, email, password, role });
 

  await user.save();
  return user;
};
async function createAdmin() {
  const hashedPassword = await bcrypt.hash("adminA@128", 10);

  const admin = new userModel({
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin",
    username: "Admin"
  });

  await admin.save();
  console.log("✅ Admin created!");
  mongoose.disconnect();
}

const User = mongoose.model("User", userSchema);
module.exports = User;