-- EZ Car Loans - Seed Data
-- Run AFTER schema.sql

-- Users (passwords hashed with bcrypt)
-- admin@clp / admin2026
-- lender@demo.com / demo123
-- dealer@demo.com / demo123
INSERT INTO users (id, email, name, password_hash, role, entity_id) VALUES
  ('usr_admin_1', 'admin@clp', 'Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', NULL),
  ('usr_lender_1', 'lender@demo.com', 'Demo Lender', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lender', 'LND-001'),
  ('usr_dealer_1', 'dealer@demo.com', 'AutoMax Houston', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'dealer', 'DLR-001')
ON CONFLICT (id) DO NOTHING;

-- Lenders
INSERT INTO lenders (id, name, tier, min_fico, max_ltv, max_dti, states, min_loan, max_loan, approval_rate, avg_decision_hrs, is_active) VALUES
  ('LND-001', 'Capital One Auto', ARRAY['prime','near_prime'], 620, 120, 45, ARRAY['TX','CA','FL','NY','IL'], 7500, 75000, 72, 2.5, true),
  ('LND-002', 'Ally Financial', ARRAY['prime','near_prime'], 600, 130, 50, ARRAY['TX','CA','FL','NY','AZ','OH'], 5000, 100000, 68, 3.0, true),
  ('LND-003', 'Westlake Financial', ARRAY['near_prime','subprime'], 500, 140, 55, ARRAY['TX','CA','FL','AZ','GA'], 3000, 50000, 82, 1.5, true),
  ('LND-004', 'Chase Auto', ARRAY['prime'], 680, 110, 40, ARRAY['TX','CA','NY','FL','IL','WA'], 10000, 100000, 55, 4.0, true),
  ('LND-005', 'DriveTime', ARRAY['subprime'], 450, 150, 60, ARRAY['TX','FL','AZ','GA','NC'], 5000, 40000, 88, 1.0, true),
  ('LND-006', 'United Auto Credit', ARRAY['subprime'], 480, 145, 55, ARRAY['TX','CA','FL','AZ','NV'], 4000, 45000, 85, 1.5, true),
  ('LND-007', 'PenFed Credit Union', ARRAY['prime'], 700, 100, 38, ARRAY['TX','CA','VA','MD','DC'], 10000, 100000, 48, 6.0, true),
  ('LND-008', 'AmeriCredit (GM Financial)', ARRAY['near_prime','subprime'], 550, 135, 50, ARRAY['TX','CA','FL','MI','OH','GA'], 6000, 65000, 75, 2.0, true)
ON CONFLICT (id) DO NOTHING;

-- Dealers
INSERT INTO dealers (id, name, address, city, state, phone, dealer_type, active_buyers, deals_closed, avg_deal_size, is_active) VALUES
  ('DLR-001', 'AutoMax Houston', '4500 Southwest Fwy', 'Houston', 'TX', '(713) 555-0101', 'franchise', 12, 45, 28500, true),
  ('DLR-002', 'Lone Star Motors', '8900 N Central Expy', 'Dallas', 'TX', '(214) 555-0202', 'franchise', 8, 32, 31200, true),
  ('DLR-003', 'Valley Auto Sales', '2100 E Expressway 83', 'McAllen', 'TX', '(956) 555-0303', 'independent', 5, 18, 19800, true),
  ('DLR-004', 'Premier Auto Group', '6700 S Padre Island Dr', 'Corpus Christi', 'TX', '(361) 555-0404', 'franchise', 6, 22, 34600, true),
  ('DLR-005', 'EZ Drive Auto', '3200 N Loop 250 W', 'Midland', 'TX', '(432) 555-0505', 'independent', 3, 11, 22400, true)
ON CONFLICT (id) DO NOTHING;

-- Applications
INSERT INTO applications (id, borrower, employment, credit, vehicle, deal_structure, loan_amount, ltv_percent, dti_percent, pti_percent, status, state, submitted_at, lenders_submitted, offers_received, flags) VALUES
  ('APP-001', '{"firstName":"Marcus","lastName":"Johnson","email":"marcus.j@email.com","phone":"(713)555-1234","dob":"1990-05-15","address":"4521 Westheimer Rd","city":"Houston","state":"TX","zip":"77027"}',
   '{"status":"employed","employer":"Shell Oil","title":"Senior Engineer","monthsAtEmployer":48,"grossMonthlyIncome":8500}',
   '{"ficoScore":720,"scoreTier":"prime","totalMonthlyObligations":1200,"openAutoTradelines":1,"derogatoryMarks":0,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2024,"make":"Toyota","model":"Camry","trim":"XSE","vin":"4T1G11AK5RU000001","mileage":8500,"condition":"excellent","bookValue":32000,"askingPrice":31500}',
   '{"salePrice":31500,"downPayment":5000,"tradeInValue":0,"tradeInPayoff":0,"docFee":150,"taxAndFees":2100,"totalAmountFinanced":28750,"requestedTerm":60}',
   28750, 89.8, 35.2, 4.8, 'offers_available', 'TX', now() - interval '2 days', 4, 3, ARRAY[]::TEXT[]),

  ('APP-002', '{"firstName":"Sarah","lastName":"Chen","email":"sarah.c@email.com","phone":"(214)555-5678","dob":"1985-11-22","address":"1200 Main St","city":"Dallas","state":"TX","zip":"75201"}',
   '{"status":"employed","employer":"AT&T","title":"Marketing Manager","monthsAtEmployer":36,"grossMonthlyIncome":7200}',
   '{"ficoScore":680,"scoreTier":"near_prime","totalMonthlyObligations":1800,"openAutoTradelines":0,"derogatoryMarks":1,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2023,"make":"Honda","model":"CR-V","trim":"EX-L","vin":"2HKRW2H84PH000002","mileage":22000,"condition":"good","bookValue":30000,"askingPrice":29500}',
   '{"salePrice":29500,"downPayment":3000,"tradeInValue":4500,"tradeInPayoff":2000,"docFee":150,"taxAndFees":1900,"totalAmountFinanced":24050,"requestedTerm":72}',
   24050, 80.2, 38.5, 5.1, 'pending_decision', 'TX', now() - interval '1 day', 3, 0, ARRAY[]::TEXT[]),

  ('APP-003', '{"firstName":"Roberto","lastName":"Garza","email":"r.garza@email.com","phone":"(956)555-9012","dob":"1988-03-08","address":"800 N 10th St","city":"McAllen","state":"TX","zip":"78501"}',
   '{"status":"employed","employer":"McAllen ISD","title":"Teacher","monthsAtEmployer":72,"grossMonthlyIncome":4800}',
   '{"ficoScore":590,"scoreTier":"subprime","totalMonthlyObligations":900,"openAutoTradelines":1,"derogatoryMarks":2,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2022,"make":"Nissan","model":"Altima","trim":"SR","vin":"1N4BL4CV6NN000003","mileage":35000,"condition":"good","bookValue":22000,"askingPrice":21500}',
   '{"salePrice":21500,"downPayment":2500,"tradeInValue":0,"tradeInPayoff":0,"docFee":150,"taxAndFees":1400,"totalAmountFinanced":20550,"requestedTerm":60}',
   20550, 93.4, 27.5, 6.2, 'conditional', 'TX', now() - interval '3 days', 5, 2, ARRAY['high_ltv']),

  ('APP-004', '{"firstName":"Jennifer","lastName":"Williams","email":"j.williams@email.com","phone":"(361)555-3456","dob":"1992-07-19","address":"5600 Saratoga Blvd","city":"Corpus Christi","state":"TX","zip":"78413"}',
   '{"status":"employed","employer":"CHRISTUS Health","title":"RN","monthsAtEmployer":24,"grossMonthlyIncome":6100}',
   '{"ficoScore":710,"scoreTier":"prime","totalMonthlyObligations":1100,"openAutoTradelines":0,"derogatoryMarks":0,"hasRepo":false,"hasBankruptcy":false}',
   '{"year":2025,"make":"Hyundai","model":"Tucson","trim":"Limited","vin":"5NMJFDAF1RH000004","mileage":500,"condition":"new","bookValue":38000,"askingPrice":37500}',
   '{"salePrice":37500,"downPayment":7500,"tradeInValue":0,"tradeInPayoff":0,"docFee":150,"taxAndFees":2500,"totalAmountFinanced":32650,"requestedTerm":72}',
   32650, 85.9, 32.1, 7.2, 'funded', 'TX', now() - interval '7 days', 3, 2, ARRAY[]::TEXT[]),

  ('APP-005', '{"firstName":"David","lastName":"Martinez","email":"d.martinez@email.com","phone":"(432)555-7890","dob":"1995-01-30","address":"2400 W Illinois Ave","city":"Midland","state":"TX","zip":"79701"}',
   '{"status":"employed","employer":"Chevron","title":"Field Technician","monthsAtEmployer":18,"grossMonthlyIncome":5500}',
   '{"ficoScore":520,"scoreTier":"subprime","totalMonthlyObligations":1400,"openAutoTradelines":2,"derogatoryMarks":3,"hasRepo":true,"hasBankruptcy":false}',
   '{"year":2021,"make":"Ford","model":"F-150","trim":"XLT","vin":"1FTFW1E80MF000005","mileage":52000,"condition":"good","bookValue":35000,"askingPrice":34000}',
   '{"salePrice":34000,"downPayment":4000,"tradeInValue":0,"tradeInPayoff":0,"docFee":150,"taxAndFees":2200,"totalAmountFinanced":32350,"requestedTerm":72}',
   32350, 92.4, 42.8, 8.1, 'declined', 'TX', now() - interval '5 days', 6, 0, ARRAY['repo_history','high_dti','high_ltv'])
ON CONFLICT (id) DO NOTHING;

-- Offers
INSERT INTO offers (id, application_id, lender_id, lender_name, apr, term_months, monthly_payment, total_cost, down_payment_required, stipulations, status, expires_at, decision_at) VALUES
  ('OFR-001', 'APP-001', 'LND-001', 'Capital One Auto', 4.49, 60, 535.82, 32149, 5000, ARRAY['Proof of income','Proof of residence'], 'approved', now() + interval '7 days', now() - interval '1 day'),
  ('OFR-002', 'APP-001', 'LND-002', 'Ally Financial', 4.99, 60, 542.66, 32560, 5000, ARRAY['Proof of income'], 'approved', now() + interval '7 days', now() - interval '1 day'),
  ('OFR-003', 'APP-001', 'LND-004', 'Chase Auto', 3.99, 60, 529.02, 31741, 5000, ARRAY['Proof of income','2 recent pay stubs'], 'approved', now() + interval '5 days', now() - interval '1 day'),
  ('OFR-004', 'APP-003', 'LND-003', 'Westlake Financial', 11.99, 60, 456.30, 27378, 2500, ARRAY['Proof of income','Proof of residence','3 references'], 'conditional', now() + interval '5 days', now() - interval '2 days'),
  ('OFR-005', 'APP-003', 'LND-006', 'United Auto Credit', 13.49, 60, 472.85, 28371, 3000, ARRAY['Proof of income','Proof of residence','Utility bill'], 'conditional', now() + interval '5 days', now() - interval '2 days'),
  ('OFR-006', 'APP-004', 'LND-001', 'Capital One Auto', 4.99, 72, 523.74, 37709, 7500, ARRAY['Proof of income'], 'selected', now() + interval '10 days', now() - interval '5 days'),
  ('OFR-007', 'APP-004', 'LND-007', 'PenFed Credit Union', 3.99, 72, 510.85, 36781, 7500, ARRAY['Proof of income','Membership enrollment'], 'approved', now() + interval '10 days', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- Deals
INSERT INTO deals (id, application_id, offer_id, dealer_id, lender_id, buyer_name, vehicle, amount, apr, term, status, vin, funded_at) VALUES
  ('DEAL-001', 'APP-004', 'OFR-006', 'DLR-004', 'LND-001', 'Jennifer Williams', '2025 Hyundai Tucson Limited', 32650, 4.99, 72, 'funded', '5NMJFDAF1RH000004', now() - interval '3 days'),
  ('DEAL-002', 'APP-001', 'OFR-003', 'DLR-001', 'LND-004', 'Marcus Johnson', '2024 Toyota Camry XSE', 28750, 3.99, 60, 'docs_sent', '4T1G11AK5RU000001', NULL),
  ('DEAL-003', 'APP-003', 'OFR-004', 'DLR-003', 'LND-003', 'Roberto Garza', '2022 Nissan Altima SR', 20550, 11.99, 60, 'pending', '1N4BL4CV6NN000003', NULL)
ON CONFLICT (id) DO NOTHING;

-- Activity Events
INSERT INTO activity_events (type, message, actor, entity_type, entity_id, timestamp) VALUES
  ('application_submitted', 'Marcus Johnson submitted a loan application', 'Marcus Johnson', 'application', 'APP-001', now() - interval '2 days'),
  ('offers_received', 'APP-001 received 3 lender offers', 'system', 'application', 'APP-001', now() - interval '1 day'),
  ('offer_selected', 'Marcus Johnson selected Chase Auto offer at 3.99% APR', 'Marcus Johnson', 'offer', 'OFR-003', now() - interval '12 hours'),
  ('deal_funded', 'Jennifer Williams deal funded — 2025 Hyundai Tucson via Capital One', 'Capital One Auto', 'deal', 'DEAL-001', now() - interval '3 days'),
  ('lender_decision', 'Westlake Financial conditionally approved APP-003', 'Westlake Financial', 'offer', 'OFR-004', now() - interval '2 days'),
  ('application_declined', 'David Martinez application declined by all lenders', 'system', 'application', 'APP-005', now() - interval '4 days');

-- Compliance Alerts
INSERT INTO compliance_alerts (type, severity, message, entity_type, entity_id, resolved) VALUES
  ('adverse_action', 'high', 'APP-005 requires adverse action notice within 30 days (ECOA)', 'application', 'APP-005', false),
  ('rate_cap', 'medium', 'OFR-005 APR 13.49% approaching TX usury cap for subprime', 'offer', 'OFR-005', false),
  ('stale_offer', 'low', 'OFR-004 conditional offer approaching expiration', 'offer', 'OFR-004', false);
