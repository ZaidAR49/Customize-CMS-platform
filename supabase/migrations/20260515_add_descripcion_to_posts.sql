-- Add descripcion column and migrate existing post body content.
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS descripcion TEXT;

UPDATE public.posts
SET
  descripcion = COALESCE(
    NULLIF(TRIM(descripcion), ''),
    NULLIF(TRIM(description), ''),
    NULLIF(TRIM(metadata->>'body'), '')
  )
WHERE
  descripcion IS NULL
  OR TRIM(descripcion) = '';
