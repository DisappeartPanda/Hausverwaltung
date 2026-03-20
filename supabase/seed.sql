-- ============================================================
-- NUR TEST DATEN (keine Tabellen erstellen!)
-- ============================================================

-- 1. VERMIETER (Landlord) erstellen
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'vermieter@test.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"role": "landlord"}',
    '{"full_name": "Max Vermieter", "organization_name": "Vermieter GmbH"}',
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = now();

-- 2. MIETER (Tenant) erstellen  
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mieter@test.de',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"role": "tenant"}',
    '{"full_name": "Maria Mieterin"}',
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Test1234!', gen_salt('bf')),
    email_confirmed_at = now();

-- 3. Organisation für Vermieter
INSERT INTO organizations (id, name, billing_email, created_at, updated_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Vermieter GmbH',
    'vermieter@test.de',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- 4. Organisation für Mieter
INSERT INTO organizations (id, name, billing_email, created_at, updated_at)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Mieter Organisation',
    'mieter@test.de',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- 5. Profil für Vermieter
INSERT INTO profiles (id, email, full_name, email_verified, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'vermieter@test.de',
    'Max Vermieter',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    full_name = 'Max Vermieter',
    email_verified = true;

-- 6. Profil für Mieter
INSERT INTO profiles (id, email, full_name, email_verified, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'mieter@test.de',
    'Maria Mieterin',
    true,
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    full_name = 'Maria Mieterin',
    email_verified = true;

-- 7. Vermieter als Owner
INSERT INTO organization_members (id, organization_id, user_id, role, is_default, created_at, updated_at)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'owner',
    true,
    now(),
    now()
) ON CONFLICT ON CONSTRAINT organization_members_organization_id_user_id_key DO UPDATE SET
    role = 'owner';

-- 8. Mieter als Tenant
INSERT INTO organization_members (id, organization_id, user_id, role, is_default, created_at, updated_at)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'tenant',
    true,
    now(),
    now()
) ON CONFLICT ON CONSTRAINT organization_members_organization_id_user_id_key DO UPDATE SET
    role = 'tenant';

-- 9. Beispiel-Objekt
INSERT INTO objects (id, organization_id, name, city, street, postal_code, created_at, updated_at)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Musterhaus Hauptstraße',
    'Berlin',
    'Hauptstraße 1',
    '10115',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- 10. Beispiel-Wohnung
INSERT INTO units (id, organization_id, object_id, title, floor, status, created_at, updated_at)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'Wohnung 1.1',
    '1. OG',
    'frei',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;