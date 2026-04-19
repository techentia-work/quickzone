import express from 'express';
import {
    updateDeliveryLocation,
    getDeliveryLocation,
    getDeliveryLocationHistory,
    clearDeliveryLocation,
} from '../controllers/delivery/delivery-location.controller';
import { withAuth } from '../lib/middlewares/auth/auth.middleware';

const router = express.Router();

/**
 * @route   POST /api/delivery/location
 * @desc    Update delivery boy's current GPS location
 * @access  Private (Delivery Boy only)
 * @body    { orderId, latitude, longitude, accuracy?, speed?, heading? }
 */
router.post('/location', withAuth(), updateDeliveryLocation);

/**
 * @route   GET /api/delivery/location/:orderId
 * @desc    Get current/latest location of delivery boy for an order
 * @access  Public (Customer can track)
 * @params  orderId
 */
router.get('/location/:orderId', getDeliveryLocation);

/**
 * @route   GET /api/delivery/location/:orderId/history
 * @desc    Get location history/trail for an order
 * @access  Public
 * @params  orderId
 * @query   limit (default: 50)
 */
router.get('/location/:orderId/history', getDeliveryLocationHistory);

/**
 * @route   DELETE /api/delivery/location/:orderId
 * @desc    Clear location data for completed/cancelled order
 * @access  Private (Admin/System)
 */
router.delete(
    '/location/:orderId',
    withAuth(true), // Admin only
    clearDeliveryLocation
);

export default router;
