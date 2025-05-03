import { Router } from "express";
import client from "@repo/db/client";

export const mapsRouter = Router();

mapsRouter.get("/all", async (req, res) => {
  try {
    const mapRes = await client.map.findMany({
      include: {
        elements: true
      }
    });

    res.status(200)
      .json({
        message: "fetching map success",
        mapRes
      })
  } catch (error) {
    res.status(400)
      .json({
        message: "fetching map failed"
      })
  }
})

mapsRouter.get("/:mapId", async (req, res) => {
  const mapId = req.params.mapId;
  if (!mapId) {
    res.status(400)
      .json({
        message: "mapId is required"
      })
    return;
  }

  try {
    const mapRes = await client.map.findFirst({
      where: {
        id: mapId
      }
    });

    res.status(200)
      .json({
        message: "fetching map success",
        mapRes
      })
  } catch (error) {
    res.status(400)
      .json({
        message: "fetching map failed"
      })
  }
})