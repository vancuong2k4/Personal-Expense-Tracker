// TODO: Bước 1 — Xác thực
exports.register = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'register placeholder' })
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'login placeholder' })
  } catch (err) { next(err) }
}
