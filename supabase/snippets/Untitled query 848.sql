-- Lokalen Test-User erstellen
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, raw_app_meta_data
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"role": "landlord"}'
);