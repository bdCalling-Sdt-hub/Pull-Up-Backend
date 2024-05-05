const QueryBuilder = require('../builder/QueryBuilder');
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

const getNotifications = async (query) => {
    const productModel = new QueryBuilder(Notification.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    const meta = await productModel.meta();
    return { result, meta }
}

const userNotifications = async (query) => {
    const productModel = new QueryBuilder(Notification.find(), query)
        .search()
        .filter()
        .paginate()
        .sort()
        .fields();

    const result = await productModel.modelQuery;
    console.log(result)
    const meta = await productModel.meta();
    return { result, meta }
}

module.exports = {
    addNotification,
    addMultipleNofiications,
    getNotificationById,
    getNotifications,
    userNotifications
}