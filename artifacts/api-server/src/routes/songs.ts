import { Router, type IRouter } from "express";
import { db, songsTable, insertSongSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/random", async (req, res) => {
  try {
    const [song] = await db
      .select()
      .from(songsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!song) {
      res.status(404).json({ error: "No songs found" });
      return;
    }

    res.json({
      id: song.id,
      title: song.title,
      artist: song.artist,
      soundcloudUrl: song.soundcloudUrl,
      createdAt: song.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get random song");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const songs = await db.select().from(songsTable).orderBy(songsTable.createdAt);
    res.json(
      songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        soundcloudUrl: s.soundcloudUrl,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list songs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = insertSongSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [song] = await db.insert(songsTable).values(parsed.data).returning();
    res.status(201).json({
      id: song.id,
      title: song.title,
      artist: song.artist,
      soundcloudUrl: song.soundcloudUrl,
      createdAt: song.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add song");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(songsTable)
      .where(eq(songsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Song not found" });
      return;
    }

    res.json({ success: true, message: "Song deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete song");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
