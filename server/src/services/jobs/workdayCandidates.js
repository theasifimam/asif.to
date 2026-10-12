// Employers that hire in the Gulf and may publish on Workday. A Workday career site is addressed by
// tenant + data-centre ("wdN") + site name, none of which can be derived from a company name, so these are
// educated guesses. `npm run find:workday-boards` tests each one against the public API and reports only
// the boards that exist and have Gulf jobs, so a wrong guess costs one request. Extend freely.
//   [tenant, [pods to try], [site names to try]]
const generic = (tenant) => ["External", "Careers", "careers", "Jobs", "External_Career_Site", "ExternalCareerSite", `${tenant}Careers`, `${tenant}_Careers`, tenant, tenant.toUpperCase()];

const known = [
  ["mastercard", ["wd1"], ["CorporateCareers"]],
  ["accenture", ["wd103"], ["AccentureCareers"]],
  ["visa", ["wd5"], ["Jobs", "visa"]],
  ["citi", ["wd5"], ["2"]],
  ["pwc", ["wd3"], ["Global_Experienced_Careers"]],
  ["sc", ["wd3"], ["Careers", "External"]],
  ["honeywell", ["wd5"], ["Honeywell"]],
  ["bakerhughes", ["wd5"], ["BakerHughes"]],
  ["slb", ["wd1"], ["SLBExternal", "External", "SLB"]],
  ["halliburton", ["wd1"], ["External", "Halliburton"]],
  ["pepsico", ["wd1"], ["PepsiCoJobs"]],
  ["unilever", ["wd3"], ["Unilever_Experienced_Professionals", "Unilever"]],
  ["nestle", ["wd3"], ["nestlecareers"]],
  ["marriott", ["wd5"], ["Marriott"]],
  ["hilton", ["wd5"], ["Hilton", "External"]],
  ["hyatt", ["wd1"], ["External"]],
  ["ihg", ["wd3"], ["IHG"]],
  ["dell", ["wd1"], ["External"]],
  ["cisco", ["wd5"], ["Cisco_Careers"]],
  ["salesforce", ["wd12"], ["External_Career_Site"]],
  ["adobe", ["wd5"], ["external_experienced"]],
  ["nvidia", ["wd5"], ["NVIDIAExternalCareerSite"]],
  ["intel", ["wd1"], ["External"]],
  ["workday", ["wd5"], ["Workday"]],
  ["pfizer", ["wd1"], ["PfizerCareers"]],
  ["novartis", ["wd3"], ["Novartis_Careers"]],
  ["astrazeneca", ["wd3"], ["Careers"]],
  ["gsk", ["wd5"], ["GSKCareers"]],
  ["abbott", ["wd5"], ["abbottcareers"]],
  ["shs", ["wd3"], ["SHS-Careers"]],
  ["shell", ["wd3"], ["ShellCareers"]],
  ["bp", ["wd3"], ["bpCareers"]],
  ["jacobs", ["wd1"], ["External"]],
  ["wsp", ["wd3"], ["WSP"]],
  ["kbr", ["wd5"], ["KBR_Careers"]],
  ["gevernova", ["wd5"], ["vernova"]],
  ["ge", ["wd5"], ["GE_ExternalSite"]],
  ["boeing", ["wd1"], ["EXTERNAL_CAREERS"]],
  ["globalhr", ["wd5"], ["REC_RTX_Ext_Gateway"]],
  ["thales", ["wd3"], ["Careers"]],
  ["hp", ["wd5"], ["ExternalCareerSite"]],
  ["hpe", ["wd5"], ["Jobsathpe"]],
  ["broadcom", ["wd1"], ["External_Career"]],
  ["snowflake", ["wd1"], ["Snowflake"]],
  ["paypal", ["wd1"], ["jobs"]],
  ["blackrock", ["wd1"], ["BlackRock_Professional"]],
  ["kimberlyclark", ["wd1"], ["GLOBAL"]],
  ["coke", ["wd1"], ["coca-cola-careers"]],
  ["philips", ["wd3"], ["jobs-and-careers"]],
  ["concentrix", ["wd1"], ["Concentrix_Careers"]],
  ["collaborative", ["wd1"], ["AllOpenings"]],
  ["tp", ["wd3"], ["Teleperformance_External"]],
];

// Tenants guessed from company names only: try the generic site names on the most common data centres.
const byName = [
  "emirates", "etihad", "adnoc", "aramex", "agility", "dpworld", "maf", "mafretail", "lulu", "landmark", "alshaya", "chalhoub", "emaar", "damac", "aldar", "nakheel",
  "mashreq", "enbd", "fab", "adcb", "dib", "rakbank", "stc", "mobily", "zain", "ooredoo", "etisalat", "du", "g42", "aramco", "sabic", "maaden", "neom", "pif", "alrajhi", "snb",
  "almarai", "savola", "jarir", "qatarairways", "qatarenergy", "qnb", "nbk", "kfh", "batelco", "alba", "bapco", "omantel", "pdo", "oq",
  "deloitte", "ey", "kpmg", "bcg", "mckinsey", "bain", "oliverwyman", "mercer", "aon", "marsh", "wtw", "gallagher",
  "siemens", "schneiderelectric", "se", "abb", "emerson", "carrier", "otis", "kone", "johnsoncontrols", "ge", "ericsson", "nokia", "huawei", "oracle", "sap", "microsoft", "ibm", "vmware", "servicenow",
  "johnsonandjohnson", "jnj", "merck", "roche", "sanofi", "bayer", "medtronic", "bd", "baxter", "stryker", "bostonscientific",
  "loreal", "pg", "colgate", "mondelez", "danone", "reckitt", "diageo", "heineken", "abinbev", "mars", "kraftheinz",
  "ikea", "inditex", "hm", "nike", "adidas", "puma", "decathlon", "carrefour", "starbucks", "mcdonalds", "yum", "papajohns",
  "accor", "kerzner", "radisson", "wyndham", "fourseasons", "rotana", "jumeirah", "minor", "millennium",
  "dhl", "maersk", "kuehnenagel", "dsv", "msc", "cmacgm", "fedex", "ups", "emiratesnbd", "standardchartered", "hsbc", "citi", "jpmorgan", "goldmansachs", "morganstanley", "bnpparibas", "ing", "deutschebank", "ubs",
  "aecom", "atkinsrealis", "arup", "mottmac", "turnerandtownsend", "fluor", "bechtel", "saipem", "technipfmc", "petrofac", "woodplc", "nov", "weatherford", "baker",
  "teleperformance", "concentrix", "genpact", "cognizant", "infosys", "wipro", "tcs", "hcltech", "techmahindra", "capgemini",
  "randstad", "adecco", "manpower", "hays", "michaelpage", "robertwalters", "kornferry", "spencerstuart",
  "mediclinic", "nmc", "asterdm", "clevelandclinic", "mayoclinic", "fakeeh", "burjeel", "pure", "m42",
];

export const WORKDAY_CANDIDATES = [
  ...known.map(([tenant, pods, sites]) => ({ tenant, pods, sites: [...new Set([...sites, ...generic(tenant).slice(0, 3)])] })),
  ...byName.filter((tenant) => !known.some(([name]) => name === tenant)).map((tenant) => ({ tenant, pods: ["wd3", "wd1", "wd5"], sites: ["External", "Careers", "careers", "Jobs", `${tenant}Careers`, tenant] })),
];
