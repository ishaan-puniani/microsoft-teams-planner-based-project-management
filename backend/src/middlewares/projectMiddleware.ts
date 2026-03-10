export async function projectMiddleware(req, res, next) {
  try {
    req.projectId =
      req.get('projectId') || req.cookies?.projectId || null;
    next();
  } catch (error) {
    next(error);
  }
}
