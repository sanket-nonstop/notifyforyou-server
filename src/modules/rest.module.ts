// ================================
// FILE: src/rest/rest.module.ts
// ================================
/**
 * REST Module Entry (Production-grade)
 * - Exposes REST endpoints (Auth + system only)
 * - Versioned routing
 * - Central place to register REST routes
 */

import { Request, Response, Router } from "express";

import authRoutes from "./auth/auth.routes";

// Route versioning
const router = Router();

/**
 * Health check endpoint
 * - Used by load balancers / uptime monitors
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);

export const restModule = router;
