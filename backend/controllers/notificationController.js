import { supabase } from '../config/supabase.js';

export const getNotifications = async (req, res, next) => {
    try {
        const { user_id, worker_id, unread_only } = req.query;
        
        let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
        
        if (user_id) query = query.eq('user_id', user_id);
        if (worker_id) query = query.eq('worker_id', worker_id);
        if (unread_only === 'true') query = query.eq('read', false);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const notificationsFormatted = data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            icon: n.icon,
            time: n.time_ago,
            read: n.read
        }));
        
        res.json({ success: true, count: notificationsFormatted.length, data: notificationsFormatted });
    } catch (error) {
        next(error);
    }
};

export const createNotification = async (req, res, next) => {
    try {
        const { user_id, worker_id, title, message, type, icon } = req.body;
        
        const { data: newNotification, error } = await supabase
            .from('notifications')
            .insert([{
                user_id,
                worker_id,
                title,
                message,
                type: type || 'info',
                icon,
                time_ago: 'Just now'
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({ success: true, data: newNotification });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const { user_id, worker_id } = req.query;
        
        let query = supabase.from('notifications').update({ read: true });
        
        if (user_id) query = query.eq('user_id', user_id);
        if (worker_id) query = query.eq('worker_id', worker_id);
        
        const { error } = await query;
        
        if (error) throw error;
        
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (req, res, next) => {
    try {
        const { user_id, worker_id } = req.query;
        
        let query = supabase.from('notifications').select('id').eq('read', false);
        
        if (user_id) query = query.eq('user_id', user_id);
        if (worker_id) query = query.eq('worker_id', worker_id);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        res.json({ success: true, count: data?.length || 0 });
    } catch (error) {
        next(error);
    }
};
