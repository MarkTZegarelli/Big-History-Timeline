/**
 * events.js
 * Predefined Big History events and category definitions.
 */

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const CATEGORIES = {
  COSMIC:      'cosmic',
  GEOLOGICAL:  'geological',
  BIOLOGICAL:  'biological',
  HUMAN:       'human',
  MODERN:      'modern',
  CUSTOM:      'custom',
};

export const CATEGORY_META = {
  [CATEGORIES.COSMIC]:     { label: 'Cosmic',      emoji: '🌌', color: '#7B68EE' },
  [CATEGORIES.GEOLOGICAL]: { label: 'Geological',  emoji: '🌍', color: '#CD853F' },
  [CATEGORIES.BIOLOGICAL]: { label: 'Biological',  emoji: '🧬', color: '#3CB371' },
  [CATEGORIES.HUMAN]:      { label: 'Human',       emoji: '👤', color: '#FF8C00' },
  [CATEGORIES.MODERN]:     { label: 'Modern',      emoji: '🏭', color: '#DC143C' },
  [CATEGORIES.CUSTOM]:     { label: 'My Notes',    emoji: '📌', color: '#20B2AA' },
};

export function getCategoryColor(category) {
  return CATEGORY_META[category]?.color ?? CATEGORY_META[CATEGORIES.CUSTOM].color;
}

// ---------------------------------------------------------------------------
// Predefined events — ordered from oldest to newest
// ---------------------------------------------------------------------------

export const PREDEFINED_EVENTS = [
  {
    id: 'evt_01',
    title: 'Big Bang',
    description:
      'The universe exploded into existence ~13.8 billion years ago from an infinitely dense singularity. In the first fraction of a second, fundamental forces separated, quarks combined into protons and neutrons, and the stage was set for everything that followed.',
    yearsAgo: 13_800_000_000,
    category: CATEGORIES.COSMIC,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_02',
    title: 'First Stars Ignite',
    description:
      'Roughly 200–300 million years after the Big Bang, the first generation of massive stars (Population III) ignited in clouds of hydrogen and helium, flooding the universe with light for the first time and beginning nucleosynthesis of heavier elements.',
    yearsAgo: 13_500_000_000,
    category: CATEGORIES.COSMIC,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_03',
    title: 'Milky Way Galaxy Forms',
    description:
      'Our home galaxy began assembling through gravitational attraction and galaxy mergers. Over billions of years it built up its spiral structure, star clusters, and supermassive black hole at its centre.',
    yearsAgo: 13_000_000_000,
    category: CATEGORIES.COSMIC,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_04',
    title: 'Solar System Forms',
    description:
      'A shock wave from a nearby supernova triggered the collapse of a molecular cloud, forming the Sun and the protoplanetary disk from which Earth and the other planets coalesced over millions of years.',
    yearsAgo: 4_600_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_05',
    title: 'Earth & Moon Form',
    description:
      'Earth accreted and differentiated into core, mantle, and crust. The Moon likely formed when a Mars-sized body (Theia) struck the young Earth, throwing debris into orbit that coalesced into our Moon.',
    yearsAgo: 4_540_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_06',
    title: 'Late Heavy Bombardment',
    description:
      'A period of intense meteorite impacts (~4.1–3.8 Ga) pummelled the inner solar system. Despite the violence, water and complex organic molecules may have been delivered to Earth during this era.',
    yearsAgo: 3_900_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_07',
    title: 'First Life on Earth',
    description:
      'Chemical traces and microfossils suggest life emerged in the oceans as early as 3.8–4.0 billion years ago. These earliest organisms were simple prokaryotes living in a world of volcanic activity and no free oxygen.',
    yearsAgo: 3_800_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_08',
    title: 'Photosynthesis Evolves',
    description:
      'Cyanobacteria evolved the ability to split water molecules using sunlight, releasing oxygen as a by-product. This revolutionary metabolism would eventually transform Earth\'s atmosphere in the Great Oxidation Event.',
    yearsAgo: 2_700_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_09',
    title: 'Great Oxidation Event',
    description:
      'Free oxygen began accumulating in Earth\'s atmosphere around 2.4 billion years ago, poisoning most anaerobic life but opening the door to aerobic respiration — far more energy-efficient — and setting the stage for complex life.',
    yearsAgo: 2_400_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_10',
    title: 'First Eukaryotes',
    description:
      'Cells with a nucleus and membrane-bound organelles emerged, likely through endosymbiosis — one prokaryote engulfing another to create mitochondria. This unlocked dramatically greater cellular complexity.',
    yearsAgo: 2_100_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_11',
    title: 'Snowball Earth',
    description:
      'Between ~720–635 million years ago, Earth may have been entirely or nearly entirely frozen over. The eventual thaw, driven by volcanic CO₂ build-up, triggered a burst of evolutionary innovation.',
    yearsAgo: 720_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_12',
    title: 'Multicellular Life Emerges',
    description:
      'Colonies of cells began dividing labour: some cells specialized for reproduction, others for feeding or movement. This innovation ultimately gave rise to tissues, organs, and the spectacular diversity of animal life.',
    yearsAgo: 600_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_13',
    title: 'Cambrian Explosion',
    description:
      'Over roughly 20 million years (~541–520 Ma), most major animal body plans appeared in the fossil record, including the first eyes, shells, and bilateral symmetry. The ancestors of all vertebrates appear here.',
    yearsAgo: 541_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_14',
    title: 'Plants Colonise Land',
    description:
      'Descendants of green algae evolved adaptations for terrestrial life, radically changing land ecosystems, drawing down CO₂, and creating the rich soils that support all land life today.',
    yearsAgo: 470_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_15',
    title: 'First Forests',
    description:
      'Tall woody trees evolved and spread across continents, creating the world\'s first forests. Their massive uptake of CO₂ contributed to global cooling and a mass extinction — but also laid down the coal deposits powering the Industrial Revolution millions of years later.',
    yearsAgo: 385_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_16',
    title: 'Permian–Triassic Extinction',
    description:
      'The Great Dying (~252 Ma) wiped out ~96% of marine species and ~70% of land vertebrates — Earth\'s largest mass extinction. Triggered by massive Siberian Traps volcanism, it reset the biosphere and opened niches for reptiles.',
    yearsAgo: 252_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_17',
    title: 'Dinosaurs Appear',
    description:
      'Dinosaurs evolved from archosaurs in the Triassic and diversified rapidly after the Permian–Triassic extinction to become the dominant land vertebrates for over 160 million years.',
    yearsAgo: 240_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_18',
    title: 'First Mammals',
    description:
      'Small, shrew-like mammals evolved from therapsid reptiles. They survived alongside dinosaurs for 160 million years, mostly small and nocturnal, accumulating the traits — warm blood, hair, live birth — that would later drive their explosion in diversity.',
    yearsAgo: 225_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_19',
    title: 'Flowering Plants Evolve',
    description:
      'Angiosperms (flowering plants) appeared and diversified explosively, co-evolving with insects for pollination. They now make up ~90% of land plant species and form the base of most terrestrial food webs.',
    yearsAgo: 130_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_20',
    title: 'K–Pg Mass Extinction',
    description:
      'A 10 km asteroid struck the Yucatán Peninsula, triggering firestorms, tsunamis, and a nuclear winter. Non-avian dinosaurs and ~75% of species vanished. Surviving mammals rapidly diversified into the ecological niches left empty.',
    yearsAgo: 66_000_000,
    category: CATEGORIES.GEOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_21',
    title: 'First Primates',
    description:
      'Small, tree-dwelling primates evolved in the Paleocene with grasping hands, forward-facing eyes for depth perception, and relatively large brains — adaptations that would eventually lead to humans.',
    yearsAgo: 55_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_22',
    title: 'Apes Diverge from Monkeys',
    description:
      'The lineage leading to apes (including humans) split from Old World monkeys. Apes lost their tails and developed greater cognitive flexibility, setting the stage for the hominin line.',
    yearsAgo: 25_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_23',
    title: 'Human–Chimp Last Common Ancestor',
    description:
      'The lineages leading to humans and chimpanzees diverged. Our ancestors began walking upright (bipedalism), freeing the hands for tool use and reshaping the pelvis, skull, and brain over millions of years.',
    yearsAgo: 6_000_000,
    category: CATEGORIES.BIOLOGICAL,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_24',
    title: 'Genus Homo Appears',
    description:
      'Early members of the genus Homo (H. habilis, H. ergaster) emerged in Africa with significantly larger brains and the systematic use of stone tools (Oldowan technology), marking the start of the archaeological record.',
    yearsAgo: 2_800_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_25',
    title: 'Fire Controlled by Hominins',
    description:
      'Homo erectus began controlling fire, enabling cooking (which unlocked more calories and drove brain growth), warmth, protection from predators, and communal activity after dark — transforming human social life.',
    yearsAgo: 1_000_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_26',
    title: 'Modern Humans Emerge',
    description:
      'Anatomically modern Homo sapiens appeared in Africa, possessing the full capacity for symbolic thought, language, music, and complex social organisation — the cognitive toolkit for cultural evolution.',
    yearsAgo: 300_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_27',
    title: 'Out of Africa Migration',
    description:
      'Modern humans dispersed out of Africa in one or more waves, spreading across Eurasia, Australia, and eventually the Americas. They interbred with Neanderthals and Denisovans, whose DNA survives in many people today.',
    yearsAgo: 70_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_28',
    title: 'Cave Art & Symbolic Culture',
    description:
      'Elaborate cave paintings, personal ornaments, and carved figurines proliferated, evidencing fully modern symbolic cognition, storytelling, and shared cultural meaning-making.',
    yearsAgo: 40_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_29',
    title: 'Agricultural Revolution',
    description:
      'Humans independently began cultivating plants and domesticating animals in multiple regions (Fertile Crescent, China, Mesoamerica). Settled farming villages grew into the first towns and cities, enabling specialised labour and social complexity.',
    yearsAgo: 10_000,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_30',
    title: 'Writing Invented',
    description:
      'Sumerian cuneiform (~3200 BCE) and Egyptian hieroglyphs enabled information to be stored outside human memory for the first time. Writing accelerated the accumulation and transmission of knowledge across generations.',
    yearsAgo: 5_200,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_31',
    title: 'Classical Civilisations',
    description:
      'Greece, Rome, Persia, India (Maurya/Gupta), and China (Han) developed philosophy, law, mathematics, medicine, and trade networks that shaped much of modern thought and governance.',
    yearsAgo: 2_500,
    category: CATEGORIES.HUMAN,
    isPredefined: true,
    isMajor: false,
  },
  {
    id: 'evt_32',
    title: 'Scientific Revolution',
    description:
      'Copernicus, Galileo, Kepler, Newton and others dismantled the Aristotelian worldview and established the scientific method — empirical observation, mathematics, and falsifiable hypotheses — as humanity\'s most powerful tool for understanding nature.',
    yearsAgo: 450,
    category: CATEGORIES.MODERN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_33',
    title: 'Industrial Revolution',
    description:
      'Steam power, mechanised textile mills, and iron production in Britain launched a transformation of energy use and economic organisation that spread globally, multiplying human productive capacity and beginning the fossil-fuel era.',
    yearsAgo: 250,
    category: CATEGORIES.MODERN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_34',
    title: 'Digital Revolution & Internet',
    description:
      'The development of transistors, integrated circuits, personal computers, and the World Wide Web created a global information network, compressing the time needed to communicate, learn, and innovate.',
    yearsAgo: 55,
    category: CATEGORIES.MODERN,
    isPredefined: true,
    isMajor: true,
  },
  {
    id: 'evt_35',
    title: 'Today',
    description:
      'You are here — at the frontier of 13.8 billion years of cosmic history. What comes next is, in part, up to you.',
    yearsAgo: 0,
    category: CATEGORIES.MODERN,
    isPredefined: true,
    isMajor: true,
  },
];
