export interface Job {
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly url?: string;
  readonly summary: readonly string[];
  readonly stack?: string;
}

export interface SkillGroup {
  readonly title: string;
  readonly items: readonly string[];
}

export const profile = {
  name: 'George Knap',
  title: 'Senior Angular & Nx Engineer',
  tagline: 'Agentic Engineering | Developer Experience',
  location: 'Czech Rep. / Austria / remote',
  linkedin: 'https://www.linkedin.com/in/george-knap',
  github: 'https://github.com/GeorgeKnap',
  cv: 'https://drive.google.com/file/d/12zZnvkwcg3lERGXs801LOe0oPYApjKlw/view?usp=drive_link',
  photo: 'assets/profile-pic.png',
  summary:
    'Senior Angular & Nx Engineer and Developer Experience lead with extensive expertise in architecting high-performance web platforms, large-scale monorepos, and agentic engineering workflows. Recognized for driving modern frontend modernization, optimizing CI pipelines, and delivering robust scalable solutions across international enterprise environments.',
} as const;

export const skillGroups: readonly SkillGroup[] = [
  {
    title: 'Frontend',
    items: [
      'Nx',
      'Angular 20+',
      'Signals',
      'NgRx',
      'NgRx Signal Stores',
      'RxJS',
      'TailwindCSS',
      'Material Design',
      'Storybook',
      'Qwik & Qwik City',
      'Qwik Modular Forms',
      'Zod',
      'Valibot',
      'Leaflet',
      'Highcharts',
      'PWA',
      'SSR',
      'SSG',
    ],
  },
  {
    title: 'Testing & tooling',
    items: ['Jest', 'Vitest', 'Cypress', 'ESLint', 'Oxlint', 'Prettier', 'Oxfmt', 'TypeScript'],
  },
  {
    title: 'AI & agentic',
    items: [
      'Agentic driven development',
      'GitHub Copilot',
      'Claude',
      'Antigravity',
      'Skills & instructions',
      'MCP servers',
      'WebMCP',
      'AI agents',
    ],
  },
  {
    title: 'Backend & real-time',
    items: [
      'NestJS',
      'Express',
      'GraphQL',
      'OpenAPI',
      'Swagger',
      'Node.js',
      'Bun',
      'Firebase',
      'SSE',
      'SignalR',
      'Mercure Hub',
    ],
  },
  {
    title: 'Workflow',
    items: [
      'VS Code',
      'GitKraken',
      'Jira',
      'Confluence',
      'Bitbucket',
      'GitHub',
      'Jenkins',
      'Groovy',
      'Docker',
      'Vercel',
      'Slack',
      'Discord',
      'Teams',
      'Zoom',
      'Agile',
    ],
  },
];

export const codingStyle: readonly string[] = [
  'Declarative instead of imperative code',
  'Pure functions',
  'Correct solutions instead of quick hacks',
  'Well structured components: smart/dumb separation, SOLID principles',
  'Well tested components with Jest/Vitest, Cypress component testing and Cypress E2E',
  'Component harnesses that make tests easy to write',
];

