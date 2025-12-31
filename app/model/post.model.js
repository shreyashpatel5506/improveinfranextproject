import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        /** 📝 Post Title */
        title: {
            type: String,
            required: true,
            trim: true,
        },

        /** 🧾 Complaint / Issue Description */
        description: {
            type: String,
            required: true,
        },

        /** 🏢 Department responsible */
        department: {
            type: String,
            required: true,
        },

        /** 🗂 Issue Category */
        category: {
            type: String,
            enum: [
                "Roads & Traffic",
                "Water",
                "Electricity",
                "Garbage",
                "Emergency",
                "Other",
            ],
            default: "Other",
        },

        /** 📌 Current status of complaint */
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending",
        },

        /** 📍 Location of the issue */
        location: {
            type: String,
            required: true,
        },

        /** 🚨 Priority (assigned by officer/admin) */
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low",
        },

        /** 🖼 Image URL (optional) */
        imageUrl: {
            type: String,
            default: "",
        },

        /** 🎥 Video URL (optional) */
        videoUrl: {
            type: String,
            default: "",
        },

        /** 👍 Total likes */
        likesCount: {
            type: Number,
            default: 0,
        },

        /** 💬 Comments list */
        comments: [
            {
                text: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        /** 💬 Number of comments */
        commentsCount: {
            type: Number,
            default: 0,
        },

        /** 👁 Views count */
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

/** ✅ Validation: At least one media required (image OR video) */
postSchema.pre("validate", function (next) {
    if (!this.imageUrl && !this.videoUrl) {
        next(new Error("Either image or video is required"));
    } else {
        next();
    }
});

export default mongoose.model("Post", postSchema);
