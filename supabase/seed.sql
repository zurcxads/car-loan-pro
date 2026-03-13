-- Car Loan Pro - Seed Data (matches production schema)
-- Run AFTER schema.sql

-- Users (bcrypt hashed passwords)
-- Password for all demo accounts: AutoLoanPro2026!
-- admin@autoloanpro.co / AutoLoanPro2026!
-- demo@ally.com / AutoLoanPro2026!
-- demo@dealer.com / AutoLoanPro2026!
-- marcus.j@email.com / AutoLoanPro2026!
-- Hash generated with: bcrypt.hashSync('AutoLoanPro2026!', 10)
INSERT INTO users (email, name, password_hash, role, entity_id) VALUES
  ('admin@autoloanpro.co', 'Platform Admin', '$2a$10$rQ/YvN8dJ1p7PJqL0lXvj.mXZMfQUV5xY3rQ5KZYwUhZE3FqG3GWq', 'admin', NULL),
  ('demo@ally.com', 'Ally Financial Demo', '$2a$10$rQ/YvN8dJ1p7PJqL0lXvj.mXZMfQUV5xY3rQ5KZYwUhZE3FqG3GWq', 'lender', 'LND-001'),
  ('demo@dealer.com', 'AutoMax Houston Demo', '$2a$10$rQ/YvN8dJ1p7PJqL0lXvj.mXZMfQUV5xY3rQ5KZYwUhZE3FqG3GWq', 'dealer', 'DLR-001'),
  ('marcus.j@email.com', 'Marcus Johnson', '$2a$10$rQ/YvN8dJ1p7PJqL0lXvj.mXZMfQUV5xY3rQ5KZYwUhZE3FqG3GWq', 'consumer', NULL)
ON CONFLICT (email) DO NOTHING;

-- Lenders
INSERT INTO lenders (id, name, tier, min_fico, max_ltv, max_dti, max_pti, min_loan_amount, max_loan_amount, max_vehicle_age, max_mileage, accepts_cpo, accepts_private_party, accepts_itin, states_active, referral_fee, is_active, integration_status, avg_decision_time_minutes, rate_tiers) VALUES
  ('LND-001', 'Ally Financial', 'near_prime', 620, 120, 48, 22, 5000, 75000, 10, 120000, true, true, false, '{"All 50"}', 300, true, 'API', 15, '[{"ficoMin":720,"ficoMax":850,"rateMin":3.5,"rateMax":4.5},{"ficoMin":660,"ficoMax":719,"rateMin":5.0,"rateMax":6.5},{"ficoMin":620,"ficoMax":659,"rateMin":7.0,"rateMax":9.0}]'),
  ('LND-002', 'Capital One Auto', 'prime', 660, 110, 42, 18, 8000, 100000, 8, 100000, true, false, false, '{"All 50"}', 250, true, 'API', 8, '[{"ficoMin":720,"ficoMax":850,"rateMin":3.0,"rateMax":4.0},{"ficoMin":660,"ficoMax":719,"rateMin":4.5,"rateMax":5.5}]'),
  ('LND-003', 'Chase Auto', 'prime', 680, 108, 40, 16, 10000, 150000, 7, 80000, true, false, false, '{"All 50"}', 275, true, 'API', 12, '[{"ficoMin":720,"ficoMax":850,"rateMin":2.9,"rateMax":3.9},{"ficoMin":680,"ficoMax":719,"rateMin":4.0,"rateMax":5.0}]'),
  ('LND-004', 'Westlake Financial', 'subprime', 520, 130, 52, 25, 3000, 50000, 12, 150000, true, true, true, '{"All 50"}', 400, true, 'API', 20, '[{"ficoMin":620,"ficoMax":719,"rateMin":6.0,"rateMax":8.0},{"ficoMin":520,"ficoMax":619,"rateMin":8.0,"rateMax":14.0}]'),
  ('LND-005', 'Prestige Financial', 'subprime', 500, 128, 50, 24, 3000, 40000, 12, 140000, true, true, true, '{"All 50"}', 380, true, 'Manual', 45, '[{"ficoMin":600,"ficoMax":719,"rateMin":7.0,"rateMax":10.0},{"ficoMin":500,"ficoMax":599,"rateMin":10.0,"rateMax":16.0}]'),
  ('LND-006', 'TD Auto Finance', 'near_prime', 630, 118, 46, 20, 5000, 80000, 10, 110000, true, false, false, '{"All 50"}', 290, true, 'API', 18, '[{"ficoMin":720,"ficoMax":850,"rateMin":3.8,"rateMax":4.8},{"ficoMin":660,"ficoMax":719,"rateMin":5.0,"rateMax":6.5},{"ficoMin":630,"ficoMax":659,"rateMin":6.5,"rateMax":8.5}]')
