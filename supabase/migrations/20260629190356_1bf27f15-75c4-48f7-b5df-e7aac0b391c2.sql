
-- Make count triggers run with definer rights so non-owners can like/save and counts update
ALTER FUNCTION public.tg_gig_likes_count() SECURITY DEFINER;
ALTER FUNCTION public.tg_gig_saves_count() SECURITY DEFINER;
ALTER FUNCTION public.tg_job_likes_count() SECURITY DEFINER;
ALTER FUNCTION public.tg_job_saves_count() SECURITY DEFINER;

-- Backfill counts that the trigger missed
UPDATE public.gigs g SET
  likes_count = (SELECT count(*) FROM public.gig_likes WHERE gig_id=g.id),
  saves_count = (SELECT count(*) FROM public.gig_saves WHERE gig_id=g.id);
UPDATE public.jobs j SET
  likes_count = (SELECT count(*) FROM public.job_likes WHERE job_id=j.id),
  saves_count = (SELECT count(*) FROM public.job_saves WHERE job_id=j.id);
