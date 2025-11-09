--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    surgery_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    implant_id uuid,
    hospital_id uuid NOT NULL,
    booking_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    preferred_surgery_date timestamp without time zone,
    actual_surgery_date timestamp without time zone,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    total_cost double precision NOT NULL,
    advance_payment double precision NOT NULL,
    paid_amount double precision DEFAULT 0.0,
    remaining_amount double precision,
    special_requirements text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    confirmed_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: doctor_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_availability (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time character varying(10) NOT NULL,
    end_time character varying(10) NOT NULL,
    slot_duration_minutes integer DEFAULT 30,
    is_available boolean DEFAULT true,
    break_time_start character varying(10),
    break_time_end character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_availability OWNER TO postgres;

--
-- Name: doctor_education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_education (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    degree character varying(255) NOT NULL,
    institution character varying(255) NOT NULL,
    university character varying(255),
    year_completed integer NOT NULL,
    specialization character varying(255),
    grade character varying(50),
    certificate_url character varying(500),
    transcript_url character varying(500),
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_education OWNER TO postgres;

--
-- Name: doctor_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_experience (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    "position" character varying(255) NOT NULL,
    hospital character varying(255) NOT NULL,
    start_year integer NOT NULL,
    end_year integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_experience OWNER TO postgres;

--
-- Name: doctor_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    media_type character varying(50) NOT NULL,
    media_url character varying(500) NOT NULL,
    title character varying(255),
    description text,
    thumbnail_url character varying(500),
    duration_seconds integer,
    privacy_disclaimer text,
    admin_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_media OWNER TO postgres;

--
-- Name: doctor_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    notification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    action_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_at timestamp without time zone
);


ALTER TABLE public.doctor_notifications OWNER TO postgres;

--
-- Name: doctor_publications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctor_publications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    journal character varying(255),
    publication_date timestamp without time zone,
    authors jsonb,
    abstract text,
    doi character varying(255),
    pubmed_id character varying(100),
    citation_count integer DEFAULT 0,
    publication_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.doctor_publications OWNER TO postgres;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    date_of_birth timestamp without time zone,
    gender character varying(10),
    primary_specialization character varying(255) NOT NULL,
    secondary_specializations jsonb,
    medical_council_number character varying(100) NOT NULL,
    medical_council_state character varying(100),
    license_expiry_date timestamp without time zone,
    experience_years integer NOT NULL,
    post_masters_years integer DEFAULT 0,
    bio text,
    consultation_fee double precision NOT NULL,
    surgery_fee double precision,
    followup_fee double precision,
    training_type character varying(50),
    fellowships integer DEFAULT 0,
    procedures_completed integer DEFAULT 0,
    google_reviews_link character varying(500),
    website_url character varying(500),
    linkedin_url character varying(500),
    online_consultation boolean DEFAULT false,
    in_person_consultation boolean DEFAULT true,
    emergency_services boolean DEFAULT false,
    location character varying(255),
    clinic_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    rating double precision DEFAULT 0.0,
    total_reviews integer DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    verification_status character varying(20) DEFAULT 'pending'::character varying,
    image_url character varying(500),
    profile_video_url character varying(500),
    online_status boolean DEFAULT false,
    profile_completeness integer DEFAULT 0,
    verification_score integer DEFAULT 0,
    languages_spoken jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    approved_at timestamp without time zone,
    approved_by uuid,
    user_id uuid
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: hospitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hospitals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    zone character varying(100),
    location character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    latitude double precision,
    longitude double precision,
    facilities jsonb,
    total_beds integer,
    icu_beds integer,
    operation_theaters integer,
    emergency_services boolean DEFAULT true,
    ambulance_service boolean DEFAULT true,
    insurance_accepted boolean DEFAULT true,
    accreditations jsonb,
    base_price double precision,
    consumables_cost double precision,
    room_charges_per_day double precision,
    phone character varying(20),
    email character varying(255),
    website character varying(500),
    image_url character varying(500),
    images jsonb,
    rating double precision DEFAULT 0.0,
    total_reviews integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hospitals OWNER TO postgres;

--
-- Name: implants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.implants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(255) NOT NULL,
    brand_type character varying(100),
    manufacturer character varying(255),
    material character varying(255),
    surgery_type character varying(255),
    expected_life character varying(100),
    range_of_motion character varying(100),
    peer_reviewed_studies integer DEFAULT 0,
    success_rate double precision,
    warranty character varying(100),
    price double precision NOT NULL,
    description text,
    features jsonb,
    company_highlights jsonb,
    suitable_age character varying(100),
    activity_level character varying(100),
    image_url character varying(500),
    brochure_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.implants OWNER TO postgres;

--
-- Name: patient_medical_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_medical_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    chronic_diseases jsonb,
    past_surgeries_detailed jsonb,
    current_medications_detailed jsonb,
    allergies_detailed jsonb,
    immunization_records jsonb,
    family_history jsonb,
    medical_reports_url jsonb,
    prescription_url jsonb,
    lab_reports_url jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patient_medical_history OWNER TO postgres;

--
-- Name: patient_testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_testimonials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid NOT NULL,
    patient_id uuid,
    rating integer NOT NULL,
    testimonial_text text NOT NULL,
    treatment_type character varying(255),
    treatment_date timestamp without time zone,
    patient_name character varying(255),
    patient_age integer,
    patient_location character varying(255),
    before_photo_url character varying(500),
    after_photo_url character varying(500),
    video_url character varying(500),
    verified boolean DEFAULT false,
    patient_consent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.patient_testimonials OWNER TO postgres;

--
-- Name: patient_vital_signs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_vital_signs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    heart_rate integer,
    temperature double precision,
    respiratory_rate integer,
    oxygen_saturation double precision,
    blood_glucose double precision,
    weight_kg double precision,
    height_cm double precision,
    bmi double precision,
    measured_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    measured_by character varying(255),
    measurement_context character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patient_vital_signs OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    alternate_phone character varying(20),
    date_of_birth timestamp without time zone NOT NULL,
    age integer NOT NULL,
    gender character varying(10) NOT NULL,
    occupation character varying(255),
    preferred_language character varying(50) DEFAULT 'English'::character varying,
    current_address text NOT NULL,
    permanent_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    emergency_contact_name character varying(255) NOT NULL,
    emergency_contact_phone character varying(20) NOT NULL,
    emergency_contact_relationship character varying(100),
    preferred_communication character varying(20) DEFAULT 'email'::character varying,
    insurance_provider character varying(255) NOT NULL,
    insurance_number character varying(100) NOT NULL,
    insurance_plan_type character varying(100),
    insurance_group_number character varying(100),
    policy_holder_name character varying(255),
    employer_name character varying(255),
    secondary_insurance_provider character varying(255),
    secondary_insurance_number character varying(100),
    insurance_card_front_url character varying(500),
    insurance_card_back_url character varying(500),
    insurance_file_uploaded boolean DEFAULT false,
    preferred_payment_method character varying(50) DEFAULT 'insurance'::character varying,
    financial_assistance_needed boolean DEFAULT false,
    insurance_preauth_status character varying(50) DEFAULT 'pending'::character varying,
    blood_group character varying(10),
    height_cm double precision,
    weight_kg double precision,
    bmi double precision,
    smoking_status character varying(20),
    alcohol_consumption character varying(20),
    substance_use_history text,
    current_medications jsonb,
    known_allergies jsonb,
    chronic_conditions jsonb,
    past_surgeries jsonb,
    family_medical_history jsonb,
    chief_complaint text,
    current_symptoms jsonb,
    symptom_duration character varying(100),
    pain_scale integer,
    primary_care_physician character varying(255),
    referring_doctor character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    user_id uuid
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: surgeries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.surgeries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    duration character varying(100),
    recovery_time character varying(100),
    anesthesia_type character varying(100),
    image_url character varying(500),
    video_url character varying(500),
    base_cost double precision,
    prerequisites jsonb,
    risks jsonb,
    success_rate double precision,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.surgeries OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    last_login timestamp without time zone,
    failed_login_attempts integer DEFAULT 0,
    account_locked_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'doctor'::character varying, 'patient'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Centralized authentication table for all user types';


--
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.role IS 'User role: admin, doctor, or patient';


--
-- Name: COLUMN users.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.is_active IS 'Whether the user account is active';


--
-- Name: COLUMN users.email_verified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.email_verified IS 'Whether the user has verified their email';


--
-- Name: COLUMN users.failed_login_attempts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.failed_login_attempts IS 'Number of consecutive failed login attempts';


--
-- Name: COLUMN users.account_locked_until; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.account_locked_until IS 'Timestamp until which the account is locked due to failed attempts';


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: doctor_availability doctor_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_pkey PRIMARY KEY (id);


--
-- Name: doctor_education doctor_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_education
    ADD CONSTRAINT doctor_education_pkey PRIMARY KEY (id);


--
-- Name: doctor_experience doctor_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_experience
    ADD CONSTRAINT doctor_experience_pkey PRIMARY KEY (id);


--
-- Name: doctor_media doctor_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_media
    ADD CONSTRAINT doctor_media_pkey PRIMARY KEY (id);


--
-- Name: doctor_notifications doctor_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notifications
    ADD CONSTRAINT doctor_notifications_pkey PRIMARY KEY (id);


--
-- Name: doctor_publications doctor_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_publications
    ADD CONSTRAINT doctor_publications_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- Name: doctors doctors_medical_council_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_medical_council_number_key UNIQUE (medical_council_number);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- Name: implants implants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.implants
    ADD CONSTRAINT implants_pkey PRIMARY KEY (id);


--
-- Name: patient_medical_history patient_medical_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_medical_history
    ADD CONSTRAINT patient_medical_history_pkey PRIMARY KEY (id);


--
-- Name: patient_testimonials patient_testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_testimonials
    ADD CONSTRAINT patient_testimonials_pkey PRIMARY KEY (id);


--
-- Name: patient_vital_signs patient_vital_signs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vital_signs
    ADD CONSTRAINT patient_vital_signs_pkey PRIMARY KEY (id);


--
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: surgeries surgeries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surgeries
    ADD CONSTRAINT surgeries_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: idx_admin_users_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_users_user_id ON public.admin_users USING btree (user_id);


--
-- Name: idx_bookings_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_doctor_id ON public.bookings USING btree (doctor_id);


--
-- Name: idx_bookings_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_patient_id ON public.bookings USING btree (patient_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_surgery_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_surgery_date ON public.bookings USING btree (actual_surgery_date);


--
-- Name: idx_doctor_availability_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_availability_doctor_id ON public.doctor_availability USING btree (doctor_id);


--
-- Name: idx_doctor_education_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_education_doctor_id ON public.doctor_education USING btree (doctor_id);


--
-- Name: idx_doctor_experience_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_experience_doctor_id ON public.doctor_experience USING btree (doctor_id);


--
-- Name: idx_doctor_media_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_media_doctor_id ON public.doctor_media USING btree (doctor_id);


--
-- Name: idx_doctor_notifications_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_notifications_doctor_id ON public.doctor_notifications USING btree (doctor_id);


--
-- Name: idx_doctor_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_notifications_is_read ON public.doctor_notifications USING btree (is_read);


--
-- Name: idx_doctor_publications_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctor_publications_doctor_id ON public.doctor_publications USING btree (doctor_id);


--
-- Name: idx_doctors_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_email ON public.doctors USING btree (email);


--
-- Name: idx_doctors_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_location ON public.doctors USING btree (city, state);


--
-- Name: idx_doctors_specialization; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_specialization ON public.doctors USING btree (primary_specialization);


--
-- Name: idx_doctors_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_status ON public.doctors USING btree (status);


--
-- Name: idx_doctors_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_doctors_user_id ON public.doctors USING btree (user_id);


--
-- Name: idx_hospitals_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hospitals_city ON public.hospitals USING btree (city);


--
-- Name: idx_hospitals_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hospitals_name ON public.hospitals USING btree (name);


--
-- Name: idx_hospitals_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hospitals_zone ON public.hospitals USING btree (zone);


--
-- Name: idx_implants_brand; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_implants_brand ON public.implants USING btree (brand);


--
-- Name: idx_implants_surgery_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_implants_surgery_type ON public.implants USING btree (surgery_type);


--
-- Name: idx_patient_medical_history_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_medical_history_patient_id ON public.patient_medical_history USING btree (patient_id);


--
-- Name: idx_patient_testimonials_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_testimonials_doctor_id ON public.patient_testimonials USING btree (doctor_id);


--
-- Name: idx_patient_testimonials_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_testimonials_rating ON public.patient_testimonials USING btree (rating);


--
-- Name: idx_patient_vital_signs_measured_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_vital_signs_measured_at ON public.patient_vital_signs USING btree (measured_at);


--
-- Name: idx_patient_vital_signs_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_vital_signs_patient_id ON public.patient_vital_signs USING btree (patient_id);


--
-- Name: idx_patients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_email ON public.patients USING btree (email);


--
-- Name: idx_patients_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_phone ON public.patients USING btree (phone);


--
-- Name: idx_patients_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_user_id ON public.patients USING btree (user_id);


--
-- Name: idx_surgeries_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_surgeries_category ON public.surgeries USING btree (category);


--
-- Name: idx_surgeries_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_surgeries_name ON public.surgeries USING btree (name);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: doctors update_doctors_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: hospitals update_hospitals_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: implants update_implants_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_implants_updated_at BEFORE UPDATE ON public.implants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: surgeries update_surgeries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_surgeries_updated_at BEFORE UPDATE ON public.surgeries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_users admin_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: bookings bookings_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: bookings bookings_implant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_implant_id_fkey FOREIGN KEY (implant_id) REFERENCES public.implants(id);


--
-- Name: bookings bookings_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_surgery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_surgery_id_fkey FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id);


--
-- Name: doctor_availability doctor_availability_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT doctor_availability_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_education doctor_education_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_education
    ADD CONSTRAINT doctor_education_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_experience doctor_experience_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_experience
    ADD CONSTRAINT doctor_experience_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_media doctor_media_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_media
    ADD CONSTRAINT doctor_media_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_notifications doctor_notifications_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notifications
    ADD CONSTRAINT doctor_notifications_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctor_publications doctor_publications_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_publications
    ADD CONSTRAINT doctor_publications_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings fk_bookings_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: bookings fk_bookings_hospital; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_hospital FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id);


--
-- Name: bookings fk_bookings_implant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_implant FOREIGN KEY (implant_id) REFERENCES public.implants(id);


--
-- Name: bookings fk_bookings_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: bookings fk_bookings_surgery; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_surgery FOREIGN KEY (surgery_id) REFERENCES public.surgeries(id);


--
-- Name: doctor_availability fk_doctor_availability; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_availability
    ADD CONSTRAINT fk_doctor_availability FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctor_education fk_doctor_education; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_education
    ADD CONSTRAINT fk_doctor_education FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctor_experience fk_doctor_experience; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_experience
    ADD CONSTRAINT fk_doctor_experience FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctor_media fk_doctor_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_media
    ADD CONSTRAINT fk_doctor_media FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctor_notifications fk_doctor_notifications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_notifications
    ADD CONSTRAINT fk_doctor_notifications FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: doctor_publications fk_doctor_publications; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctor_publications
    ADD CONSTRAINT fk_doctor_publications FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: patient_medical_history fk_patient_medical_history; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_medical_history
    ADD CONSTRAINT fk_patient_medical_history FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_testimonials fk_patient_testimonials_doctor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_testimonials
    ADD CONSTRAINT fk_patient_testimonials_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: patient_testimonials fk_patient_testimonials_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_testimonials
    ADD CONSTRAINT fk_patient_testimonials_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_vital_signs fk_patient_vital_signs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vital_signs
    ADD CONSTRAINT fk_patient_vital_signs FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_medical_history patient_medical_history_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_medical_history
    ADD CONSTRAINT patient_medical_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_testimonials patient_testimonials_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_testimonials
    ADD CONSTRAINT patient_testimonials_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: patient_testimonials patient_testimonials_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_testimonials
    ADD CONSTRAINT patient_testimonials_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;


--
-- Name: patient_vital_signs patient_vital_signs_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_vital_signs
    ADD CONSTRAINT patient_vital_signs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patients patients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

