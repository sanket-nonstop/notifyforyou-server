import { DialCode } from "@constants/country.constants";
import {
  AccountActionBy,
  AccountStatus,
  AuthProvider,
  Gender,
} from "@constants/enum.constants";
import {
  BIO_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  USERNAME_REGEX,
} from "@constants/regex.constants";
import { Document, Schema, Types, model } from "mongoose";

/* ----------------------------------
 INTERFACE
-----------------------------------*/
export interface IUserAssestMedia {
  url: string;
  public_id: string;
  resource_type: "image" | "video";
  updatedAt: Date;
}

export interface IUserAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: String;
  pincode?: string;
}

export interface IUserStatusMeta {
  actionBy: AccountActionBy;
  actionByUserId: Types.ObjectId;
  reason?: string;
  actionAt: Date;
}

export interface IUser extends Document {
  username?: string;
  firstName?: string;
  lastName?: string;

  email: string;
  emailIsVerified: boolean;

  dialCode?: DialCode;
  phoneNumber?: string;
  phoneIsVerified: boolean;

  profilePicture?: IUserAssestMedia;
  coverPicture?: IUserAssestMedia;
  introVideo?: IUserAssestMedia;

  gender?: Gender;
  dateOfBirth?: Date;
  bio?: string;

  password?: string;

  provider: AuthProvider;
  providerId?: string;

  businessProfileId?: Types.ObjectId;
  otherBusinessProfileIds?: Types.ObjectId[];

  status: AccountStatus;
  statusMeta?: IUserStatusMeta;

  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------------------
 SCHEMA
-----------------------------------*/
export const AssetMediaSchema = new Schema<IUserAssestMedia>(
  {
    url: { type: String },
    public_id: { type: String, select: false },
    resource_type: { type: String, enum: ["image", "video"], select: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StatusMetaSchema = new Schema<IUserStatusMeta>(
  {
    actionBy: {
      type: String,
      enum: Object.values(AccountActionBy),
      required: true,
    },
    actionByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, trim: true, maxlength: 500 },
    actionAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      sparse: true,
      set: (value?: string) => (value?.trim() === "" ? undefined : value),
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return USERNAME_REGEX.test(value);
        },
        message:
          "Username must be 3-20 characters and can contain letters, numbers, dots, and underscores.",
      },
    },

    firstName: {
      type: String,
      trim: true,
      maxlength: 20,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return NAME_REGEX.test(value);
        },
        message: "First name must be 3-20 characters.", //, max 3 spaces, no continuous spaces
      },
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 20,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return NAME_REGEX.test(value);
        },
        message: "Last name must be 3-20 characters.", //, max 3 spaces, no continuous spaces
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    emailIsVerified: {
      type: Boolean,
      default: false,
    },

    dialCode: {
      type: String,
      enum: Object.values(DialCode),
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return value.length >= 7 && value.length <= 15;
        },
        message: "Phone number must be between 7 and 15 digits",
      },
    },

    phoneIsVerified: {
      type: Boolean,
      default: false,
    },

    profilePicture: AssetMediaSchema,
    coverPicture: AssetMediaSchema,
    introVideo: AssetMediaSchema,

    gender: { type: String, enum: Object.values(Gender) },
    dateOfBirth: { type: Date },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return BIO_REGEX.test(value);
        },
        message: "Bio name must be 3-200 characters.", //, max 3 spaces, no continuous spaces
      },
    },

    password: {
      type: String,
      select: false,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return !PASSWORD_REGEX.test(value);
        },
        message:
          "Password must be 8-24 characters and include uppercase, lowercase, number, and special character.",
      },
    },

    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
      required: true,
      select: false,
    },

    providerId: {
      type: String,
      select: false,
      trim: true,
    },

    businessProfileId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessProfile",
      index: true,
    },
    otherBusinessProfileIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "BusinessProfile",
        index: true,
      },
    ],

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
      index: true,
      select: false,
    },

    statusMeta: {
      type: StatusMetaSchema,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ----------------------------------
 CONDITIONAL VALIDATION
-----------------------------------*/

UserSchema.pre("validate", function (this: IUser) {
  if (this.provider === AuthProvider.LOCAL) {
    if (!this.password) {
      throw new Error("Password is required.");
    }
  } else {
    if (!this.providerId) {
      throw new Error("providerId is required for social login providers");
    }
  }
});

/* ----------------------------------
 MODEL
-----------------------------------*/

export const UserModel = model<IUser>("User", UserSchema);
