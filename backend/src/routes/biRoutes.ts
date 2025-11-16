/**
 * BI Routes
 * 
 * Endpoints para integración con herramientas BI externas (Power BI, Tableau)
 */

import { Router, Request, Response } from 'express';
import { biConnectorService } from '../services/biConnectorService';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/bi/powerbi/:dataset
 * Exporta datos en formato Power BI
 */
router.get(
  '/powerbi/:dataset',
  requireAuth,
  requireRole(['admin', 'doctor']),
  async (req: Request, res: Response) => {
    try {
      const { dataset } = req.params;
      const format = (req.query.format as 'json' | 'odata') || 'json';
      const includeMetadata = req.query.metadata !== 'false';

      // TODO: Obtener datos reales según el dataset solicitado
      // Por ahora, retornamos estructura de ejemplo
      const sampleData: any[] = [];

      const exportData = await biConnectorService.exportForPowerBI(sampleData, {
        format,
        includeMetadata,
      });

      res.json({
        success: true,
        data: exportData,
        message: `Datos exportados para Power BI (dataset: ${dataset})`,
      });
    } catch (error: any) {
      logger.error('Error en endpoint Power BI', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al exportar datos para Power BI',
      });
    }
  }
);

/**
 * GET /api/v1/bi/tableau/:dataset
 * Exporta datos en formato Tableau
 */
router.get(
  '/tableau/:dataset',
  requireAuth,
  requireRole(['admin', 'doctor']),
  async (req: Request, res: Response) => {
    try {
      const { dataset } = req.params;
      const format = (req.query.format as 'json' | 'csv') || 'json';
      const includeMetadata = req.query.metadata !== 'false';

      // TODO: Obtener datos reales según el dataset solicitado
      const sampleData: any[] = [];

      const exportData = await biConnectorService.exportForTableau(sampleData, {
        format,
        includeMetadata,
      });

      // Si es CSV, retornar como texto plano
      if (format === 'csv') {
        const csv = biConnectorService.convertToCSV(exportData.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${dataset}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        data: exportData,
        message: `Datos exportados para Tableau (dataset: ${dataset})`,
      });
    } catch (error: any) {
      logger.error('Error en endpoint Tableau', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al exportar datos para Tableau',
      });
    }
  }
);

/**
 * GET /api/v1/bi/generic/:dataset
 * Exporta datos en formato genérico (JSON/CSV)
 */
router.get(
  '/generic/:dataset',
  requireAuth,
  requireRole(['admin', 'doctor']),
  async (req: Request, res: Response) => {
    try {
      const { dataset } = req.params;
      const format = (req.query.format as 'json' | 'csv') || 'json';
      const includeMetadata = req.query.metadata !== 'false';

      // TODO: Obtener datos reales según el dataset solicitado
      const sampleData: any[] = [];

      const exportData = await biConnectorService.exportGeneric(sampleData, format, includeMetadata);

      // Si es CSV, retornar como texto plano
      if (format === 'csv') {
        const csv = biConnectorService.convertToCSV(exportData.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${dataset}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        data: exportData,
        message: `Datos exportados (dataset: ${dataset}, formato: ${format})`,
      });
    } catch (error: any) {
      logger.error('Error en endpoint BI genérico', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al exportar datos',
      });
    }
  }
);

/**
 * GET /api/v1/bi/odata/:dataset
 * Endpoint OData para Power BI (compatible con OData v4)
 */
router.get(
  '/odata/:dataset',
  requireAuth,
  requireRole(['admin', 'doctor']),
  async (req: Request, res: Response) => {
    try {
      const { dataset } = req.params;
      
      // TODO: Implementar endpoint OData real
      // Por ahora, retornamos estructura básica compatible con OData
      res.json({
        '@odata.context': `${req.protocol}://${req.get('host')}/api/v1/bi/odata/$metadata#${dataset}`,
        value: [],
      });
    } catch (error: any) {
      logger.error('Error en endpoint OData', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al acceder a datos OData',
      });
    }
  }
);

export default router;

