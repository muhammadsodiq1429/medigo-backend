DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'doctor_ver_status_enum'
) THEN CREATE TYPE doctor_ver_status_enum AS ENUM (
  'draft',
  'under_review',
  'verified',
  'rejected',
  'suspended'
);
END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'appointment_status_enum'
) THEN CREATE TYPE appointment_status_enum AS ENUM ('pending', 'paid', 'completed', 'cancelled');
END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'weekday_enum'
) THEN CREATE TYPE weekday_enum AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_type
  WHERE typname = 'region_enum'
) THEN CREATE TYPE region_enum AS ENUM (
  'Andijon',
  'Buxoro',
  'Farg‘ona',
  'Jizzax',
  'Xorazm',
  'Namangan',
  'Navoiy',
  'Qashqadaryo',
  'Qoraqalpog‘iston',
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Toshkent viloyati',
  'Toshkent shahar'
);
END IF;
END $$;
CREATE TABLE admin (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  fullname VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
  hashed_password VARCHAR(255) NOT NULL
);
CREATE TABLE doctor (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL UNIQUE,
  gender VARCHAR(16) NOT NULL CHECK (gender IN ('male', 'female')),
  date_of_birth DATE NOT NULL,
  avatar_url VARCHAR(255) NOT NULL,
  verification_status doctor_ver_status_enum NOT NULL DEFAULT 'draft',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  region region_enum NOT NULL,
  average_rating NUMERIC(12, 2) NOT NULL DEFAULT 0,
  review_count BIGINT NOT NULL DEFAULT 0,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  hashed_password VARCHAR(255) NOT NULL,
  since_experience DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE document_type (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  required BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE doctor_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_id BIGINT NOT NULL REFERENCES document_type(id),
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  file_url VARCHAR(255) NOT NULL,
  UNIQUE(type_id, doctor_id)
);
CREATE TABLE service_type (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);
CREATE TABLE doctor_service (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  type_id BIGINT NOT NULL REFERENCES service_type(id),
  price NUMERIC(12, 2) NOT NULL,
  UNIQUE(doctor_id, type_id)
);
CREATE TABLE doctor_schedule (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  weekday weekday_enum NOT NULL,
  UNIQUE(doctor_id, weekday),
  CHECK (end_time > start_time)
);
CREATE TABLE doctor_cards (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  card_number BIGINT NOT NULL,
  exp_month SMALLINT NOT NULL CHECK (
    exp_month BETWEEN 1 AND 12
  ),
  exp_year SMALLINT NOT NULL CHECK (
    exp_year BETWEEN 2000 AND 2100
  ),
  status VARCHAR(16) NOT NULL CHECK (status IN ('active', 'inactive', 'expired')),
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX uq_doctor_card_fingerprint ON doctor_cards (doctor_id, card_number, exp_month, exp_year);
CREATE UNIQUE INDEX uq_doctor_card_one_main ON doctor_cards (doctor_id)
WHERE is_main;

CREATE TABLE patient (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  gender VARCHAR(16) NOT NULL CHECK (gender IN ('male', 'female')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  hashed_password VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE patient_saved_doctors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patient(id),
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  UNIQUE(patient_id, doctor_id)
);
CREATE TABLE patient_cards (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patient(id),
  card_number BIGINT NOT NULL,
  exp_month SMALLINT NOT NULL CHECK (
    exp_month BETWEEN 1 AND 12
  ),
  exp_year SMALLINT NOT NULL CHECK (
    exp_year BETWEEN 2000 AND 2100
  ),
  status VARCHAR(16) NOT NULL CHECK (status IN ('active', 'inactive', 'expired')),
  is_main BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX uq_patient_card_fingerprint ON patient_cards (patient_id, card_number, exp_month, exp_year);
CREATE UNIQUE INDEX uq_patient_card_one_main ON patient_cards (patient_id)
WHERE is_main;
CREATE TABLE specialization (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE doctor_specialization (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  specialization_id BIGINT NOT NULL REFERENCES specialization(id),
  UNIQUE (doctor_id, specialization_id)
);
CREATE TABLE appointment (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  patient_id BIGINT NOT NULL REFERENCES patient(id),
  service_id BIGINT NOT NULL REFERENCES doctor_service(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status_enum NOT NULL DEFAULT 'pending',
  amount NUMERIC(12, 2) NOT NULL
);
CREATE TABLE review (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  patient_id BIGINT NOT NULL REFERENCES patient(id),
  author VARCHAR(16) NOT NULL CHECK (author IN ('patient', 'doctor')),
  content TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (
    rating BETWEEN 1 AND 5
  ),
  appointment_id BIGINT NOT NULL REFERENCES appointment(id),
  UNIQUE(appointment_id, author)
);
CREATE TABLE payment (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointment(id),
  doctor_id BIGINT NOT NULL REFERENCES doctor(id),
  patient_id BIGINT NOT NULL REFERENCES patient(id),
  total_amount NUMERIC(12, 2) NOT NULL,
  status appointment_status_enum NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);