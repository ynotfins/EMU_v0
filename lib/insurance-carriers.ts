/**
 * Comprehensive list of major US homeowners insurance carriers
 * with their 24-hour claims phone numbers
 * 
 * Priority:
 * 1. 24-hour claims hotline (preferred)
 * 2. 24-hour customer service
 * 3. General claims number
 */

export interface InsuranceCarrier {
  name: string;
  claimsPhone: string;
  phoneType: '24hr-claims' | '24hr-service' | 'claims';
  marketShare?: string; // Top carriers noted
}

export const INSURANCE_CARRIERS: InsuranceCarrier[] = [
  // TOP 10 CARRIERS (by market share)
  { name: 'State Farm', claimsPhone: '800-732-5246', phoneType: '24hr-claims', marketShare: '#1' },
  { name: 'Allstate', claimsPhone: '800-726-6033', phoneType: '24hr-claims', marketShare: '#2' },
  { name: 'USAA', claimsPhone: '800-531-8722', phoneType: '24hr-claims', marketShare: '#3' },
  { name: 'Liberty Mutual', claimsPhone: '800-225-2467', phoneType: '24hr-claims', marketShare: '#4' },
  { name: 'Farmers Insurance', claimsPhone: '800-435-7764', phoneType: '24hr-claims', marketShare: '#5' },
  { name: 'Nationwide', claimsPhone: '877-669-6877', phoneType: '24hr-claims', marketShare: '#6' },
  { name: 'Travelers', claimsPhone: '800-252-4633', phoneType: '24hr-claims', marketShare: '#7' },
  { name: 'American Family Insurance', claimsPhone: '800-692-6326', phoneType: '24hr-claims', marketShare: '#8' },
  { name: 'Chubb', claimsPhone: '800-252-4670', phoneType: '24hr-claims', marketShare: '#9' },
  { name: 'Progressive', claimsPhone: '800-274-4499', phoneType: '24hr-claims', marketShare: '#10' },

  // MAJOR NATIONAL CARRIERS (A-Z)
  { name: 'AAA Insurance', claimsPhone: '800-222-4357', phoneType: '24hr-service' },
  { name: 'Amica Mutual', claimsPhone: '800-242-6422', phoneType: '24hr-claims' },
  { name: 'AIG (American International Group)', claimsPhone: '877-244-0304', phoneType: '24hr-claims' },
  { name: 'Assurant', claimsPhone: '888-760-7328', phoneType: 'claims' },
  { name: 'Auto-Owners Insurance', claimsPhone: '888-252-4626', phoneType: '24hr-claims' },
  { name: 'Bankers Insurance Group', claimsPhone: '888-499-6442', phoneType: 'claims' },
  { name: 'Bristol West', claimsPhone: '800-274-7865', phoneType: '24hr-service' },
  { name: 'Church Mutual', claimsPhone: '800-554-2642', phoneType: '24hr-claims' },
  { name: 'Cincinnati Insurance', claimsPhone: '877-242-2544', phoneType: '24hr-claims' },
  { name: 'CNA Insurance', claimsPhone: '877-262-2727', phoneType: '24hr-claims' },
  { name: 'Country Financial', claimsPhone: '866-268-6879', phoneType: '24hr-claims' },
  { name: 'CSE Insurance Group', claimsPhone: '877-277-3383', phoneType: 'claims' },
  { name: 'Dairyland Insurance', claimsPhone: '800-334-0090', phoneType: '24hr-service' },
  { name: 'EMC Insurance', claimsPhone: '800-362-2000', phoneType: '24hr-claims' },
  { name: 'Encompass Insurance', claimsPhone: '800-262-5535', phoneType: '24hr-claims' },
  { name: 'Erie Insurance', claimsPhone: '800-458-0811', phoneType: '24hr-claims' },
  { name: 'Esurance', claimsPhone: '800-378-7262', phoneType: '24hr-claims' },
  { name: 'Farm Bureau Insurance', claimsPhone: '800-247-4170', phoneType: '24hr-service' },
  { name: 'Foremost Insurance', claimsPhone: '800-527-3905', phoneType: '24hr-claims' },
  { name: 'GEICO', claimsPhone: '800-841-3000', phoneType: '24hr-claims' },
  { name: 'Grange Insurance', claimsPhone: '800-445-3030', phoneType: '24hr-claims' },
  { name: 'The General', claimsPhone: '800-280-1466', phoneType: '24hr-service' },
  { name: 'The Hartford', claimsPhone: '800-243-5860', phoneType: '24hr-claims' },
  { name: 'Hanover Insurance', claimsPhone: '800-628-0250', phoneType: '24hr-claims' },
  { name: 'Hippo Insurance', claimsPhone: '844-436-1273', phoneType: '24hr-service' },
  { name: 'Homesite Insurance', claimsPhone: '877-977-3745', phoneType: 'claims' },
  { name: 'Horace Mann', claimsPhone: '800-999-1030', phoneType: '24hr-claims' },
  { name: 'Kemper', claimsPhone: '866-536-7371', phoneType: '24hr-claims' },
  { name: 'Lemonade', claimsPhone: '844-733-8666', phoneType: '24hr-service' },
  { name: 'LexisNexis Risk Solutions', claimsPhone: '866-396-7459', phoneType: 'claims' },
  { name: 'Mercury Insurance', claimsPhone: '800-503-3724', phoneType: '24hr-claims' },
  { name: 'MetLife', claimsPhone: '800-854-6011', phoneType: '24hr-claims' },
  { name: 'Mutual of Omaha', claimsPhone: '800-775-6000', phoneType: '24hr-service' },
  { name: 'National General Insurance', claimsPhone: '877-468-3466', phoneType: '24hr-claims' },
  { name: 'Nationwide Private Client', claimsPhone: '877-669-6877', phoneType: '24hr-claims' },
  { name: 'NJM Insurance', claimsPhone: '800-232-6600', phoneType: '24hr-claims' },
  { name: 'Northstar Insurance', claimsPhone: '866-668-4357', phoneType: 'claims' },
  { name: 'Occidental Fire & Casualty', claimsPhone: '800-252-1847', phoneType: 'claims' },
  { name: 'Pacific Specialty Insurance', claimsPhone: '800-457-8790', phoneType: 'claims' },
  { name: 'Pemco Insurance', claimsPhone: '800-467-3626', phoneType: '24hr-claims' },
  { name: 'Plymouth Rock Assurance', claimsPhone: '855-475-9666', phoneType: '24hr-claims' },
  { name: 'Prudential', claimsPhone: '800-778-3827', phoneType: '24hr-service' },
  { name: 'Pure Insurance', claimsPhone: '888-813-7873', phoneType: '24hr-claims' },
  { name: 'QBE Insurance', claimsPhone: '800-367-1307', phoneType: '24hr-claims' },
  { name: 'Safeco Insurance', claimsPhone: '800-332-3226', phoneType: '24hr-claims' },
  { name: 'Safeway Insurance', claimsPhone: '800-723-3929', phoneType: 'claims' },
  { name: 'Selective Insurance', claimsPhone: '800-777-4728', phoneType: '24hr-claims' },
  { name: 'Shelter Insurance', claimsPhone: '800-743-5837', phoneType: '24hr-claims' },
  { name: 'Stillwater Insurance', claimsPhone: '800-220-1351', phoneType: '24hr-claims' },
  { name: 'Swyfft', claimsPhone: '844-799-3381', phoneType: '24hr-service' },
  { name: 'Texas Farm Bureau', claimsPhone: '800-772-1131', phoneType: '24hr-claims' },
  { name: 'Tokio Marine HCC', claimsPhone: '800-874-2465', phoneType: 'claims' },
  { name: 'Tower Hill Insurance', claimsPhone: '800-342-3407', phoneType: '24hr-claims' },
  { name: 'Utica National', claimsPhone: '800-274-3644', phoneType: '24hr-claims' },
  { name: 'Victoria Insurance', claimsPhone: '800-365-6422', phoneType: 'claims' },
  { name: 'Westfield Insurance', claimsPhone: '800-243-0210', phoneType: '24hr-claims' },
  { name: 'West Bend Mutual Insurance', claimsPhone: '866-392-8810', phoneType: '24hr-claims' },
  { name: 'Zurich Insurance', claimsPhone: '877-987-4248', phoneType: '24hr-claims' },

  // REGIONAL & SPECIALTY CARRIERS
  { name: 'ACE American Insurance', claimsPhone: '800-945-2223', phoneType: '24hr-claims' },
  { name: 'Allied Trust Insurance', claimsPhone: '888-660-8110', phoneType: 'claims' },
  { name: 'American Bankers Insurance', claimsPhone: '800-852-8186', phoneType: 'claims' },
  { name: 'American Modern Insurance', claimsPhone: '800-375-2075', phoneType: '24hr-claims' },
  { name: 'American National', claimsPhone: '800-899-6501', phoneType: '24hr-service' },
  { name: 'American Strategic Insurance', claimsPhone: '800-645-4433', phoneType: 'claims' },
  { name: 'Arrowhead General Insurance', claimsPhone: '877-277-6943', phoneType: 'claims' },
  { name: 'Bear River Mutual', claimsPhone: '800-232-7791', phoneType: '24hr-claims' },
  { name: 'Berkshire Hathaway GUARD', claimsPhone: '877-484-8273', phoneType: '24hr-claims' },
  { name: 'Capitol Preferred Insurance', claimsPhone: '866-274-3025', phoneType: 'claims' },
  { name: 'Citizens Property Insurance', claimsPhone: '866-411-2742', phoneType: '24hr-claims' },
  { name: 'Direct General Insurance', claimsPhone: '877-463-4732', phoneType: '24hr-service' },
  { name: 'Edison Insurance', claimsPhone: '888-683-7971', phoneType: 'claims' },
  { name: 'Florida Peninsula Insurance', claimsPhone: '877-271-2721', phoneType: '24hr-claims' },
  { name: 'Frankenmuth Insurance', claimsPhone: '800-234-2424', phoneType: '24hr-claims' },
  { name: 'Goodville Mutual', claimsPhone: '800-448-4622', phoneType: 'claims' },
  { name: 'GuideOne Insurance', claimsPhone: '888-218-8561', phoneType: '24hr-claims' },
  { name: 'Heritage Insurance', claimsPhone: '888-335-9802', phoneType: '24hr-claims' },
  { name: 'IMT Insurance', claimsPhone: '800-274-3644', phoneType: '24hr-claims' },
  { name: 'Infinity Insurance', claimsPhone: '800-334-1661', phoneType: '24hr-service' },
  { name: 'Jewelers Mutual', claimsPhone: '844-463-8667', phoneType: '24hr-claims' },
  { name: 'Kentucky Farm Bureau', claimsPhone: '800-264-3276', phoneType: '24hr-claims' },
  { name: 'Louisiana Citizens', claimsPhone: '877-783-3728', phoneType: '24hr-claims' },
  { name: 'Main Street America', claimsPhone: '800-742-4567', phoneType: '24hr-claims' },
  { name: 'Mapfre Insurance', claimsPhone: '888-953-7828', phoneType: '24hr-claims' },
  { name: 'Markel Insurance', claimsPhone: '800-362-7535', phoneType: 'claims' },
  { name: 'MetroMile', claimsPhone: '888-242-5204', phoneType: '24hr-service' },
  { name: 'MMG Insurance', claimsPhone: '800-343-0533', phoneType: '24hr-claims' },
  { name: 'MSA Insurance', claimsPhone: '888-672-4228', phoneType: 'claims' },
  { name: 'National Lloyds Insurance', claimsPhone: '800-767-1933', phoneType: 'claims' },
  { name: 'Northern Neck Insurance', claimsPhone: '800-769-6720', phoneType: 'claims' },
  { name: 'Ohio Mutual Insurance', claimsPhone: '800-762-1895', phoneType: '24hr-claims' },
  { name: 'Oregon Mutual', claimsPhone: '800-252-7874', phoneType: '24hr-claims' },
  { name: 'Pekin Insurance', claimsPhone: '800-322-0160', phoneType: '24hr-claims' },
  { name: 'PEMCO Mutual', claimsPhone: '800-467-3626', phoneType: '24hr-claims' },
  { name: 'Pennsylvania Lumbermens Mutual', claimsPhone: '800-752-1895', phoneType: 'claims' },
  { name: 'Philadelphia Insurance', claimsPhone: '800-873-4552', phoneType: '24hr-claims' },
  { name: 'Secura Insurance', claimsPhone: '800-558-6411', phoneType: '24hr-claims' },
  { name: 'Society Insurance', claimsPhone: '800-280-0701', phoneType: '24hr-claims' },
  { name: 'Southern Farm Bureau', claimsPhone: '800-237-1854', phoneType: '24hr-claims' },
  { name: 'State Auto Insurance', claimsPhone: '800-627-7400', phoneType: '24hr-claims' },
  { name: 'Titan Insurance', claimsPhone: '855-788-4826', phoneType: 'claims' },
  { name: 'TWFG Insurance', claimsPhone: '877-493-4872', phoneType: 'claims' },
  { name: 'Universal Property & Casualty', claimsPhone: '800-299-3121', phoneType: '24hr-claims' },
  { name: 'Vermont Mutual', claimsPhone: '800-639-1000', phoneType: '24hr-claims' },
  { name: 'Virginia Farm Bureau', claimsPhone: '800-277-1878', phoneType: '24hr-claims' },
  { name: 'West Bend', claimsPhone: '866-392-8810', phoneType: '24hr-claims' },
  { name: 'Western National Insurance', claimsPhone: '800-367-4554', phoneType: '24hr-claims' },
  { name: 'Wilson Mutual Insurance', claimsPhone: '800-243-6907', phoneType: 'claims' },
  { name: 'Wright Flood Insurance', claimsPhone: '866-373-5663', phoneType: '24hr-claims' },

  // Add "Other" option at the end
  { name: 'Other / Not Listed', claimsPhone: '', phoneType: 'claims' },
];

/**
 * Get carrier by name
 */
export function getCarrierByName(name: string): InsuranceCarrier | undefined {
  return INSURANCE_CARRIERS.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get top carriers by market share
 */
export function getTopCarriers(limit: number = 10): InsuranceCarrier[] {
  return INSURANCE_CARRIERS.filter(c => c.marketShare).slice(0, limit);
}

/**
 * Search carriers by name
 */
export function searchCarriers(query: string): InsuranceCarrier[] {
  const lowerQuery = query.toLowerCase();
  return INSURANCE_CARRIERS.filter(c => 
    c.name.toLowerCase().includes(lowerQuery)
  );
}

