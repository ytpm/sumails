interface SendSMSRequest {
  to: string;
  body: string;
}

interface SendSMSResponse {
  success: boolean;
  sid?: string;
  message?: string;
}

export const sendSMS = async (phoneNumber: string, message: string): Promise<SendSMSResponse> => {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: message,
      } as SendSMSRequest),
    });

    const data: SendSMSResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS');
    }

    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const sendVerificationCode = async (phoneNumber: string): Promise<SendSMSResponse> => {
  // Use hardcoded verification code for testing
  const verificationCode = "31337";
  
  const message = `Your Sumails verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
  
  const result = await sendSMS(phoneNumber, message);
  
  // In a real app, you'd store the verification code in your database
  // For now, we'll store it in sessionStorage (not secure for production)
  if (result.success) {
    sessionStorage.setItem(`verification_code_${phoneNumber}`, verificationCode);
    sessionStorage.setItem(`verification_code_timestamp_${phoneNumber}`, Date.now().toString());
  }
  
  return result;
};

export const verifyCode = (phoneNumber: string, enteredCode: string): boolean => {
  const storedCode = sessionStorage.getItem(`verification_code_${phoneNumber}`);
  const timestamp = sessionStorage.getItem(`verification_code_timestamp_${phoneNumber}`);
  
  if (!storedCode || !timestamp) {
    return false;
  }
  
  // Check if code is expired (10 minutes)
  const codeAge = Date.now() - parseInt(timestamp);
  const tenMinutes = 10 * 60 * 1000;
  
  if (codeAge > tenMinutes) {
    // Clean up expired code
    sessionStorage.removeItem(`verification_code_${phoneNumber}`);
    sessionStorage.removeItem(`verification_code_timestamp_${phoneNumber}`);
    return false;
  }
  
  const isValid = storedCode === enteredCode;
  
  if (isValid) {
    // Clean up used code
    sessionStorage.removeItem(`verification_code_${phoneNumber}`);
    sessionStorage.removeItem(`verification_code_timestamp_${phoneNumber}`);
  }
  
  return isValid;
}; 