ON CONFLICT (id) DO NOTHING;

-- Dealers
INSERT INTO dealers (id, name, city, state, address, zip, phone, website, contact_email, franchise_brands, buyers_sent_mtd, deals_funded_mtd, plan, plan_price, billing_date, status, joined_date, team_members) VALUES
  ('DLR-001', 'AutoMax Houston', 'Houston', 'TX', '8500 Southwest Freeway', '77074', '(713) 555-0100', 'automaxhouston.com', 'sales@automaxhou.com', '{"Toyota","Honda","Nissan"}', 14, 8, 'Pro', 499, '2026-03-15', 'active', '2025-06-01', '[{"name":"Carlos Rivera","email":"carlos@automaxhou.com","role":"Sales Manager","status":"active","addedDate":"2025-06-01"},{"name":"Lisa Chen","email":"lisa@automaxhou.com","role":"F&I Manager","status":"active","addedDate":"2025-06-15"},{"name":"Marcus Webb","email":"marcus@automaxhou.com","role":"Internet Sales","status":"active","addedDate":"2025-08-01"}]'),
  ('DLR-002', 'Premier Ford Dallas', 'Dallas', 'TX', '2200 N Stemmons Freeway', '75207', '(214) 555-0200', 'premierford.com', 'finance@premierford.com', '{"Ford","Lincoln"}', 9, 5, 'Starter', 299, '2026-03-20', 'active', '2025-09-15', '[{"name":"David Park","email":"david@premierford.com","role":"F&I Manager","status":"active","addedDate":"2025-09-15"},{"name":"Sarah Lee","email":"sarah@premierford.com","role":"Internet Sales","status":"active","addedDate":"2025-10-01"}]'),
  ('DLR-003', 'Sunshine Nissan', 'Miami', 'FL', '4400 NW 36th St', '33166', '(305) 555-0300', 'sunshinenissan.com', 'internet@sunshinenissan.com', '{"Nissan"}', 7, 3, 'Pro', 499, '2026-03-10', 'active', '2025-11-01', '[{"name":"Ana Martinez","email":"ana@sunshinenissan.com","role":"Sales Manager","status":"active","addedDate":"2025-11-01"}]'),
  ('DLR-004', 'Pacific Toyota', 'Los Angeles', 'CA', '1200 S Figueroa St', '90015', '(213) 555-0400', 'pacifictoyota.com', 'fleet@pacifictoyota.com', '{"Toyota","Lexus"}', 11, 6, 'Enterprise', 999, '2026-03-01', 'active', '2025-04-01', '[{"name":"James Tanaka","email":"james@pacifictoyota.com","role":"Sales Manager","status":"active","addedDate":"2025-04-01"},{"name":"Michelle Park","email":"michelle@pacifictoyota.com","role":"F&I Manager","status":"active","addedDate":"2025-04-15"},{"name":"Ryan Brooks","email":"ryan@pacifictoyota.com","role":"Internet Sales","status":"active","addedDate":"2025-05-01"},{"name":"Jessica Liu","email":"jessica@pacifictoyota.com","role":"Admin","status":"active","addedDate":"2025-06-01"}]')
ON CONFLICT (id) DO NOTHING;

