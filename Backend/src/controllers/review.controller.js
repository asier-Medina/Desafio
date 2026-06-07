import * as reviewService from '../services/review.service.js'

export const getMyReviewsHandler = async (req, res) => {
  try {
    const reviews = await reviewService.getMyReviews(req.user.id_user)
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getGastronomyReviewsHandler = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByEntity('gastronomy', Number(req.params.id))
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getCultureReviewsHandler = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByEntity('culture', Number(req.params.id))
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getEventReviewsHandler = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByEntity('event', Number(req.params.id))
    res.json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const createGastronomyReviewHandler = async (req, res) => {
  try {
    const review = await reviewService.createReview('gastronomy', req.user.id_user, Number(req.params.id), req.body)
    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const createCultureReviewHandler = async (req, res) => {
  try {
    const review = await reviewService.createReview('culture', req.user.id_user, Number(req.params.id), req.body)
    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const createEventReviewHandler = async (req, res) => {
  try {
    const review = await reviewService.createReview('event', req.user.id_user, Number(req.params.id), req.body)
    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteReviewHandler = async (req, res) => {
  try {
    const { tipo, id } = req.params
    const result = await reviewService.deleteReview(tipo, Number(id), req.user.id_user)
    res.json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
