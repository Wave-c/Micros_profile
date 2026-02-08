import { Router } from 'express';
import { ProfileController } from '../src/controllers/profile.controller'
import { authMiddleware } from '../src/authMiddleware';

const router = Router();
const controller = new ProfileController();


router.post('/', controller.create.bind(controller));
router.get('/username/:username/userId', controller.getUserIdByUsername.bind(controller));
router.use(authMiddleware);

router.get('/by-id/:userId', async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }
    
    const requestedParam = req.params.userId;
    
    if (requestedParam === 'me') {
      const profile = await controller.service.getProfile(currentUserId);
      return res.json(profile || { message: 'Profile not found' });
    }
    
    const requestedNum = Number(requestedParam);
    
    if (isNaN(requestedNum)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User ID must be a number or "me"'
      });
    }
    
    if (requestedNum !== currentUserId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only view your own profile' 
      });
    }
    
    const profile = await controller.service.getProfile(requestedNum);
    res.json(profile || { message: 'Profile not found' });
    
  } catch (error: any) {
    console.error('Error in /by-id/:userId:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    
    if (!currentUserId) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    
    const profile = await controller.service.getProfile(currentUserId);
    res.json(profile || { message: 'Profile not found' });
    
  } catch (error: any) {
    console.error('Error in /me:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});


router.patch('/me', controller.update.bind(controller));
router.post('/telegram', controller.connectTelegram.bind(controller));

export default router;
