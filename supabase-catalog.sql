-- FT Agri-Tech catalog schema
-- Run in Supabase → SQL Editor (after supabase-tables.sql)

-- ─── Tables ───────────────────────────────────────────────────────────────

create table if not exists public.sectors (
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

create table if not exists public.sector_problems (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references public.sectors(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.products (
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

create index if not exists idx_sector_problems_sector on public.sector_problems(sector_id);
create index if not exists idx_products_sector on public.products(sector_id);
create index if not exists idx_products_catalog on public.products(sector_id, catalog_type);

-- ─── RLS ──────────────────────────────────────────────────────────────────

alter table public.sectors enable row level security;
alter table public.sector_problems enable row level security;
alter table public.products enable row level security;

-- Public read (published only for sectors/products)
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

-- Authenticated staff can manage catalog (admin UI gates by email)
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

-- ─── Seed (skip if sectors already exist) ─────────────────────────────────

do $$
declare
  sid uuid;
begin
  if exists (select 1 from public.sectors limit 1) then
    raise notice 'sectors already seeded — skipping';
    return;
  end if;

  -- 01 Apiculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'apiculture', '01', 'Apiculture',
    'Advanced engineering interventions for honey, beeswax, and apiary management.',
    'Ethiopia holds a deeply rooted tradition of beekeeping and stands as Africa''s largest honey producer. For generations, the sector has relied on traditional forest hive systems that yield vastly below their true ecological potential. As global demand for high-quality organic honey surges, there is a critical national push to transition toward modern, scalable apiary management that can meet strict export standards.',
    'api', 'apiculture bees honey', '/assets/images/cat1.jpg', 1
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Micro-Climate Volatility', 'Inability to track internal hive temperature and humidity causes colony collapse during unexpected weather shifts.', 1),
    (sid, 'Pest Intrusion', 'Undetected Varroa mite and wax moth infestations silently destroy colonies before visual inspections catch them.', 2),
    (sid, 'Harvest Yield Loss', 'Traditional and crude modern extraction methods result in significant comb destruction, forcing bees to waste energy rebuilding.', 3),
    (sid, 'Forage Tracking', 'Lack of geospatial data regarding floral blooms forces blind hive placement, reducing potential nectar yields.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Smart-Temp Hive Node v1', 'Micro-Climate Volatility', '4,200 ETB', '4.9/5', 'Ready to Deploy',
     'Solar-powered IoT sensor that actively monitors internal hive humidity and temperature, alerting you via SMS before colony collapse.',
     '/assets/images/smart-temp_hive_node_v1.jpg', 1),
    (sid, 'local', 'Eco-Comb Centrifuge Extractor', 'Harvest Yield Loss', '12,500 ETB', '4.7/5', 'In Stock',
     'Locally manufactured stainless steel extractor engineered to spin honey without destroying the wax comb structure.',
     '/assets/images/eco-comb_centrifuge_extractor.jpg', 2),
    (sid, 'imported', 'Varroa-Shield Auto Vaporizer', 'Pest Intrusion', '8,900 ETB', '4.8/5', 'Global Sourcing',
     'Automated oxalic acid vaporizer imported from Germany to eliminate Varroa mites without harming the bee population.',
     '/assets/images/varroa-shield_auto_vaporizer.jpg', 1),
    (sid, 'imported', 'GPS Floral Tracker Tag', 'Forage Tracking', '15,000 ETB', '4.5/5', 'Special Order',
     'Micro-GPS tracking nodes to analyze bee flight paths and optimize hive placement near dense nectar sources.',
     '/assets/images/gps_floral_tracker_tag.jpg', 2);

  -- 02 Aviculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'aviculture', '02', 'Aviculture',
    'Automated solutions for poultry farming, egg production, and hatchery efficiency.',
    'Driven by rapid urbanization, Ethiopia''s demand for poultry has skyrocketed. This shift has rapidly transformed the sector into intensive, large-scale commercial operations. To sustain this trajectory, the industry is increasingly seeking advanced environmental controls to maximize efficiency.',
    'avi', 'aviculture poultry birds chickens', '/assets/images/cat2.jpg', 2
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Brooder Temp Control', 'Manual heating systems fail overnight, causing massive chick mortality due to cold stress or overheating.', 1),
    (sid, 'Feed Ration Waste', 'Uncalibrated manual feeding systems lead to unequal distribution, causing poor flock uniformity and massive feed waste.', 2),
    (sid, 'Disease Outbreak', 'Lack of airborne pathogen sensors and automated biosecurity locks allow rapid spread of diseases like Newcastle.', 3),
    (sid, 'Egg Sorting & Breakage', 'Manual collection and grading result in high breakage rates and inconsistent market sizing.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Auto-Sense Brooder Panel', 'Brooder Temp Control', '6,500 ETB', '4.8/5', 'Ready to Deploy',
     'Thermostat-controlled heating panel built for Ethiopian voltage fluctuations to ensure zero chick mortality at night.',
     '/assets/images/auto-sense_brooder_panel.jpg', 1),
    (sid, 'local', 'Precision Trough Dispenser', 'Feed Ration Waste', '8,200 ETB', '4.6/5', 'In Stock',
     'Automated mechanical feeder that dispenses exact granular rations based on flock age and weight targets.',
     '/assets/images/precision_trough_dispenser.jpg', 2),
    (sid, 'imported', 'Aero-Vaccine Fogger', 'Disease Outbreak', '22,000 ETB', '4.9/5', 'Global Sourcing',
     'Industrial European fogger for rapid, stress-free airborne vaccination of massive commercial flocks.',
     '/assets/images/aero-vaccine_fogger.jpg', 1),
    (sid, 'imported', 'Optical Egg Grader', 'Egg Sorting & Breakage', '45,000 ETB', '4.7/5', 'Special Order',
     'High-speed conveyor system that automatically weighs and sorts eggs while detecting hairline shell fractures.',
     '/assets/images/optical_egg_grader.jpg', 2);

  -- 03 Horticulture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'horticulture', '03', 'Horticulture',
    'Advanced engineering interventions for fruit, vegetable, and flower production.',
    'Ethiopia’s horticulture sector has emerged as a rapidly growing pillar of the national economy. Expanding this sector requires highly synchronized supply chains, precise climate management, and robust infrastructure to maintain the pristine quality of perishable goods.',
    'hort', 'horticulture plants vegetables fruits', '/assets/images/cat3.jpg', 3
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Micro-Climate Volatility', 'Unpredictable weather and sudden frost in high-altitude zones routinely destroy temperature-sensitive crops.', 1),
    (sid, 'Post-Harvest Degradation', 'A severe lack of decentralized, reliable cold-chain infrastructure causes up to 35% of perishable produce to spoil.', 2),
    (sid, 'Pest & Pathogen Outbreaks', 'Delayed visual detection of diseases and pests forces farmers into excessive, inefficient chemical pesticide use.', 3),
    (sid, 'Irrigation Inefficiency', 'Over-reliance on blindly scheduled watering depletes water resources and stresses root systems, lowering yield.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Solar Evaporative Cold-Box', 'Post-Harvest Degradation', '18,000 ETB', '4.8/5', 'Ready to Deploy',
     'Zero-grid cold storage unit utilizing forced-air evaporative cooling to extend produce shelf life by 14 days.',
     '/assets/images/solar_evaporative_cold-box.jpg', 1),
    (sid, 'local', 'Soil-Sync Drip Timer', 'Irrigation Inefficiency', '3,500 ETB', '4.9/5', 'In Stock',
     'Locally designed electronic valve that only releases drip irrigation when subsurface moisture drops below a critical threshold.',
     '/assets/images/soil-sync_drip_timer.jpg', 2),
    (sid, 'imported', 'Dutch Climate Controller', 'Micro-Climate Volatility', '35,000 ETB', '5.0/5', 'Global Sourcing',
     'Complete greenhouse computer system regulating vents, shade screens, and humidity for export-grade flowers.',
     '/assets/images/dutch_climate_controller.jpg', 1),
    (sid, 'imported', 'UV Pathogen Zapper', 'Pest & Pathogen Outbreaks', '12,400 ETB', '4.4/5', 'Global Sourcing',
     'Automated robotic UV light system that eliminates fungal spores and pests overnight without chemical pesticides.',
     '/assets/images/uv_pathogen_zapper.jpg', 2);

  -- 04 Livestock
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'livestock', '04', 'Livestock',
    'Smart hardware and tracking systems for cattle, dairy, and rangeland management.',
    'Holding the largest livestock population in Africa, Ethiopia''s cattle sector is evolving from traditional pastoral grazing to controlled, intensive feedlot models. This evolution demands modernized logistics and enhanced herd monitoring.',
    'live', 'livestock cattle cows animals', '/assets/images/cat4.jpg', 4
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Dairy Cold-Chain Loss', 'Lack of off-grid chilling solutions at the cooperative level results in massive daily milk rejection rates.', 1),
    (sid, 'Rangeland Tracking', 'Inability to map cattle movement leads to overgrazing, loss of animals, and inefficient resource allocation.', 2),
    (sid, 'Early Disease Detection', 'Visual diagnosis of illnesses like Foot and Mouth Disease happens too late, leading to herd-wide infection.', 3),
    (sid, 'Feed Conversion', 'Manual feed mixing in feedlots results in inconsistent nutrition, stalling optimal weight gain for market.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Biogas Milk Chiller', 'Dairy Cold-Chain Loss', '28,000 ETB', '4.7/5', 'Ready to Deploy',
     'Off-grid milk chilling vat powered entirely by farm biogas, preventing cooperative-level milk spoilage.',
     '/assets/images/biogas_milk_chiller.jpg', 1),
    (sid, 'local', 'Rangeland RFID Gate', 'Rangeland Tracking', '15,500 ETB', '4.6/5', 'In Stock',
     'Solar-powered scanning gate that logs individual cattle movement and weight data as they enter/exit feedlots.',
     '/assets/images/rangeland_rfid_gate.jpg', 2),
    (sid, 'imported', 'Aussie Shearing Plant', 'Fleece Harvesting', '24,000 ETB', '4.8/5', 'Global Sourcing',
     'Heavy-duty imported shearing motors and clippers designed for rapid, stress-free wool and hair harvesting.',
     '/assets/images/aussie_shearing_plant.jpg', 1),
    (sid, 'imported', 'Infrared Disease Scanner', 'Early Disease Detection', '19,000 ETB', '4.9/5', 'Special Order',
     'Handheld thermal imaging scanner to instantly detect fever and inflammation (like FMD) before visual symptoms appear.',
     '/assets/images/infrared_disease_scanner.jpg', 2);

  -- 05 Export Crops
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'export-crops', '05', 'Export Crops',
    'Precision processing and quality control for coffee, sesame, and high-value exports.',
    'Export commodities act as the vital lifeblood of Ethiopia’s foreign exchange ecosystem. As international markets enforce increasingly strict grading standards, the sector must adopt highly accurate, standardized processing methods.',
    'exp', 'export crops coffee sesame international', '/assets/images/cat5.jpg', 5
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Drying Inconsistencies', 'Unmonitored drying beds lead to moisture variance, causing mold growth and subsequent export rejection.', 1),
    (sid, 'Grading Subjectivity', 'Manual sorting based on visual inspection allows defective beans/seeds to slip through, lowering grade.', 2),
    (sid, 'Traceability Data', 'Lack of digital farm-to-port tracking prevents farmers from capitalizing on premium EU sustainability markets.', 3),
    (sid, 'Pest Outbreaks', 'Invasive species like the Coffee Berry Borer destroy yields before regional spraying protocols are activated.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Smart Moisture Probe', 'Drying Inconsistencies', '2,800 ETB', '4.9/5', 'Ready to Deploy',
     'Digital insertion probe calibrated specifically for Ethiopian Arabica to ensure exact export-standard moisture content.',
     '/assets/images/smart_moisture_probe.jpg', 1),
    (sid, 'local', 'Aero-Sorter for Sesame', 'Grading Subjectivity', '32,000 ETB', '4.5/5', 'In Stock',
     'Locally built pneumatic gravity separator that removes stones, dust, and defective seeds using controlled airflow.',
     '/assets/images/aero-sorter_for_sesame.jpg', 2),
    (sid, 'imported', 'Optical Color Grader', 'Grading Subjectivity', '180,000 ETB', '5.0/5', 'Global Sourcing',
     'Industrial laser sorting machine that scans and ejects discolored or defective coffee beans at high speeds.',
     '/assets/images/optical_color_grader.jpg', 1),
    (sid, 'imported', 'Vacuum Seal Station', 'Traceability Data', '45,000 ETB', '4.8/5', 'Global Sourcing',
     'Heavy-duty commercial vacuum sealer ensuring zero oxidation and perfect preservation of premium roasted exports.',
     '/assets/images/vacuum_seal_station.jpg', 2);

  -- 06 Staple Grains
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'staple-grains', '06', 'Staple Grains',
    'Mechanization and moisture tracking for teff, wheat, maize, and sorghum.',
    'Staple grains form the foundation of Ethiopia''s national food security. Achieving ambitious self-sufficiency targets requires maximizing field yields and protecting harvested grains through robust, climate-resilient storage networks.',
    'grain', 'staple grains teff wheat corn', '/assets/images/cat6.jpg', 6
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Threshing & Harvest Loss', 'Traditional ox-trampling or manual harvesting shatters grains, causing up to 20% loss directly in the field.', 1),
    (sid, 'Soil Moisture Deficit', 'Without subsurface sensors, farmers miscalculate planting windows and suffer severe drought stress.', 2),
    (sid, 'Storage Infestation', 'Poorly sealed silos lacking atmospheric control allow weevils and fungi to decimate stored reserves.', 3),
    (sid, 'Weed Proliferation', 'Inefficient manual weeding consumes massive labor hours, stunting grain growth during critical early stages.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Teff-Master Pedal Thresher', 'Threshing & Harvest Loss', '14,000 ETB', '4.7/5', 'Ready to Deploy',
     'Human-powered mechanical thresher optimized specifically for the delicate grain structure of Teff, reducing shatter loss by 18%.',
     '/assets/images/teff-master_pedal_thresher.jpg', 1),
    (sid, 'local', 'Hermetic Silo Seal Kit', 'Storage Infestation', '1,500 ETB', '4.9/5', 'In Stock',
     'Air-tight retrofitting kit for traditional grain stores that suffocates weevils and prevents fungal growth via oxygen deprivation.',
     '/assets/images/hermetic_silo_seal_kit.jpg', 2),
    (sid, 'imported', 'Precision Seed Drill', 'Soil Moisture Deficit', '85,000 ETB', '4.8/5', 'Global Sourcing',
     'Tractor-mounted drill that injects seeds at the exact subsurface depth required to tap into hidden soil moisture during drought.',
     '/assets/images/precision_seed_drill.jpg', 1),
    (sid, 'imported', 'Industrial Dehumidifier', 'Storage Infestation', '30,000 ETB', '4.6/5', 'Global Sourcing',
     'Large-scale warehouse dehumidification unit to artificially maintain safe grain storage environments during heavy rainy seasons.',
     '/assets/images/industrial_dehumidifier.jpg', 2);

  -- 07 Aquaculture
  insert into public.sectors (slug, code, title, subtitle, scope, img_prefix, keywords, image, sort_order)
  values (
    'aquaculture', '07', 'Aquaculture',
    'Water quality sensors and automated systems for intensive fish farming.',
    'Aquaculture represents a highly promising sector within Ethiopia. Cultivating aquatic life at high densities requires immense precision, stable aquatic environments, and strict biological management to ensure sustainable harvests.',
    'aqua', 'aquaculture fish farming water', '/assets/images/cat7.jpg', 7
  ) returning id into sid;

  insert into public.sector_problems (sector_id, title, body, sort_order) values
    (sid, 'Water Quality Spikes', 'Undetected drops in dissolved oxygen or spikes in ammonia lead to rapid, catastrophic fish kills.', 1),
    (sid, 'Temperature Shock', 'Lack of thermal monitoring in shallow ponds stresses fish, stunting growth and suppressing immune systems.', 2),
    (sid, 'Manual Feeding Waste', 'Inconsistent broadcast feeding results in uneaten pellets rotting at the bottom, destroying water quality.', 3),
    (sid, 'Predator Intrusion', 'Without automated perimeter deterrents, avian and aquatic predators significantly reduce harvest yields.', 4);

  insert into public.products (sector_id, catalog_type, name, solves, price, rating, status, description, image_path, sort_order) values
    (sid, 'local', 'Solar Paddle-Wheel Aerator', 'Water Quality Spikes', '21,000 ETB', '4.8/5', 'Ready to Deploy',
     'Off-grid floating aerator that activates automatically when surface oxygen levels drop dangerously low.',
     '/assets/images/solar_paddle-wheel_aerator.jpg', 1),
    (sid, 'local', 'Ammonia Rapid-Test Node', 'Water Quality Spikes', '5,500 ETB', '4.6/5', 'In Stock',
     'Digital submerged sensor that continuously monitors toxic ammonia buildup and transmits alerts to the farmer''s phone.',
     '/assets/images/ammonia_rapid-test_node.jpg', 2),
    (sid, 'imported', 'Auto-Pellet Cannon', 'Manual Feeding Waste', '34,000 ETB', '4.7/5', 'Global Sourcing',
     'Timed directional feeder that scatters exact pellet ratios across large commercial ponds to ensure uniform fish growth.',
     '/assets/images/auto-pellet_cannon.jpg', 1),
    (sid, 'imported', 'Sonic Predator Deterrent', 'Predator Intrusion', '12,000 ETB', '4.5/5', 'Global Sourcing',
     'Submerged acoustic emitter that safely repels aquatic predators and invasive species away from high-density harvesting nets.',
     '/assets/images/sonic_predator_deterrent.jpg', 2);

end $$;
