import jwt from 'jsonwebtoken'

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function roleRequired(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    return next()
  }
}

export function webPortalGuard(req, res, next) {
  if (req.user.role === 'Employee') {
    return res.status(403).json({
      message: 'Akun karyawan hanya untuk akses mobile. Silakan gunakan aplikasi Workmate.',
    })
  }
  next()
}
