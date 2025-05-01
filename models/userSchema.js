const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    profileImage: { String },
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
    // In your userSchema (e.g., User.js)
    telephone: {
      type: String,
      required: false, // set to true if mandatory
    },

    currentPosition: {
      type: String,
      required: false,
    },
      compatible:String,
      matchedSkills:String,

    cv: String,
    password: {
      type: String,
      // required: true,
      minLength: 8,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.",
      ],
    },
  

    role: {
      type: String,
      enum: ["admin", "candidat", "recruteur"],
    },
    profil: { type: String },
    offres: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Offre",
          required: true,
        },
        title: [{

        }]
      },
    ],


    Motivationletter: { type: String },
    experiences: [{ type: String, }], // keep as array so future updates work.
    competance: [{ type: String }],
    offres: [{ type: mongoose.Schema.ObjectId, ref: "offre" }],


  },


  { timestamps: true }
);











userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt();
    const user = this;
    user.password = await bcrypt.hash(user.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

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
userSchema.statics.login = async function (email, password) {
  //console.log(email, password);
  const user = await this.findOne({ email });
  // console.log(user)
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
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
};
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

const User = mongoose.model("User", userSchema);
module.exports = User;