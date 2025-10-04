import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from '@np2023v2/nestjs-mongodb';

@Schema({ collection: 'users' })
export class User extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ min: 0, max: 120 })
  age?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ name: 'text' });
