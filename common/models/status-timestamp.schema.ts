import { Schema } from "mongoose";

export interface IStatusTimestamps{
    pending_at?: Date,
    confirmed_at?: Date,
    delivering_at?: Date,
    finished_at?: Date,
    cancelled_at?: Date,
    returned_at?: Date,
    failed_at?: Date,
}

export const StatusTimestampsSchema = new Schema<IStatusTimestamps>({
  pending_at: { type: Date },
  confirmed_at: { type: Date },
  delivering_at: { type: Date },
  finished_at: { type: Date },
  cancelled_at: { type: Date },
  returned_at: { type: Date },
  failed_at: { type: Date },
}, { _id: false });