-- Applications
INSERT INTO applications (id, borrower, employment, credit, vehicle, deal_structure, loan_amount, ltv_percent, dti_percent, pti_percent, status, state, submitted_at, updated_at, lenders_submitted, offers_received, flags) VALUES
  ('APP-001', '{"firstName":"Marcus","lastName":"Johnson","email":"marcus.j@email.com","phone":"(713) 555-0142","ssn":"***-**-4521","dob":"1988-04-15","address":"4521 Elm Street","city":"Houston","state":"TX","zip":"77001","residenceType":"own","monthlyHousingPayment":1450,"monthsAtAddress":36}',
   '{"status":"full_time","employer":"Texas Medical Center","title":"IT Specialist","monthsAtEmployer":48,"grossMonthlyIncome":6200,"incomeType":"employment"}',
   '{"ficoScore":742,"scoreTier":"prime","totalMonthlyObligations":1984,"openAutoTradelines":1,"derogatoryMarks":0,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2022,"make":"Toyota","model":"Camry","trim":"SE","vin":"4T1BF1FK0NU123456","mileage":28000,"condition":"used","bookValue":29000,"askingPrice":29000,"dealerName":"AutoMax Houston"}',
   '{"salePrice":29000,"downPayment":2500,"tradeInValue":0,"tradeInPayoff":0,"docFee":499,"taxAndFees":1800,"totalAmountFinanced":28500,"requestedTerm":60}',
   28500, 98, 32, 14, 'offers_available', 'TX', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 4, 3, '{}'),

  ('APP-002', '{"firstName":"Diana","lastName":"Cruz","email":"diana.cruz@email.com","phone":"(305) 555-0198","ssn":"***-**-7832","dob":"1992-08-22","address":"982 Palm Ave","city":"Miami","state":"FL","zip":"33101","residenceType":"rent","monthlyHousingPayment":1800,"monthsAtAddress":18}',
   '{"status":"full_time","employer":"Baptist Health","title":"Registered Nurse","monthsAtEmployer":30,"grossMonthlyIncome":5400,"incomeType":"employment"}',
   '{"ficoScore":681,"scoreTier":"near_prime","totalMonthlyObligations":2214,"openAutoTradelines":0,"derogatoryMarks":1,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2020,"make":"Honda","model":"Civic","trim":"EX","vin":"2HGFC2F63LH567890","mileage":42000,"condition":"used","bookValue":18300,"askingPrice":19200,"dealerName":"Sunshine Nissan"}',
   '{"salePrice":19200,"downPayment":1500,"tradeInValue":0,"tradeInPayoff":0,"docFee":499,"taxAndFees":1200,"totalAmountFinanced":19200,"requestedTerm":60}',
   19200, 105, 41, 17, 'pending_decision', 'FL', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 3, 2, '{}'),

  ('APP-003', '{"firstName":"Kevin","lastName":"Park","email":"kpark@email.com","phone":"(404) 555-0167","ssn":"***-**-3456","dob":"1985-11-03","address":"1200 Peachtree Rd","city":"Atlanta","state":"GA","zip":"30301","residenceType":"rent","monthlyHousingPayment":1350,"monthsAtAddress":24}',
   '{"status":"full_time","employer":"Home Depot HQ","title":"Warehouse Manager","monthsAtEmployer":36,"grossMonthlyIncome":4800,"incomeType":"employment"}',
   '{"ficoScore":598,"scoreTier":"subprime","totalMonthlyObligations":2112,"openAutoTradelines":1,"derogatoryMarks":3,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2018,"make":"Ford","model":"F-150","trim":"XLT","vin":"1FTEW1EG5JFB12345","mileage":68000,"condition":"used","bookValue":14100,"askingPrice":15800,"dealerName":"Premier Ford Dallas"}',
   '{"salePrice":15800,"downPayment":1000,"tradeInValue":0,"tradeInPayoff":0,"docFee":499,"taxAndFees":950,"totalAmountFinanced":15800,"requestedTerm":60}',
   15800, 112, 44, 18, 'conditional', 'GA', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 3, 1, '{}'),

  ('APP-004', '{"firstName":"Aaliyah","lastName":"Thompson","email":"aaliyah.t@email.com","phone":"(216) 555-0134","ssn":"***-**-9012","dob":"1990-06-18","address":"556 Lake Shore Blvd","city":"Cleveland","state":"OH","zip":"44101","residenceType":"own","monthlyHousingPayment":1100,"monthsAtAddress":60}',
   '{"status":"full_time","employer":"Cleveland Clinic","title":"Physical Therapist","monthsAtEmployer":42,"grossMonthlyIncome":7200,"incomeType":"employment"}',
   '{"ficoScore":724,"scoreTier":"prime","totalMonthlyObligations":2088,"openAutoTradelines":0,"derogatoryMarks":0,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2023,"make":"Chevrolet","model":"Equinox","trim":"LT","vin":"3GNAXUEV5PL234567","mileage":12000,"condition":"certified_pre_owned","bookValue":35500,"askingPrice":34000,"dealerName":"AutoMax Houston"}',
   '{"salePrice":34000,"downPayment":3000,"tradeInValue":2500,"tradeInPayoff":0,"docFee":499,"taxAndFees":2100,"totalAmountFinanced":34000,"requestedTerm":60}',
   34000, 96, 29, 13, 'funded', 'OH', NOW() - INTERVAL '18 days', NOW() - INTERVAL '5 days', 4, 3, '{}'),

  ('APP-005', '{"firstName":"Roberto","lastName":"Vasquez","email":"rvasquez@email.com","phone":"(213) 555-0156","ssn":"***-**-5678","dob":"1979-02-28","address":"3400 Sunset Blvd","city":"Los Angeles","state":"CA","zip":"90001","residenceType":"rent","monthlyHousingPayment":2200,"monthsAtAddress":12}',
   '{"status":"self_employed","employer":"Vasquez Construction LLC","title":"Owner","monthsAtEmployer":60,"grossMonthlyIncome":5100,"incomeType":"self_employed"}',
   '{"ficoScore":612,"scoreTier":"subprime","totalMonthlyObligations":2193,"openAutoTradelines":2,"derogatoryMarks":2,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2019,"make":"Nissan","model":"Altima","trim":"SV","vin":"1N4BL4BV9KC345678","mileage":55000,"condition":"used","bookValue":20300,"askingPrice":22100,"dealerName":"Pacific Toyota"}',
   '{"salePrice":22100,"downPayment":1500,"tradeInValue":0,"tradeInPayoff":0,"docFee":499,"taxAndFees":1400,"totalAmountFinanced":22100,"requestedTerm":60}',
   22100, 109, 43, 19, 'pending_decision', 'CA', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 3, 0, '{}')
