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
  pending_at: { type: Date, required: false },
  confirmed_at: { type: Date, required: false },
  delivering_at: { type: Date, required: false },
  finished_at: { type: Date, required: false },
  cancelled_at: { type: Date, required: false },
  returned_at: { type: Date, required: false },
  failed_at: { type: Date, required: false },
}, { _id: false });