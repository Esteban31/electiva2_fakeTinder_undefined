import { User } from "../../../infrastructure/databases/connection.js";

export const createUserService = async (user) => {
  try {
    const newUser = new User({
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      birthDate: user.birthDate,
      isNewUser: true,
      interesting: [{}],
      profilePicture:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg", //Default profile pic
      description: "",
      location: ""
    });

    await newUser.save();
    return true;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("The email is already registered.");
    } else {
      throw new Error("Error creating the user.");
    }
  }
};

export const getUserByIdService = async (id) => {
  try {
    const search = await User.findById(id).exec();

    return {
      info: {
        message: "",
        data: search,
      },
      code: 200,
    };
  } catch (error) {
    return {
      info: {
        message: error.message,
        data: [],
      },
      code: 500,
    };
  }
};

export const loginService = async (user) => {
  try {
    const search = await User.find({
      email: user.email,
      password: user.password,
    }).exec();

    if (search[0].email) {
      return search;
    }
  } catch (error) {
    throw new Error("Error login.");
  }

  console.log(search);
};

export const updateUserService = async (user) => {
  try {
    const search = await User.findOneAndUpdate({ _id: user._id }, user);

    return {
      info: {
        message: "User updated successfully",
        data: [],
      },
      code: 200,
    };
  } catch (error) {
    return {
      info: {
        message: error.message,
        data: [],
      },
      code: 500,
    };
  }
};




// UPDATE TOOPICS
export const updateToopicsService = async (user) => {
  try {
    const search = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { interesting: user.interesting, isNewUser:false } },
      { new: true }
    );

    return {
      info: {
        message: "Toopics updated Successfully",
        data: [],
      },
      code: 200,
    };
  } catch (error) {
    return {
      info: {
        message: error.message,
        data: [],
      },
      code: 500,
    };
  }
};




// GET USERS DIFFERENT TO THE CURRENT USER
export const getFeedUserService = async (currentUser) => {

  try {
    const search = await User.find({ _id: { $ne: currentUser } }).exec()

    return {
      info: {
        message: "",
        data: search
      },
      code: 200,
    };
  } catch (error) {
    return {
      info: {
        message: error.message,
        data: [],
      },
      code: 500,
    };
  }
};
