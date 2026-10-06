import Lesson from '../models/Lesson.js';
import { getRecommendedLessons, markLessonCompleted } from '../services/lessonService.js';

export async function getLessons(req, res, next) {
  try {
    const lessons = await getRecommendedLessons(req.user._id);
    return res.json({ lessons });
  } catch (error) {
    return next(error);
  }
}

export async function completeLesson(req, res, next) {
  try {
    const { lessonId } = req.params;
    const { scoreAfter } = req.body;

    const lesson = await markLessonCompleted(
      req.user._id,
      lessonId,
      scoreAfter || 0
    );

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    return res.json({ lesson });
  } catch (error) {
    return next(error);
  }
}
