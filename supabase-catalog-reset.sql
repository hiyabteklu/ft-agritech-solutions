-- FT Agri-Tech catalog RESET + seed
-- Use this if you got: column "sector_id" does not exist
--
-- WARNING: This drops ONLY these three tables (and their rows):
--   public.products, public.sector_problems, public.sectors
-- It does NOT touch quote_requests, problems, custom_requests, contact_messages.
--
-- Run in Supabase → SQL Editor → New query → Run

-- 1) Drop in dependency order
drop table if exists public.products cascade;
drop table if exists public.sector_problems cascade;
drop table if exists public.sectors cascade;

-- 2) Recreate tables
create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  code text not null default '',
  title text not null,
  subtitle text not null default '',
  scope text not null default '',
  img_prefix text not null default '',
  keywords text not null default '',
  image text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.sector_problems (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references public.sectors(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references public.sectors(id) on delete cascade,
  catalog_type text not null check (catalog_type in ('local', 'imported')),
  name text not null,
  solves text not null default '',
  price text not null default '',
  rating text not null default '4.5/5',
  status text not null default 'In Stock',
  description text not null default '',
  image_path text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sector_problems_sector on public.sector_problems(sector_id);
create index idx_products_sector on public.products(sector_id);
create index idx_products_catalog on public.products(sector_id, catalog_type);

-- 3) RLS
alter table public.sectors enable row level security;
alter table public.sector_problems enable row level security;
alter table public.products enable row level security;

drop policy if exists "Public read published sectors" on public.sectors;
create policy "Public read published sectors"
  on public.sectors for select
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "Public read sector_problems" on public.sector_problems;
create policy "Public read sector_problems"
  on public.sector_problems for select
  using (true);

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products"
  on public.products for select
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "Auth manage sectors" on public.sectors;
create policy "Auth manage sectors"
  on public.sectors for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth manage sector_problems" on public.sector_problems;
create policy "Auth manage sector_problems"
  on public.sector_problems for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Auth manage products" on public.products;
create policy "Auth manage products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4) Seed all 7 sectors
do $$
declare
  sid uuid;
begin
  -- 01 Apiculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'apiculture', '01', 'Apiculture',
    'Advanced engineering interventions for honey, beeswax, and apiary management.',
    'Ethiopia holds a deeply rooted tradition of beekeeping and stands as Africa''s largest honey producer.',
    'api', 'apiculture bees honey', '/assets/images/cat1.jpg', 1
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Micro-Climate Volatility', 'Inability to track internal hive temperature and humidity causes colony collapse during unexpected weather shifts.', 1),
    (sid, 'Pest Intrusion', 'Undetected Varroa mite and wax moth infestations silently destroy colonies before visual inspections catch them.', 2),
    (sid, 'Harvest Yield Loss', 'Traditional and crude modern extraction methods result in significant comb destruction.', 3),
    (sid, 'Forage Tracking', 'Lack of geospatial data regarding floral blooms forces blind hive placement.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Smart-Temp Hive Node v1', 'Micro-Climate Volatility', '4,200 ETB', '4.9/5', 'Ready to Deploy',
     'Solar-powered IoT sensor that monitors hive humidity and temperature.',
     '/assets/images/smart-temp_hive_node_v1.jpg', 1),
    (sid, 'local', 'Eco-Comb Centrifuge Extractor', 'Harvest Yield Loss', '12,500 ETB', '4.7/5', 'In Stock',
     'Locally manufactured stainless steel extractor that preserves wax comb.',
     '/assets/images/eco-comb_centrifuge_extractor.jpg', 2),
    (sid, 'imported', 'Varroa-Shield Auto Vaporizer', 'Pest Intrusion', '8,900 ETB', '4.8/5', 'Global Sourcing',
     'Automated oxalic acid vaporizer for Varroa mite control.',
     '/assets/images/varroa-shield_auto_vaporizer.jpg', 1),
    (sid, 'imported', 'GPS Floral Tracker Tag', 'Forage Tracking', '15,000 ETB', '4.5/5', 'Special Order',
     'Micro-GPS nodes to optimize hive placement near nectar sources.',
     '/assets/images/gps_floral_tracker_tag.jpg', 2);

  -- 02 Aviculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'aviculture', '02', 'Aviculture',
    'Automated solutions for poultry farming, egg production, and hatchery efficiency.',
    'Ethiopia''s poultry sector is shifting to intensive commercial operations that need environmental controls.',
    'avi', 'aviculture poultry birds chickens', '/assets/images/cat2.jpg', 2
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Brooder Temp Control', 'Manual heating fails overnight, causing chick mortality.', 1),
    (sid, 'Feed Ration Waste', 'Uncalibrated feeding causes waste and poor flock uniformity.', 2),
    (sid, 'Disease Outbreak', 'Lack of pathogen sensors allows rapid disease spread.', 3),
    (sid, 'Egg Sorting & Breakage', 'Manual grading causes high breakage rates.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Auto-Sense Brooder Panel', 'Brooder Temp Control', '6,500 ETB', '4.8/5', 'Ready to Deploy',
     'Thermostat-controlled heating panel for stable brooder temps.',
     '/assets/images/auto-sense_brooder_panel.jpg', 1),
    (sid, 'local', 'Precision Trough Dispenser', 'Feed Ration Waste', '8,200 ETB', '4.6/5', 'In Stock',
     'Automated feeder for exact granular rations.',
     '/assets/images/precision_trough_dispenser.jpg', 2),
    (sid, 'imported', 'Aero-Vaccine Fogger', 'Disease Outbreak', '22,000 ETB', '4.9/5', 'Global Sourcing',
     'Airborne vaccination fogger for commercial flocks.',
     '/assets/images/aero-vaccine_fogger.jpg', 1),
    (sid, 'imported', 'Optical Egg Grader', 'Egg Sorting & Breakage', '45,000 ETB', '4.7/5', 'Special Order',
     'High-speed egg weighing and fracture detection.',
     '/assets/images/optical_egg_grader.jpg', 2);

  -- 03 Horticulture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'horticulture', '03', 'Horticulture',
    'Advanced engineering interventions for fruit, vegetable, and flower production.',
    'Horticulture is a growing pillar of Ethiopia''s economy and needs climate and cold-chain infrastructure.',
    'hort', 'horticulture plants vegetables fruits', '/assets/images/cat3.jpg', 3
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Micro-Climate Volatility', 'Frost and weather swings destroy sensitive crops.', 1),
    (sid, 'Post-Harvest Degradation', 'Weak cold chain causes up to 35% produce loss.', 2),
    (sid, 'Pest & Pathogen Outbreaks', 'Late detection drives excess pesticide use.', 3),
    (sid, 'Irrigation Inefficiency', 'Blind watering wastes water and stresses roots.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Solar Evaporative Cold-Box', 'Post-Harvest Degradation', '18,000 ETB', '4.8/5', 'Ready to Deploy',
     'Zero-grid evaporative cold storage for produce.',
     '/assets/images/solar_evaporative_cold-box.jpg', 1),
    (sid, 'local', 'Soil-Sync Drip Timer', 'Irrigation Inefficiency', '3,500 ETB', '4.9/5', 'In Stock',
     'Moisture-triggered drip irrigation valve.',
     '/assets/images/soil-sync_drip_timer.jpg', 2),
    (sid, 'imported', 'Dutch Climate Controller', 'Micro-Climate Volatility', '35,000 ETB', '5.0/5', 'Global Sourcing',
     'Greenhouse computer for vents, shade, and humidity.',
     '/assets/images/dutch_climate_controller.jpg', 1),
    (sid, 'imported', 'UV Pathogen Zapper', 'Pest & Pathogen Outbreaks', '12,400 ETB', '4.4/5', 'Global Sourcing',
     'Robotic UV system for overnight pathogen control.',
     '/assets/images/uv_pathogen_zapper.jpg', 2);

  -- 04 Livestock
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'livestock', '04', 'Livestock',
    'Smart hardware and tracking systems for cattle, dairy, and rangeland management.',
    'Africa''s largest livestock herd needs modern feedlot and dairy logistics.',
    'live', 'livestock cattle cows animals', '/assets/images/cat4.jpg', 4
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Dairy Cold-Chain Loss', 'No off-grid chilling causes milk rejection.', 1),
    (sid, 'Rangeland Tracking', 'Unmapped cattle movement causes overgrazing and loss.', 2),
    (sid, 'Early Disease Detection', 'Visual diagnosis is often too late.', 3),
    (sid, 'Feed Conversion', 'Manual mixing stalls optimal weight gain.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Biogas Milk Chiller', 'Dairy Cold-Chain Loss', '28,000 ETB', '4.7/5', 'Ready to Deploy',
     'Biogas-powered off-grid milk chiller.',
     '/assets/images/biogas_milk_chiller.jpg', 1),
    (sid, 'local', 'Rangeland RFID Gate', 'Rangeland Tracking', '15,500 ETB', '4.6/5', 'In Stock',
     'Solar RFID gate for cattle movement logging.',
     '/assets/images/rangeland_rfid_gate.jpg', 2),
    (sid, 'imported', 'Aussie Shearing Plant', 'Fleece Harvesting', '24,000 ETB', '4.8/5', 'Global Sourcing',
     'Heavy-duty shearing motors and clippers.',
     '/assets/images/aussie_shearing_plant.jpg', 1),
    (sid, 'imported', 'Infrared Disease Scanner', 'Early Disease Detection', '19,000 ETB', '4.9/5', 'Special Order',
     'Handheld thermal scanner for early fever detection.',
     '/assets/images/infrared_disease_scanner.jpg', 2);

  -- 05 Export Crops
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'export-crops', '05', 'Export Crops',
    'Precision processing and quality control for coffee, sesame, and high-value exports.',
    'Export commodities drive foreign exchange and need strict grading standards.',
    'exp', 'export crops coffee sesame international', '/assets/images/cat5.jpg', 5
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Drying Inconsistencies', 'Moisture variance causes mold and export rejection.', 1),
    (sid, 'Grading Subjectivity', 'Manual sorting lets defects through.', 2),
    (sid, 'Traceability Data', 'No farm-to-port tracking blocks premium markets.', 3),
    (sid, 'Pest Outbreaks', 'Invasive pests destroy yields before response.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Smart Moisture Probe', 'Drying Inconsistencies', '2,800 ETB', '4.9/5', 'Ready to Deploy',
     'Digital probe calibrated for Ethiopian Arabica moisture.',
     '/assets/images/smart_moisture_probe.jpg', 1),
    (sid, 'local', 'Aero-Sorter for Sesame', 'Grading Subjectivity', '32,000 ETB', '4.5/5', 'In Stock',
     'Pneumatic gravity separator for sesame cleaning.',
     '/assets/images/aero-sorter_for_sesame.jpg', 2),
    (sid, 'imported', 'Optical Color Grader', 'Grading Subjectivity', '180,000 ETB', '5.0/5', 'Global Sourcing',
     'Laser sorter for defective coffee beans.',
     '/assets/images/optical_color_grader.jpg', 1),
    (sid, 'imported', 'Vacuum Seal Station', 'Traceability Data', '45,000 ETB', '4.8/5', 'Global Sourcing',
     'Commercial vacuum sealer for export preservation.',
     '/assets/images/vacuum_seal_station.jpg', 2);

  -- 06 Staple Grains
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'staple-grains', '06', 'Staple Grains',
    'Mechanization and moisture tracking for teff, wheat, maize, and sorghum.',
    'Staple grains underpin national food security and need better harvest and storage systems.',
    'grain', 'staple grains teff wheat corn', '/assets/images/cat6.jpg', 6
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Threshing & Harvest Loss', 'Traditional threshing causes high field loss.', 1),
    (sid, 'Soil Moisture Deficit', 'Missed planting windows under drought stress.', 2),
    (sid, 'Storage Infestation', 'Weevils and fungi destroy stored grain.', 3),
    (sid, 'Weed Proliferation', 'Manual weeding burns labor in critical growth stages.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Teff-Master Pedal Thresher', 'Threshing & Harvest Loss', '14,000 ETB', '4.7/5', 'Ready to Deploy',
     'Pedal thresher optimized for teff grain structure.',
     '/assets/images/teff-master_pedal_thresher.jpg', 1),
    (sid, 'local', 'Hermetic Silo Seal Kit', 'Storage Infestation', '1,500 ETB', '4.9/5', 'In Stock',
     'Air-tight seal kit that stops weevils without chemicals.',
     '/assets/images/hermetic_silo_seal_kit.jpg', 2),
    (sid, 'imported', 'Precision Seed Drill', 'Soil Moisture Deficit', '85,000 ETB', '4.8/5', 'Global Sourcing',
     'Drill that places seed at the right moisture depth.',
     '/assets/images/precision_seed_drill.jpg', 1),
    (sid, 'imported', 'Industrial Dehumidifier', 'Storage Infestation', '30,000 ETB', '4.6/5', 'Global Sourcing',
     'Warehouse dehumidifier for rainy-season storage.',
     '/assets/images/industrial_dehumidifier.jpg', 2);

  -- 07 Aquaculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'aquaculture', '07', 'Aquaculture',
    'Water quality sensors and automated systems for intensive fish farming.',
    'Aquaculture needs stable water quality and precise feeding at high density.',
    'aqua', 'aquaculture fish farming water', '/assets/images/cat7.jpg', 7
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Water Quality Spikes', 'Oxygen drops and ammonia spikes kill fish quickly.', 1),
    (sid, 'Temperature Shock', 'Shallow ponds stress fish and suppress immunity.', 2),
    (sid, 'Manual Feeding Waste', 'Uneaten feed rots and destroys water quality.', 3),
    (sid, 'Predator Intrusion', 'Birds and aquatic predators cut harvest yields.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Solar Paddle-Wheel Aerator', 'Water Quality Spikes', '21,000 ETB', '4.8/5', 'Ready to Deploy',
     'Solar aerator that runs when oxygen drops.',
     '/assets/images/solar_paddle-wheel_aerator.jpg', 1),
    (sid, 'local', 'Ammonia Rapid-Test Node', 'Water Quality Spikes', '5,500 ETB', '4.6/5', 'In Stock',
     'Submerged ammonia sensor with phone alerts.',
     '/assets/images/ammonia_rapid-test_node.jpg', 2),
    (sid, 'imported', 'Auto-Pellet Cannon', 'Manual Feeding Waste', '34,000 ETB', '4.7/5', 'Global Sourcing',
     'Timed directional feeder for uniform growth.',
     '/assets/images/auto-pellet_cannon.jpg', 1),
    (sid, 'imported', 'Sonic Predator Deterrent', 'Predator Intrusion', '12,000 ETB', '4.5/5', 'Global Sourcing',
     'Acoustic emitter that repels aquatic predators.',
     '/assets/images/sonic_predator_deterrent.jpg', 2);

end $$;

-- 5) Quick verification (should show 7 / 28 / 28)
select
  (select count(*) from public.sectors) as sectors,
  (select count(*) from public.sector_problems) as problems,
  (select count(*) from public.products) as products;
