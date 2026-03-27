const sendOTPEmail = async (email, otp, name) => {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_OTP_TEMPLATE_ID,
        user_id:     process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          name:     name || 'Customer',
          otp:      otp,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS OTP error: ${errorText}`);
    }

    console.log('✅ OTP email sent to:', email);
  } catch (err) {
    console.error('OTP email error:', err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };