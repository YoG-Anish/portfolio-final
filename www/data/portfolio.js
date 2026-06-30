/* ============================================================
   PORTFOLIO DATA
   ----------------------------------------------------------
   ADD a project    : copy one whole { ... } block, give it a
                       unique id, fill in your own details.
   REMOVE a project : delete its { ... } block (and the comma
                       right after it).
   EDIT a project    : just change the text between the quotes.

   FIELDS
     id          unique number, never reuse one
     title       project name
     category    short tag shown on the card, e.g. "WooCommerce"
     description 1–2 plain sentences
     tools       array of strings
     year        string, e.g. "2024"
     link        live URL, or "" if there isn't one yet
                 (card shows "Coming soon" instead of a dead link)
   ============================================================ */
const PORTFOLIO_DATA = [
  {
    id: 1,
    title: 'Aarogya Wellness Store',
    category: 'WooCommerce',
    description: 'Custom WooCommerce build for a health and wellness retailer, with a hand-built theme and a simplified, mobile-first checkout.',
    tools: ['WordPress', 'WooCommerce', 'PHP', 'Custom Theme'],
    year: '2024',
    link: ''
  },
  {
    id: 2,
    title: 'Himal Outdoor Gear',
    category: 'WooCommerce',
    description: 'Multi-category outdoor equipment store with custom product filtering and a checkout flow rebuilt for fewer drop-offs.',
    tools: ['WooCommerce', 'Custom Theme', 'PHP', 'MySQL'],
    year: '2024',
    link: ''
  },
  {
    id: 3,
    title: 'Mato Handmade Crafts',
    category: 'WooCommerce',
    description: 'Marketplace-style storefront for independent makers, built on a custom theme with per-vendor product pages.',
    tools: ['WordPress', 'WooCommerce', 'Custom Theme'],
    year: '2023',
    link: ''
  },
  {
    id: 4,
    title: 'Surya Electronics Hub',
    category: 'WooCommerce',
    description: 'Electronics storefront with a custom product comparison feature and structured data for richer search results.',
    tools: ['WooCommerce', 'PHP', 'Custom Theme', 'REST API'],
    year: '2023',
    link: ''
  },
  {
    id: 5,
    title: 'Pasal Grocery',
    category: 'WooCommerce',
    description: 'Subscription-based grocery delivery store with recurring orders and a custom delivery-day scheduler.',
    tools: ['WooCommerce Subscriptions', 'PHP', 'Custom Theme'],
    year: '2023',
    link: ''
  },
  {
    id: 6,
    title: 'Rupa Fashion Boutique',
    category: 'WooCommerce',
    description: 'Fashion e-commerce site with a custom theme, size-guide integration, and a backend built to handle frequent catalog changes.',
    tools: ['WordPress', 'WooCommerce', 'Custom Theme', 'JavaScript'],
    year: '2022',
    link: ''
  }
];
