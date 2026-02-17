import fetch from 'node-fetch';

async function testCheckout() {
    try {
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan: 'Pro',
                price: '199.00',
            }),
        });

        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response Data:', data);

        if (response.ok && data.orderID) {
            console.log('Success: Order created successfully!');
        } else {
            console.error('Failure: Failed to create order.');
        }
    } catch (error) {
        console.error('Error during test:', error);
    }
}

testCheckout();
