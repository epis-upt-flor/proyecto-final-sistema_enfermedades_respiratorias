/**
 * Dashboard Routes
 * Routes for dashboard analytics and statistics
 */

import { Router } from 'express';
import {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
  getSystemHealth
} from '../controllers/dashboardController';
import { auth } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(auth);

/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get admin dashboard overview
 * @access  Private (Admin only)
 */
router.get('/admin', getAdminDashboard);

/**
 * @route   GET /api/v1/dashboard/doctor
 * @desc    Get doctor dashboard overview
 * @access  Private (Doctor, Admin)
 */
router.get('/doctor', getDoctorDashboard);

/**
 * @route   GET /api/v1/dashboard/patient
 * @desc    Get patient dashboard overview
 * @access  Private (Patient, Doctor, Admin)
 */
router.get('/patient', getPatientDashboard);

/**
 * @route   GET /api/v1/dashboard/health
 * @desc    Get system health status
 * @access  Private (Admin only)
 */
router.get('/health', getSystemHealth);

export default router;
