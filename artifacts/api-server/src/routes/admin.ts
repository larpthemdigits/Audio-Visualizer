import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ error: "ADMIN_PASSWORD not configured" });
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ success: true, message: "Login successful" });
});

export default router;
