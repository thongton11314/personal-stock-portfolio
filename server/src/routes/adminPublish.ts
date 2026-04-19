import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dataService from '../services/dataService';
import * as auditService from '../services/auditService';

const router = Router();

router.post('/publish', async (req: AuthRequest, res: Response) => {
  try {
    await dataService.updateSettings({
      publicPage: { ...(await dataService.getSettings()).publicPage, isPublished: true },
    });
    await auditService.appendAuditEntry('PUBLISH', req.user?.username || 'admin', {
      Action: 'Published public portfolio page',
    });
    res.json({ message: 'Portfolio published', isPublished: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish' });
  }
});

router.post('/unpublish', async (req: AuthRequest, res: Response) => {
  try {
    await dataService.updateSettings({
      publicPage: { ...(await dataService.getSettings()).publicPage, isPublished: false },
    });
    await auditService.appendAuditEntry('UNPUBLISH', req.user?.username || 'admin', {
      Action: 'Unpublished public portfolio page',
    });
    res.json({ message: 'Portfolio unpublished', isPublished: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unpublish' });
  }
});

export default router;