ON CONFLICT (id) DO NOTHING;

-- Offers
INSERT INTO offers (id, application_id, lender_id, lender_name, apr, term_months, monthly_payment, approved_amount, conditions, status, decision_at, expires_at) VALUES
  ('OFR-001', 'APP-001', 'LND-001', 'Ally Financial', 4.49, 60, 529, 28500, '{"Proof of income"}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-002', 'APP-001', 'LND-002', 'Capital One Auto', 4.89, 60, 536, 28500, '{}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-003', 'APP-001', 'LND-006', 'TD Auto Finance', 5.19, 60, 543, 27000, '{"Full coverage insurance"}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-004', 'APP-002', 'LND-004', 'Westlake Financial', 7.99, 60, 388, 19200, '{"Proof of income","Proof of insurance"}', 'approved', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),
  ('OFR-005', 'APP-002', 'LND-005', 'Prestige Financial', 8.49, 60, 396, 18500, '{"2 recent paystubs"}', 'conditional', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),
  ('OFR-006', 'APP-004', 'LND-003', 'Chase Auto', 3.89, 60, 761, 41500, '{}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-007', 'APP-004', 'LND-002', 'Capital One Auto', 3.99, 60, 763, 41500, '{"Proof of insurance"}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-008', 'APP-004', 'LND-002', 'Capital One Auto', 4.29, 60, 769, 40000, '{}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('OFR-009', 'APP-004', 'LND-001', 'Ally Financial', 4.49, 72, 664, 41500, '{}', 'approved', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days')
ON CONFLICT (id) DO NOTHING;

