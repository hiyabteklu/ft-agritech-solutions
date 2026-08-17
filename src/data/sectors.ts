export type Product = {
  name: string;
  solves: string;
  price: string;
  rating: string;
  status: string;
  desc: string;
};

export type Sector = {
  slug: string;
  id: string;
  title: string;
  subtitle: string;
  scope: string;
  imgPrefix: string;
  keywords: string;
  image: string;
  problems: { title: string; text: string }[];
  products: {
    local: Product[];
    imported: Product[];
  };
};

export const sectors: Sector[] = [
  {
    slug: 'apiculture',
    id: '01',
    title: 'Apiculture',
    subtitle: 'Advanced engineering interventions for honey, beeswax, and apiary management.',
    scope:
      "Ethiopia holds a deeply rooted tradition of beekeeping and stands as Africa's largest honey producer. For generations, the sector has relied on traditional forest hive systems that yield vastly below their true ecological potential. As global demand for high-quality organic honey surges, there is a critical national push to transition toward modern, scalable apiary management that can meet strict export standards.",
    imgPrefix: 'api',
    keywords: 'apiculture bees honey',
    image: '/assets/images/cat1.jpg',
    problems: [
      {
        title: 'Micro-Climate Volatility',
        text: 'Inability to track internal hive temperature and humidity causes colony collapse during unexpected weather shifts.',
      },
      {
        title: 'Pest Intrusion',
        text: 'Undetected Varroa mite and wax moth infestations silently destroy colonies before visual inspections catch them.',
      },
      {
        title: 'Harvest Yield Loss',
        text: 'Traditional and crude modern extraction methods result in significant comb destruction, forcing bees to waste energy rebuilding.',
      },
      {
        title: 'Forage Tracking',
        text: 'Lack of geospatial data regarding floral blooms forces blind hive placement, reducing potential nectar yields.',
      },
    ],
    products: {
      local: [
        {
          name: 'Smart-Temp Hive Node v1',
          solves: 'Micro-Climate Volatility',
          price: '4,200 ETB',
          rating: '4.9/5',
          status: 'Ready to Deploy',
          desc: 'Solar-powered IoT sensor that actively monitors internal hive humidity and temperature, alerting you via SMS before colony collapse.',
        },
        {
          name: 'Eco-Comb Centrifuge Extractor',
          solves: 'Harvest Yield Loss',
          price: '12,500 ETB',
          rating: '4.7/5',
          status: 'In Stock',
          desc: 'Locally manufactured stainless steel extractor engineered to spin honey without destroying the wax comb structure.',
        },
      ],
      imported: [
        {
          name: 'Varroa-Shield Auto Vaporizer',
          solves: 'Pest Intrusion',
          price: '8,900 ETB',
          rating: '4.8/5',
          status: 'Global Sourcing',
          desc: 'Automated oxalic acid vaporizer imported from Germany to eliminate Varroa mites without harming the bee population.',
        },
        {
          name: 'GPS Floral Tracker Tag',
          solves: 'Forage Tracking',
          price: '15,000 ETB',
          rating: '4.5/5',
          status: 'Special Order',
          desc: 'Micro-GPS tracking nodes to analyze bee flight paths and optimize hive placement near dense nectar sources.',
        },
      ],
    },
  },
  {
    slug: 'aviculture',
    id: '02',
    title: 'Aviculture',
    subtitle: 'Automated solutions for poultry farming, egg production, and hatchery efficiency.',
    scope:
      "Driven by rapid urbanization, Ethiopia's demand for poultry has skyrocketed. This shift has rapidly transformed the sector into intensive, large-scale commercial operations. To sustain this trajectory, the industry is increasingly seeking advanced environmental controls to maximize efficiency.",
    imgPrefix: 'avi',
    keywords: 'aviculture poultry birds chickens',
    image: '/assets/images/cat2.jpg',
    problems: [
      {
        title: 'Brooder Temp Control',
        text: 'Manual heating systems fail overnight, causing massive chick mortality due to cold stress or overheating.',
      },
      {
        title: 'Feed Ration Waste',
        text: 'Uncalibrated manual feeding systems lead to unequal distribution, causing poor flock uniformity and massive feed waste.',
      },
      {
        title: 'Disease Outbreak',
        text: 'Lack of airborne pathogen sensors and automated biosecurity locks allow rapid spread of diseases like Newcastle.',
      },
      {
        title: 'Egg Sorting & Breakage',
        text: 'Manual collection and grading result in high breakage rates and inconsistent market sizing.',
      },
    ],
    products: {
      local: [
        {
          name: 'Auto-Sense Brooder Panel',
          solves: 'Brooder Temp Control',
          price: '6,500 ETB',
          rating: '4.8/5',
          status: 'Ready to Deploy',
          desc: 'Thermostat-controlled heating panel built for Ethiopian voltage fluctuations to ensure zero chick mortality at night.',
        },
        {
          name: 'Precision Trough Dispenser',
          solves: 'Feed Ration Waste',
          price: '8,200 ETB',
          rating: '4.6/5',
          status: 'In Stock',
          desc: 'Automated mechanical feeder that dispenses exact granular rations based on flock age and weight targets.',
        },
      ],
      imported: [
        {
          name: 'Aero-Vaccine Fogger',
          solves: 'Disease Outbreak',
          price: '22,000 ETB',
          rating: '4.9/5',
          status: 'Global Sourcing',
          desc: 'Industrial European fogger for rapid, stress-free airborne vaccination of massive commercial flocks.',
        },
        {
          name: 'Optical Egg Grader',
          solves: 'Egg Sorting & Breakage',
          price: '45,000 ETB',
          rating: '4.7/5',
          status: 'Special Order',
          desc: 'High-speed conveyor system that automatically weighs and sorts eggs while detecting hairline shell fractures.',
        },
      ],
    },
  },
  {
    slug: 'horticulture',
    id: '03',
    title: 'Horticulture',
    subtitle: 'Advanced engineering interventions for fruit, vegetable, and flower production.',
    scope:
      "Ethiopia’s horticulture sector has emerged as a rapidly growing pillar of the national economy. Expanding this sector requires highly synchronized supply chains, precise climate management, and robust infrastructure to maintain the pristine quality of perishable goods.",
    imgPrefix: 'hort',
    keywords: 'horticulture plants vegetables fruits',
    image: '/assets/images/cat3.jpg',
    problems: [
      {
        title: 'Micro-Climate Volatility',
        text: 'Unpredictable weather and sudden frost in high-altitude zones routinely destroy temperature-sensitive crops.',
      },
      {
        title: 'Post-Harvest Degradation',
        text: 'A severe lack of decentralized, reliable cold-chain infrastructure causes up to 35% of perishable produce to spoil.',
      },
      {
        title: 'Pest & Pathogen Outbreaks',
        text: 'Delayed visual detection of diseases and pests forces farmers into excessive, inefficient chemical pesticide use.',
      },
      {
        title: 'Irrigation Inefficiency',
        text: 'Over-reliance on blindly scheduled watering depletes water resources and stresses root systems, lowering yield.',
      },
    ],
    products: {
      local: [
        {
          name: 'Solar Evaporative Cold-Box',
          solves: 'Post-Harvest Degradation',
          price: '18,000 ETB',
          rating: '4.8/5',
          status: 'Ready to Deploy',
          desc: 'Zero-grid cold storage unit utilizing forced-air evaporative cooling to extend produce shelf life by 14 days.',
        },
        {
          name: 'Soil-Sync Drip Timer',
          solves: 'Irrigation Inefficiency',
          price: '3,500 ETB',
          rating: '4.9/5',
          status: 'In Stock',
          desc: 'Locally designed electronic valve that only releases drip irrigation when subsurface moisture drops below a critical threshold.',
        },
      ],
      imported: [
        {
          name: 'Dutch Climate Controller',
          solves: 'Micro-Climate Volatility',
          price: '35,000 ETB',
          rating: '5.0/5',
          status: 'Global Sourcing',
          desc: 'Complete greenhouse computer system regulating vents, shade screens, and humidity for export-grade flowers.',
        },
        {
          name: 'UV Pathogen Zapper',
          solves: 'Pest & Pathogen Outbreaks',
          price: '12,400 ETB',
          rating: '4.4/5',
          status: 'Global Sourcing',
          desc: 'Automated robotic UV light system that eliminates fungal spores and pests overnight without chemical pesticides.',
        },
      ],
    },
  },
  {
    slug: 'livestock',
    id: '04',
    title: 'Livestock',
    subtitle: 'Smart hardware and tracking systems for cattle, dairy, and rangeland management.',
    scope:
      "Holding the largest livestock population in Africa, Ethiopia's cattle sector is evolving from traditional pastoral grazing to controlled, intensive feedlot models. This evolution demands modernized logistics and enhanced herd monitoring.",
    imgPrefix: 'live',
    keywords: 'livestock cattle cows animals',
    image: '/assets/images/cat4.jpg',
    problems: [
      {
        title: 'Dairy Cold-Chain Loss',
        text: 'Lack of off-grid chilling solutions at the cooperative level results in massive daily milk rejection rates.',
      },
      {
        title: 'Rangeland Tracking',
        text: 'Inability to map cattle movement leads to overgrazing, loss of animals, and inefficient resource allocation.',
      },
      {
        title: 'Early Disease Detection',
        text: 'Visual diagnosis of illnesses like Foot and Mouth Disease happens too late, leading to herd-wide infection.',
      },
      {
        title: 'Feed Conversion',
        text: 'Manual feed mixing in feedlots results in inconsistent nutrition, stalling optimal weight gain for market.',
      },
    ],
    products: {
      local: [
        {
          name: 'Biogas Milk Chiller',
          solves: 'Dairy Cold-Chain Loss',
          price: '28,000 ETB',
          rating: '4.7/5',
          status: 'Ready to Deploy',
          desc: 'Off-grid milk chilling vat powered entirely by farm biogas, preventing cooperative-level milk spoilage.',
        },
        {
          name: 'Rangeland RFID Gate',
          solves: 'Rangeland Tracking',
          price: '15,500 ETB',
          rating: '4.6/5',
          status: 'In Stock',
          desc: 'Solar-powered scanning gate that logs individual cattle movement and weight data as they enter/exit feedlots.',
        },
      ],
      imported: [
        {
          name: 'Aussie Shearing Plant',
          solves: 'Fleece Harvesting',
          price: '24,000 ETB',
          rating: '4.8/5',
          status: 'Global Sourcing',
          desc: 'Heavy-duty imported shearing motors and clippers designed for rapid, stress-free wool and hair harvesting.',
        },
        {
          name: 'Infrared Disease Scanner',
          solves: 'Early Disease Detection',
          price: '19,000 ETB',
          rating: '4.9/5',
          status: 'Special Order',
          desc: 'Handheld thermal imaging scanner to instantly detect fever and inflammation (like FMD) before visual symptoms appear.',
        },
      ],
    },
  },
  {
    slug: 'export-crops',
    id: '05',
    title: 'Export Crops',
    subtitle: 'Precision processing and quality control for coffee, sesame, and high-value exports.',
    scope:
      "Export commodities act as the vital lifeblood of Ethiopia’s foreign exchange ecosystem. As international markets enforce increasingly strict grading standards, the sector must adopt highly accurate, standardized processing methods.",
    imgPrefix: 'exp',
    keywords: 'export crops coffee sesame international',
    image: '/assets/images/cat5.jpg',
    problems: [
      {
        title: 'Drying Inconsistencies',
        text: 'Unmonitored drying beds lead to moisture variance, causing mold growth and subsequent export rejection.',
      },
      {
        title: 'Grading Subjectivity',
        text: 'Manual sorting based on visual inspection allows defective beans/seeds to slip through, lowering grade.',
      },
      {
        title: 'Traceability Data',
        text: 'Lack of digital farm-to-port tracking prevents farmers from capitalizing on premium EU sustainability markets.',
      },
      {
        title: 'Pest Outbreaks',
        text: 'Invasive species like the Coffee Berry Borer destroy yields before regional spraying protocols are activated.',
      },
    ],
    products: {
      local: [
        {
          name: 'Smart Moisture Probe',
          solves: 'Drying Inconsistencies',
          price: '2,800 ETB',
          rating: '4.9/5',
          status: 'Ready to Deploy',
          desc: 'Digital insertion probe calibrated specifically for Ethiopian Arabica to ensure exact export-standard moisture content.',
        },
        {
          name: 'Aero-Sorter for Sesame',
          solves: 'Grading Subjectivity',
          price: '32,000 ETB',
          rating: '4.5/5',
          status: 'In Stock',
          desc: 'Locally built pneumatic gravity separator that removes stones, dust, and defective seeds using controlled airflow.',
        },
      ],
      imported: [
        {
          name: 'Optical Color Grader',
          solves: 'Grading Subjectivity',
          price: '180,000 ETB',
          rating: '5.0/5',
          status: 'Global Sourcing',
          desc: 'Industrial laser sorting machine that scans and ejects discolored or defective coffee beans at high speeds.',
        },
        {
          name: 'Vacuum Seal Station',
          solves: 'Traceability Data',
          price: '45,000 ETB',
          rating: '4.8/5',
          status: 'Global Sourcing',
          desc: 'Heavy-duty commercial vacuum sealer ensuring zero oxidation and perfect preservation of premium roasted exports.',
        },
      ],
    },
  },
  {
    slug: 'staple-grains',
    id: '06',
    title: 'Staple Grains',
    subtitle: 'Mechanization and moisture tracking for teff, wheat, maize, and sorghum.',
    scope:
      "Staple grains form the foundation of Ethiopia's national food security. Achieving ambitious self-sufficiency targets requires maximizing field yields and protecting harvested grains through robust, climate-resilient storage networks.",
    imgPrefix: 'grain',
    keywords: 'staple grains teff wheat corn',
    image: '/assets/images/cat6.jpg',
    problems: [
      {
        title: 'Threshing & Harvest Loss',
        text: 'Traditional ox-trampling or manual harvesting shatters grains, causing up to 20% loss directly in the field.',
      },
      {
        title: 'Soil Moisture Deficit',
        text: 'Without subsurface sensors, farmers miscalculate planting windows and suffer severe drought stress.',
      },
      {
        title: 'Storage Infestation',
        text: 'Poorly sealed silos lacking atmospheric control allow weevils and fungi to decimate stored reserves.',
      },
      {
        title: 'Weed Proliferation',
        text: 'Inefficient manual weeding consumes massive labor hours, stunting grain growth during critical early stages.',
      },
    ],
    products: {
      local: [
        {
          name: 'Teff-Master Pedal Thresher',
          solves: 'Threshing & Harvest Loss',
          price: '14,000 ETB',
          rating: '4.7/5',
          status: 'Ready to Deploy',
          desc: 'Human-powered mechanical thresher optimized specifically for the delicate grain structure of Teff, reducing shatter loss by 18%.',
        },
        {
          name: 'Hermetic Silo Seal Kit',
          solves: 'Storage Infestation',
          price: '1,500 ETB',
          rating: '4.9/5',
          status: 'In Stock',
          desc: 'Air-tight retrofitting kit for traditional grain stores that suffocates weevils and prevents fungal growth via oxygen deprivation.',
        },
      ],
      imported: [
        {
          name: 'Precision Seed Drill',
          solves: 'Soil Moisture Deficit',
          price: '85,000 ETB',
          rating: '4.8/5',
          status: 'Global Sourcing',
          desc: 'Tractor-mounted drill that injects seeds at the exact subsurface depth required to tap into hidden soil moisture during drought.',
        },
        {
          name: 'Industrial Dehumidifier',
          solves: 'Storage Infestation',
          price: '30,000 ETB',
          rating: '4.6/5',
          status: 'Global Sourcing',
          desc: 'Large-scale warehouse dehumidification unit to artificially maintain safe grain storage environments during heavy rainy seasons.',
        },
      ],
    },
  },
  {
    slug: 'aquaculture',
    id: '07',
    title: 'Aquaculture',
    subtitle: 'Water quality sensors and automated systems for intensive fish farming.',
    scope:
      'Aquaculture represents a highly promising sector within Ethiopia. Cultivating aquatic life at high densities requires immense precision, stable aquatic environments, and strict biological management to ensure sustainable harvests.',
    imgPrefix: 'aqua',
    keywords: 'aquaculture fish farming water',
    image: '/assets/images/cat7.jpg',
    problems: [
      {
        title: 'Water Quality Spikes',
        text: 'Undetected drops in dissolved oxygen or spikes in ammonia lead to rapid, catastrophic fish kills.',
      },
      {
        title: 'Temperature Shock',
        text: 'Lack of thermal monitoring in shallow ponds stresses fish, stunting growth and suppressing immune systems.',
      },
      {
        title: 'Manual Feeding Waste',
        text: 'Inconsistent broadcast feeding results in uneaten pellets rotting at the bottom, destroying water quality.',
      },
      {
        title: 'Predator Intrusion',
        text: 'Without automated perimeter deterrents, avian and aquatic predators significantly reduce harvest yields.',
      },
    ],
    products: {
      local: [
        {
          name: 'Solar Paddle-Wheel Aerator',
          solves: 'Water Quality Spikes',
          price: '21,000 ETB',
          rating: '4.8/5',
          status: 'Ready to Deploy',
          desc: 'Off-grid floating aerator that activates automatically when surface oxygen levels drop dangerously low.',
        },
        {
          name: 'Ammonia Rapid-Test Node',
          solves: 'Water Quality Spikes',
          price: '5,500 ETB',
          rating: '4.6/5',
          status: 'In Stock',
          desc: "Digital submerged sensor that continuously monitors toxic ammonia buildup and transmits alerts to the farmer's phone.",
        },
      ],
      imported: [
        {
          name: 'Auto-Pellet Cannon',
          solves: 'Manual Feeding Waste',
          price: '34,000 ETB',
          rating: '4.7/5',
          status: 'Global Sourcing',
          desc: 'Timed directional feeder that scatters exact pellet ratios across large commercial ponds to ensure uniform fish growth.',
        },
        {
          name: 'Sonic Predator Deterrent',
          solves: 'Predator Intrusion',
          price: '12,000 ETB',
          rating: '4.5/5',
          status: 'Global Sourcing',
          desc: 'Submerged acoustic emitter that safely repels aquatic predators and invasive species away from high-density harvesting nets.',
        },
      ],
    },
  },
];

export function getSectorBySlug(slug: string): Sector | undefined {
  return sectors.find((s) => s.slug === slug);
}

export function productImagePath(name: string): string {
  return `/assets/images/${name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
}
