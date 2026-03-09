export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }, { value: 'DC', label: 'District of Columbia' },
];

export const POPULAR_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford',
  'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Porsche',
  'Ram', 'Rivian', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

export const TERM_OPTIONS = [
  { value: 36, label: '36 months (3 years)' },
  { value: 48, label: '48 months (4 years)' },
  { value: 60, label: '60 months (5 years)' },
  { value: 72, label: '72 months (6 years)' },
  { value: 84, label: '84 months (7 years)' },
];

export const SAMPLE_LENDERS = [
  { id: 'l1', name: 'Capital One Auto', tier: 'prime' as const, minFico: 660, logo: '', apr: 4.49 },
  { id: 'l2', name: 'Chase Auto Finance', tier: 'prime' as const, minFico: 680, logo: '', apr: 4.99 },
  { id: 'l3', name: 'Ally Financial', tier: 'near_prime' as const, minFico: 620, logo: '', apr: 6.49 },
  { id: 'l4', name: 'TD Auto Finance', tier: 'near_prime' as const, minFico: 630, logo: '', apr: 6.99 },
  { id: 'l5', name: 'Westlake Financial', tier: 'subprime' as const, minFico: 520, logo: '', apr: 9.99 },
  { id: 'l6', name: 'Credit Acceptance Corp', tier: 'subprime' as const, minFico: 0, logo: '', apr: 12.99 },
  { id: 'l7', name: 'Prestige Financial', tier: 'subprime' as const, minFico: 500, logo: '', apr: 11.49 },
  { id: 'l8', name: 'Self-Help Credit Union', tier: 'specialty' as const, minFico: 0, logo: '', apr: 7.99 },
];
