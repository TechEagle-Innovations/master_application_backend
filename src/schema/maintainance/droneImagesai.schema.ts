import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type DroneImagesAIDocument = DroneImagesAI & Document;

// Embedded subdocument schema
@Schema({ _id: false })
export class ImagePart {
  @Prop({ type: String, required: true })
  url: string;

  @Prop({
    type: String,
    required: true,
    enum: ["crack", "dent", "paint-off", "scratch", "missing-head", "all-good"],
  })
  defectClassName: string;
}

export const ImagePartSchema = SchemaFactory.createForClass(ImagePart); 

@Schema({ timestamps: true })
export class DroneImagesAI {
  @Prop({ type: String, required: true })
  droneId: string;

  @Prop({
    type: Map,
    of: ImagePartSchema, 
    required: true,
  })
  imageParts: Map<string, ImagePart>;
}

export const DroneImagesAISchema = SchemaFactory.createForClass(DroneImagesAI);