export const experience: readonly Job[] = [
  {
    company: 'Solare Datensysteme GmbH (BKW Energie AG)',
    role: 'Front End Technical Lead, Angular & Nx Engineer',
    period: '2018 – present',
    url: 'https://www.solar-log.com',
    summary: [
      'Tech lead and architect responsible for the core implementation of the PV monitoring platform Enerest WEB 4.',
      'Built and maintained Angular monitoring modules for a PV platform used by 400k+ users across 140 countries, with a focus on uptime and performance.',
      'Lead and mentor team members, and optimize the Nx pipeline to bring its performance into CI for a smooth developer experience.',
    ],
    stack: 'Nx 22, Angular 21, Material design system, Highcharts, AG Grid, Tailwind, Jest/Vitest, Cypress, Storybook',
  },
  {
    company: 'Entain Services Austria',
    role: 'Senior Angular Engineer Level III',
    period: '11/2024 – 12/2025',
    url: 'https://www.entaingroup.com/',
    summary: [
      'Responsible for DX of one of the largest Nx monorepos in the world in the sports betting and online gaming industry.',
      "Migrated ESLint to flat-config, moved tooling to ESM, updated code-pushup rules to visualize ESLint KPI statistics, and refactored legacy code to use Nx's affected and caching mechanisms.",
    ],
  },
  {
    company: 'Svihej.cz jumping ropes community portal',
    role: 'Qwik Front End Developer',
    period: '07/2024 – 10/2024',
    url: 'https://portal.svihej.cz/',
    summary: [
      'Svihej.cz is a leading jumping ropes e-shop in Czechia. Its community portal promotes a healthy lifestyle and challenges people to learn tricks, earn achievements and share progress.',
      'Developed an instant-on, fully resumable community portal in Qwik.',
    ],
    stack: 'Qwik, Qwik City, Zod, Valibot',
  },
  {
    company: 'Dronetag',
    role: 'Flutter Developer trainee, for fun',
    period: '2021 · 3 months',
    url: 'https://dronetag.cz/',
    summary: [
      'Czech startup helping drone pilots with new EU legislation. Joined young professionals from Czech Technical University to build a Flutter mobile app, play with drones and learn Flutter.',
    ],
    stack: 'Dart, Flutter, Material, Cubit',
  },
  {
    company: 'Artinii',
    role: 'Authentication server',
    period: '2021 · 1 month',
    url: 'https://artinii.com/',
    summary: [
      'Implemented an OAuth server with Code Flow + PKCE, serving as the single sign-in server for artinii.com, whose other domains authenticate against it and share the user token.',
    ],
    stack: 'Angular, TypeScript, angular-oauth2-oidc',
  },
  {
    company: 'INTENS Corporation',
    role: 'Head of Front End development team & Technical Lead',
    period: '2016 – 2018',
    url: 'https://www.intens.cz',
    summary: [
      'Led a small team responsible for the technical design, architecture and development of Angular web apps, mostly GIS and crisis management systems for Prague City Council and Police Departments.',
    ],
    stack: 'Angular, Angular Material, AngularJS, Bootstrap, AG Grid, Leaflet, ArcGIS, ServiceStack, .NET 4.6 & .NET Core, MSSQL, ElasticSearch',
  },
  {
    company: 'Veropath',
    role: 'AngularJS Developer, Edinburgh, UK',
    period: '2014 – 2015',
    url: 'https://www.veropath.com',
    summary: [
      'Developed a Telecoms Expense Management web app in AngularJS & TypeScript, covering both front end and server side.',
    ],
    stack: 'Visual Studio 2015, ASP.NET vNext, AngularJS, C#, RESTful API, Insight.Database, MSSQL',
  },
  {
    company: 'Penzijni spolecnost Ceske pojistovny',
    role: 'C# software developer',
    period: '2010 – 2014',
    url: 'https://www.pfcp.cz/',
    summary: [
      'Implemented and tested features of two internal information systems, the first built on Sybase PowerBuilder & Sybase ASE.',
      'In 2012 joined a team building a new full-stack system with user contract modules across front end, back end and SQL.',
    ],
    stack: '.NET 4.5, Visual Studio 2010, ReSharper, TFS, WPF, MVVM, nHibernate, MSSQL',
  },
  {
    company: '4M4 limited company',
    role: 'Database developer / Data miner',
    period: '2008 – 2010',
    summary: [
      'Developed an information system for hotels and restaurants, including T-SQL development.',
    ],
    stack: 'Sybase ASE, Sybase PowerBuilder, T-SQL',
  },
];

export const education = {
  school: 'University of Economics in Prague',
  period: '2006 – 2010',
  detail: 'Applied Informatics, bachelor’s degree',
} as const;

export const languages: readonly { readonly name: string; readonly level: string }[] = [
  { name: 'Czech', level: 'native' },
  { name: 'English', level: 'C1' },
  { name: 'Español', level: 'B2' },
  { name: 'Deutsch', level: 'B1' },
];
