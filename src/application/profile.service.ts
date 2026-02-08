import prisma from "../infrastructure/prisma";

export class ProfileService{
    async getProfile(userId: number){
        return prisma.userProfile.findUnique({
            where : {userId}
        })
    }

    async createProfile(userId: number, data?: {
        username?: string;
        email?: string;
        fullName?: string;
    }) {
        return prisma.userProfile.create({
            data: {
                userId,
                username: data?.username,
                email: data?.email,
                fullName: data?.fullName,
                roles: ['EXECUTOR'],
                stack: [],
                specialization: [],
                experienceLevel: 'JUNIOR',
                status: 'ACTIVE',
                rating: 0.0,
                completedJobs: 0
            }as any
        });
    }
    async telegram_at(userId: number, telegramID: number){
        return prisma.userProfile.update({
            where: {userId},
            data: {telegramId: telegramID}
        })
    }

    async getUserIdByUsername(username:string):Promise<number | null>{
        const profile = await prisma.userProfile.findUnique({
            where:{username},
            select:{userId:true}
        });

        return profile?.userId||null;
    }

    async updateProfile(userId: number, data: any) {
    
    const updateData: any = {};
    
    const textFields = [
        'username', 'email', 'fullName', 'bio', 'avatarUrl', 
        'location', 'timezone', 'telegramUsername', 'experienceLevel', 'status'
    ];
    
    for (const field of textFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field] === null || data[field] === '' 
                ? null 
                : String(data[field]);
        }
    }
    
    if (data.specialization !== undefined) {
        if (Array.isArray(data.specialization)) {
            updateData.specialization = data.specialization;
        } else if (typeof data.specialization === 'string') {
            updateData.specialization = [data.specialization];
        } else {
            updateData.specialization = [];
        }
    }
    
    if (data.stack !== undefined) {
        if (Array.isArray(data.stack)) {
            updateData.stack = data.stack;
        } else if (typeof data.stack === 'string') {
            updateData.stack = data.stack.split(',').map((item: string) => item.trim());
        } else {
            updateData.stack = [];
        }
    }
    
    if (data.telegramId !== undefined) {
        const telegramIdNum = Number(data.telegramId);
        updateData.telegramId = isNaN(telegramIdNum) ? null : telegramIdNum;
    }
    
    if (data.hourlyRate !== undefined) {
        const hourlyRateNum = Number(data.hourlyRate);
        updateData.hourlyRate = isNaN(hourlyRateNum) ? null : hourlyRateNum;
    }
    
    if (data.rating !== undefined) {
        const ratingNum = Number(data.rating);
        updateData.rating = isNaN(ratingNum) ? null : ratingNum;
    }
    
    if (data.completedJobs !== undefined) {
        const jobsNum = Number(data.completedJobs);
        updateData.completedJobs = isNaN(jobsNum) ? 0 : jobsNum;
    }
    
    
    try {
        const result = await prisma.userProfile.update({
            where: { userId },
            data: updateData
        });
        
        return result;
        
    } catch (error: any) {
        console.error('Error code:', error.code);
        console.error('Error meta:', error.meta);
        throw error;
    }
}
}