-- Deals
INSERT INTO deals (id, application_id, dealer_id, buyer_first_name, buyer_last_initial, vehicle, vin, lender_name, amount, rate, term, monthly_payment, status, days_open, dealer_net, submitted_at, funded_at, events) VALUES
  ('DEAL-001', 'APP-004', 'DLR-001', 'Aaliyah', 'T', '2023 Chevrolet Equinox LT', '3GNAXUEV5PL234567', 'Ally Financial', 34000, 4.49, 60, 631, 'funded', 12, 28500, NOW() - INTERVAL '16 days', NOW() - INTERVAL '5 days', '[{"timestamp":"2026-02-22T10:00:00Z","event":"Deal submitted to Ally Financial"},{"timestamp":"2026-02-22T14:00:00Z","event":"Lender review started"},{"timestamp":"2026-02-24T09:00:00Z","event":"Approved for funding"},{"timestamp":"2026-03-03T11:00:00Z","event":"Wire sent to dealership"},{"timestamp":"2026-03-05T10:00:00Z","event":"Deal funded - completed"}]'),
  ('DEAL-002', 'APP-001', 'DLR-001', 'Marcus', 'J', '2022 Toyota Camry SE', '4T1BF1FK0NU123456', 'Capital One Auto', 28500, 4.89, 60, 536, 'lender_review', 2, 0, NOW() - INTERVAL '2 days', NULL, '[{"timestamp":"2026-03-07T16:00:00Z","event":"Deal submitted to Capital One Auto"},{"timestamp":"2026-03-08T09:00:00Z","event":"Lender review started"}]'),
  ('DEAL-003', 'APP-003', 'DLR-002', 'Kevin', 'P', '2018 Ford F-150 XLT', '1FTEW1EG5JFB12345', 'Westlake Financial', 15800, 7.99, 60, 312, 'submitted', 1, 0, NOW() - INTERVAL '1 day', NULL, '[{"timestamp":"2026-03-09T10:00:00Z","event":"Deal submitted to Westlake Financial"}]')
ON CONFLICT (id) DO NOTHING;

-- Activity Events
INSERT INTO activity_events (type, description, timestamp) VALUES
  ('application', 'APP-001: Marcus Johnson submitted application', NOW() - INTERVAL '2 days'),
  ('offer', 'OFR-001: Ally Financial sent offer at 4.49% APR', NOW() - INTERVAL '2 days'),
  ('offer', 'OFR-002: Capital One Auto sent offer at 4.89% APR', NOW() - INTERVAL '2 days'),
  ('funded', 'APP-004: Ally Financial funded $34,000 loan', NOW() - INTERVAL '5 days'),
  ('application', 'APP-002: Diana Cruz submitted application', NOW() - INTERVAL '1 day'),
  ('offer', 'OFR-004: Westlake Financial approved APP-002 at 7.99%', NOW() - INTERVAL '1 day'),
  ('application', 'APP-005: Roberto Vasquez submitted application', NOW() - INTERVAL '1 day'),
  ('system', 'System: Daily credit pull batch completed - 5 applications processed', NOW() - INTERVAL '12 hours'),
  ('application', 'APP-003: Kevin Park application conditionally approved', NOW() - INTERVAL '2 days'),
  ('declined', 'APP-005: Pending lender decisions', NOW() - INTERVAL '6 hours');

-- Compliance Alerts
INSERT INTO compliance_alerts (id, type, message, action, resolved, timestamp) VALUES
  ('ALT-001', 'error', 'Failed credit pull for ITIN borrower - bureau timeout', 'Retry', false, NOW() - INTERVAL '1 day'),
  ('ALT-002', 'warning', 'Adverse action notice deadline approaching for APP-003', 'View', false, NOW() - INTERVAL '1 day'),
  ('ALT-003', 'info', 'New lender signup: Pacific Credit Union - pending approval', 'Review', false, NOW() - INTERVAL '2 days'),
  ('ALT-004', 'warning', 'Lender API timeout: Prestige Financial (3 occurrences today)', 'View', false, NOW() - INTERVAL '12 hours'),
  ('ALT-005', 'success', 'Revenue milestone: $100K total referral fees collected', 'Dismiss', true, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
