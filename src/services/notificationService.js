const Notification = require('../models/Notification');

const addNotification = async (notificationBody) => {
    try {
        const notification = new Notification(notificationBody);
        await notification.save();
        return notification;
    } catch (error) {
        throw error;
    }
}

const addMultipleNofiications = async (data) => {
    try {
        return await Notification.insertMany(data);
    } catch (error) {
        throw error;
    }
}

const getNotificationById = async (id) => {
    return await Notification.findById(id);
}

const getNotifications = async (filter, options) => {
    const productModel = new QueryBuilder(Notification.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    const meta = await productModel.meta();
    return { result, meta }

    // const { page = 1, limit = 10 } = options;
    // const skip = (page - 1) * limit;
    // const notificationList = await Notification.find({ ...filter }).skip(skip).limit(limit).sort({ createdAt: -1 });
    // const totalResults = await Notification.countDocuments({ ...filter });
    // const totalPages = Math.ceil(totalResults / limit);
    // const pagination = { totalResults, totalPages, currentPage: page, limit };
    // return { notificationList, pagination };
}

module.exports = {
    addNotification,
    addMultipleNofiications,
    getNotificationById,
    getNotifications
}