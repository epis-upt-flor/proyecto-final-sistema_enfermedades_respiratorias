import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { analyticsService } from '../services/analyticsService';
import { epidemiologicalService } from '../services/epidemiologicalService';

const router = Router();

router.get(
  '/executive-dashboard',
  asyncHandler(async (req: Request, res: Response) => {
    const periodInDays = req.query.periodInDays
      ? parseInt(req.query.periodInDays as string, 10)
      : undefined;
    const includeOutbreakPrediction =
      (req.query.includeOutbreak as string)?.toLowerCase() === 'true';

    const data = await analyticsService.getExecutiveDashboardData({
      periodInDays,
      includeOutbreakPrediction,
    });

    res.status(200).json({
      success: true,
      data,
    });
  }),
);

router.get(
  '/epidemiology/district-trends',
  asyncHandler(async (req: Request, res: Response) => {
    const periodInDays = req.query.periodInDays
      ? parseInt(req.query.periodInDays as string, 10)
      : 30;

    const data = await epidemiologicalService.getDistrictTrends({
      days: periodInDays,
    });

    res.status(200).json({
      success: true,
      data,
    });
  }),
);

router.get(
  '/epidemiology/outbreaks',
  asyncHandler(async (req: Request, res: Response) => {
    const recentWindowDays = req.query.recentWindowDays
      ? parseInt(req.query.recentWindowDays as string, 10)
      : undefined;
    const baselineWindowDays = req.query.baselineWindowDays
      ? parseInt(req.query.baselineWindowDays as string, 10)
      : undefined;

    const data = await epidemiologicalService.predictOutbreaks({
      recentWindowDays,
      baselineWindowDays,
    });

    res.status(200).json({
      success: true,
      data,
    });
  }),
);

export default router;

