import mongoose, {Document, Schema, Types} from "mongoose";

interface ITopic extends Document {
    title: string;
    content: string;
    username: string;
    createdAt: Date;
}


const topicSchema : Schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Topic: mongoose.Model<ITopic> = mongoose.model<ITopic>("Topic", topicSchema)

export {Topic}