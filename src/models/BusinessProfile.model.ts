import { DialCode } from "@constants/country.constants";
import { AccountActionBy, AccountStatus } from "@constants/enum.constants";
import { BIO_REGEX } from "@constants/regex.constants";
import { Document, Schema, Types, model } from "mongoose";
import {
  AssetMediaSchema,
  IUserAddress,
  IUserAssestMedia,
  IUserStatusMeta,
} from "./User.model";

/* ----------------------------------
 INTERFACES
----------------------------------- */
export interface IBusinessTiming {
  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "18:00"
}

export interface IBusinessProfile extends Document {
  ownerUserId: Types.ObjectId;

  businessName: string;

  businessEmail?: string;
  emailIsVerified: boolean;

  dialCode?: DialCode;
  businessPhoneNumber?: string;
  phoneIsVerified: boolean;

  businessProfilePicture?: IUserAssestMedia;
  businessCoverPicture?: IUserAssestMedia;
  businessIntroVideo?: IUserAssestMedia;

  businessAddress: IUserAddress;

  businessBio?: string;

  timings?: IBusinessTiming[];

  establishedDate?: Date;

  status: AccountStatus;
  statusMeta?: IUserStatusMeta;

  createdAt: Date;
  updatedAt: Date;
}

/* ----------------------------------
 SUB SCHEMAS
----------------------------------- */

const BusinessStatusMetaSchema = new Schema<IUserStatusMeta>(
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

const BusinessAddressSchema = new Schema<IUserAddress>(
  {
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const BusinessTimingSchema = new Schema<IBusinessTiming>(
  {
    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      required: true,
    },
    isOpen: { type: Boolean, default: false },
    openTime: { type: String },
    closeTime: { type: String },
  },
  { _id: false }
);

/* ----------------------------------
 MAIN SCHEMA
----------------------------------- */

const BusinessProfileSchema = new Schema<IBusinessProfile>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    businessName: {
      type: String,
      trim: true,
      maxlength: 200,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return BIO_REGEX.test(value);
        },
        message: "Business name must be 3-200 characters.", //, max 3 spaces, no continuous spaces
      },
    },

    businessEmail: {
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

    businessPhoneNumber: {
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

    businessProfilePicture: AssetMediaSchema,
    businessCoverPicture: AssetMediaSchema,
    businessIntroVideo: AssetMediaSchema,

    businessAddress: {
      type: BusinessAddressSchema,
      required: true,
    },

    businessBio: {
      type: String,
      trim: true,
      maxlength: 200,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          return BIO_REGEX.test(value);
        },
        message: "Bio must be 3–200 characters.",
      },
    },

    timings: {
      type: [BusinessTimingSchema],
    },

    establishedDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
      index: true,
    },

    statusMeta: {
      type: BusinessStatusMetaSchema,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ----------------------------------
 MODEL
----------------------------------- */

export const BusinessProfileModel = model<IBusinessProfile>(
  "BusinessProfile",
  BusinessProfileSchema
);
