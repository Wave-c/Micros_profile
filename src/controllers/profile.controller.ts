import { error } from "node:console";
import { ProfileService } from "../application/profile.service";

export class ProfileController{
    public service = new ProfileService();


    async getMe(req: any, res: any) {
        try {
            const profile = await this.service.getProfile(req.user.userId);
            res.json(profile || { message: 'Profile not found' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserIdByUsername(req:any, res:any){
        try{
            const {username} = req.params;
            if(!username){
                return res.status(400).json({
                    error:'bed Request',
                    message:'username is required'
                });
            }
            const userId = await this.service.getUserIdByUsername(username);

            if(!userId){
                return res.status(404).json({
                    error: 'Not found',
                    message: 'UserId not found'
                });

            }
            res.json({
                succes:true,
                userId,
                username
            });

        }catch(error:any){
            res.status(500).json({
                error:'Servver Error',
                message: error.message
            });
        }
    }



    async create(req: any, res: any) {
        try {
            const { userId } = req.body; 
            if (!userId) {
                return res.status(400).json({ error: "userId is required" });
            }
            const profile = await this.service.createProfile(userId);
            res.json(profile);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async connectTelegram(req: any, res: any) {
        try {
            const { telegramID } = req.body;
            const profile = await this.service.telegram_at(
                req.user.userId, 
                telegramID
            );
            res.json(profile);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }




    async update(req: any, res: any) {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'User not authenticated' 
            });
        }
        
        const updateData = req.body;
        
        const allowedFields = [
            'username',
            'email', 
            'fullName',
            'bio',
            'avatarUrl',
            'location',
            'timezone',
            
            'specialization',
            'stack',
            'experienceLevel',
            'hourlyRate',
            
            'status',
            
            'telegramId',
            'telegramUsername'
        ];
        
        const filteredData: any = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined && updateData[field] !== null) {
                filteredData[field] = updateData[field];
            }
        }
        
        const validationErrors: string[] = [];
        
        if (filteredData.email && !this.isValidEmail(filteredData.email)) {
            validationErrors.push('Invalid email format');
        }
        
        
        if (filteredData.experienceLevel && 
            !['JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD'].includes(filteredData.experienceLevel)) {
            validationErrors.push('experienceLevel must be JUNIOR, MIDDLE, SENIOR or LEAD');
        }
        
        if (filteredData.status && 
            !['ACTIVE', 'INACTIVE', 'BANNED', 'BUSY'].includes(filteredData.status)) {
            validationErrors.push('status must be ACTIVE, INACTIVE, BANNED or BUSY');
        }
        
        if (filteredData.hourlyRate !== undefined) {
            const rate = parseFloat(filteredData.hourlyRate);
            if (isNaN(rate) || rate < 0) {
                validationErrors.push('hourlyRate must be a positive number');
            } else {
                filteredData.hourlyRate = rate; 
            }
        }
        
        if (filteredData.telegramId !== undefined) {
            const telegramId = parseInt(filteredData.telegramId);
            if (isNaN(telegramId) || telegramId <= 0) {
                validationErrors.push('telegramId must be a positive number');
            } else {
                filteredData.telegramId = telegramId; 
            }
        }
        
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Validation Error',
                messages: validationErrors
            });
        }
        
        const updatedProfile = await this.service.updateProfile(userId, filteredData);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedProfile
        });
        
    } catch (error: any) {
            console.error('Error updating profile:', error);
            
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0] || 'field';
                return res.status(409).json({
                    error: 'Conflict',
                    message: `${field} already exists`
                });
            }
            
            if (error.code === 'P2025') {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Profile not found'
                });
            }
            
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: 'Failed to update profile',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
