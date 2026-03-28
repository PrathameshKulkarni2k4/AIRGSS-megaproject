const ActivityLog = require('../models/ActivityLog');

exports.logActivity = (action, resource) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (data) => {
    if (data.success !== false && req.user) {
      try {
        await ActivityLog.create({
          userId: req.user._id,
          action,
          resource,
          resourceId: req.params.id || data.data?._id,
          details: { method: req.method, path: req.path },
          ipAddress: req.ip
        });
      } catch (e) { /* silent fail */ }
    }
    return originalJson(data);
  };
  next();
};
