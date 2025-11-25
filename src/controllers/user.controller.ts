

export function profile (req, res) {
  try {
    res.status(200).json({message: "Authentificated ✅", user: req.user});
  } catch (error) {
    
  }
}