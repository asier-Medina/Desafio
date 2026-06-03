import * as reviewService from '../services/review.service.js'

export const getReviewsByEntidadHandler = async (req, res) => {
  try {
    const { tipo, entidad_id } = req.params
    const reviews = await reviewService.getReviewsByEntidad(tipo, Number(entidad_id))
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const createReviewHandler = async (req, res) => {
  try {
    const { tipo, entidad_id } = req.params
    const review = await reviewService.createReview(tipo, req.user.id_user, Number(entidad_id), req.body)
    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const updateReviewHandler = async (req, res) => {
  try {
    const { tipo, entidad_id } = req.params
    const review = await reviewService.updateReview(tipo, req.user.id_user, Number(entidad_id), req.body)
    res.json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteReviewHandler = async (req, res) => {
  try {
    const { tipo, entidad_id } = req.params
    const result = await reviewService.deleteReview(tipo, req.user.id_user, Number(entidad_id))
    res.json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

export const getMyReviewsHandler = async (req, res) => {
  try {
    const { tipo } = req.query
    const reviews = await reviewService.getMyReviews(req.user.id_user, tipo)
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
