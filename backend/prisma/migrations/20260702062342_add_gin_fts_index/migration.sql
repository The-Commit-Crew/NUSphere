CREATE INDEX "Post_fts_gin_idx" ON "Post" USING GIN (
  to_tsvector('english', title || ' ' || content)
);