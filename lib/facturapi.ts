import Facturapi from 'facturapi';

const apiKey = process.env.TEST_SECRET_KEY_FACTURAAPI || process.env.FACTURAPI_KEY;

if (!apiKey) {
    console.warn('FACTURAPI_KEY is not set in environment variables');
}

export const facturapi = new Facturapi(apiKey || 'sk_test_mock');
