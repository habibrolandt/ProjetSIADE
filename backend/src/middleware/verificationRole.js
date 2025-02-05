module.exports = (roles = []) => {
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Vous n\'avez pas les permissions nécessaires' 
        });
      }
      next();
    };
  };