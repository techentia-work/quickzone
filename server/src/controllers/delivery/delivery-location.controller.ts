import { Request, Response } from 'express';
import { DeliveryLocation } from '../../models/delivery/delivery-location.model';
import { Order } from '../../models/order/order.model';
import { AuthRequest } from '../../lib/types/index';

/**
 * Update delivery boy's current location
 * Called every 30 seconds from delivery app
 */
export const updateDeliveryLocation = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, latitude, longitude, accuracy, speed, heading } = req.body;
        const deliveryBoyId = req.user?._id;

        if (!deliveryBoyId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Delivery boy not authenticated',
            });
        }

        // Validate required fields
        if (!orderId || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId, latitude, longitude',
            });
        }

        // Verify this delivery boy is assigned to this order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.assignedDeliveryBoy?.toString() !== deliveryBoyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this order',
            });
        }

        // Create location update
        const locationUpdate = await DeliveryLocation.create({
            orderId,
            deliveryBoyId,
            latitude,
            longitude,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
            },
            accuracy: accuracy || null,
            speed: speed || null,
            heading: heading || null,
            timestamp: new Date(),
        });

        // Emit socket event for real-time updates
        const io = (req as any).app.get('io');
        if (io) {
            io.to(`order-${orderId}`).emit('delivery-location-update', {
                orderId,
                latitude,
                longitude,
                timestamp: locationUpdate.timestamp,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                locationId: locationUpdate._id,
                timestamp: locationUpdate.timestamp,
            },
        });
    } catch (error: any) {
        console.error('Error updating delivery location:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update location',
            error: error.message,
        });
    }
};

/**
 * Get current/latest location of delivery boy for an order
 * Used by customer to track delivery in real-time
 */
export const getDeliveryLocation = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        // Get latest location for this order
        const latestLocation = await DeliveryLocation.findOne({
            orderId,
        })
            .sort({ timestamp: -1 })
            .limit(1)
            .populate('deliveryBoyId', 'name phone');

        if (!latestLocation) {
            return res.status(404).json({
                success: false,
                message: 'No location data found for this order',
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                latitude: latestLocation.latitude,
                longitude: latestLocation.longitude,
                accuracy: latestLocation.accuracy,
                speed: latestLocation.speed,
                heading: latestLocation.heading,
                timestamp: latestLocation.timestamp,
                deliveryBoy: latestLocation.deliveryBoyId,
            },
        });
    } catch (error: any) {
        console.error('Error fetching delivery location:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch location',
            error: error.message,
        });
    }
};

/**
 * Get location history/trail for an order
 * Used to show delivery route on map
 */
export const getDeliveryLocationHistory = async (
    req: Request,
    res: Response
) => {
    try {
        const { orderId } = req.params;
        const { limit = 50 } = req.query;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        // Get location history
        const locationHistory = await DeliveryLocation.find({
            orderId,
        })
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .select('latitude longitude timestamp accuracy');

        return res.status(200).json({
            success: true,
            data: {
                count: locationHistory.length,
                locations: locationHistory,
            },
        });
    } catch (error: any) {
        console.error('Error fetching location history:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch location history',
            error: error.message,
        });
    }
};

/**
 * Delete old location data for an order
 * Called when order is completed/cancelled
 */
export const clearDeliveryLocation = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        await DeliveryLocation.deleteMany({ orderId });

        return res.status(200).json({
            success: true,
            message: 'Location data cleared successfully',
        });
    } catch (error: any) {
        console.error('Error clearing location data:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear location data',
            error: error.message,
        });
    }
};
