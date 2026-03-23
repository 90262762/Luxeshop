import API from './api';
import config from '../config';

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script   = document.createElement('script');
    script.src     = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async ({ amount, orderId, user, onSuccess, onFailure }) => {
  const loaded = await loadRazorpay();
  if (!loaded) {
    onFailure('Razorpay SDK failed to load.');
    return;
  }

  try {
    // Step 1 — Create Razorpay order from backend
    const { data } = await API.post('/payment/create-order', {
      amount,
      orderId,
    });

    console.log('Razorpay order:', data);

    // Step 2 — Get key directly from env
   const key = config.RAZORPAY_KEY_ID;
    console.log('Using key:', key?.slice(0, 15));

    if (!key) {
      onFailure('Razorpay key not found in environment');
      return;
    }

    if (!data.id) {
      onFailure('Razorpay order ID not received from backend');
      return;
    }

    // Step 3 — Open Razorpay modal
    const options = {
      key,
      amount:      data.amount,       // in paise — from backend
      currency:    data.currency,
      name:        'LuxeShop',
      description: 'Order Payment',
      order_id:    data.id,           // Razorpay order ID e.g. order_STX...
      prefill: {
        name:    user?.name  || '',
        email:   user?.email || '',
        contact: '',
      },
      notes: {
        mongodb_order_id: orderId,    // your MongoDB order ID
      },
      theme: {
        color: '#e94560',
      },
      handler: async function(response) {
        console.log('Payment success:', response);
        try {
          // Step 4 — Verify signature on backend
          const { data: verified } = await API.post('/payment/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            orderId,              // MongoDB order ID to update
          });
          console.log('Verified:', verified);
          onSuccess(verified);
        } catch (err) {
          console.error('Verify error:', err.response?.data);
          onFailure(err.response?.data?.message || 'Payment verification failed');
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Modal dismissed');
          onFailure('Payment cancelled by user');
        },
        escape:           true,
        backdropclose:    false,
        animation:        true,
        confirm_close:    true,
        handleback:       true,
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', async function(response) {
      console.error('Payment failed event:', response.error);
      try {
        await API.post('/payment/failed', {
          orderId,
          error: response.error,
        });
      } catch (e) { /* ignore */ }
      onFailure(response.error?.description || 'Payment failed');
    });

    rzp.open();

  } catch (err) {
    console.error('Payment initiation error:', err.response?.data || err.message);
    onFailure(err.response?.data?.message || err.message || 'Payment failed');
  }
};