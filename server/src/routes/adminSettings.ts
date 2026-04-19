import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dataService from '../services/dataService';
import * as auditService from '../services/auditService';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await dataService.getSettings();
    const { auth, ...safeSettings } = settings;
    res.json(safeSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await dataService.updateSettings(req.body);
    const { auth, ...safeSettings } = settings;
    await auditService.appendAuditEntry('UPDATE_SETTINGS', req.user?.username || 'admin', {
      Fields: Object.keys(req.body).join(', '),
    });
    res.json(safeSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
