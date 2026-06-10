export const notFound = (req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl })
}
export const errorHandler = (err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({ error: err.message || 'Error interno del servidor' })
}
