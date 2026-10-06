ALTER TYPE public.pass_status ADD VALUE IF NOT EXISTS 'coming_soon';
ALTER TYPE public.pass_status ADD VALUE IF NOT EXISTS 'raffle';
ALTER TYPE public.redemption_type ADD VALUE IF NOT EXISTS 'carnetx_scan';
ALTER TYPE public.redemption_type ADD VALUE IF NOT EXISTS 'promo_code';
ALTER TYPE public.redemption_type ADD VALUE IF NOT EXISTS 'external_link';
