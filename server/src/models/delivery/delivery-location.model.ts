import mongoose from 'mongoose';

const DeliveryLocationSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true,
        },
        deliveryBoyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryBoy',
            required: true,
            index: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        accuracy: {
            type: Number, // in meters
        },
        speed: {
            type: Number, // in m/s
        },
        heading: {
            type: Number, // in degrees
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Create 2dsphere index for geospatial queries
DeliveryLocationSchema.index({ location: '2dsphere' });

// Index for efficient queries
DeliveryLocationSchema.index({ orderId: 1, timestamp: -1 });
DeliveryLocationSchema.index({ deliveryBoyId: 1, timestamp: -1 });

// TTL index - auto delete old location data after 7 days
DeliveryLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

export const DeliveryLocation = mongoose.model(
    'DeliveryLocation',
    DeliveryLocationSchema
);
