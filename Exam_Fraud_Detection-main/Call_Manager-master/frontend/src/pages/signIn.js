import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { signInApi, googleSignInApi } from '../api/api'

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Load the Google API script
  useEffect(() => {
    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        initializeGoogleSignIn();
      }
    };

    return () => {
      const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      try {
        // Use a web application client ID from Google Cloud Console
        // This client ID is for web applications, not for Android/iOS
        window.google.accounts.id.initialize({
          
          client_id: '1018610670162-8rv5bar6jo564jrf7lqqina0tbkvbt7p.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          // This is important for development environments
          itp_support: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'signin_with',
            width: 250,
            logo_alignment: 'center'
          }
        );

        // Also display the One Tap UI for better UX
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap not displayed', notification.getNotDisplayedReason() || notification.getSkippedReason());
          }
        });
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setError("Failed to initialize Google Sign-In. Please try again later.");
      }
    }
  };

  async function SignInFunction() {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = {
        email: email,
        password: password
      }
      const response = await signInApi(user);
      
      if (response.data && response.data.error) {
        setError(response.data.message || 'Failed to sign in');
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error.message || 'Failed to sign in');
        setLoading(false);
        return;
      }

      console.log('Sign in successful:', response);
      navigate("/");
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An error occurred during sign in');
      setLoading(false);
    }
  }

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      console.log("Google response:", response);
      const idToken = response.credential;
      
      if (!idToken) {
        setError('Failed to get Google credentials');
        setLoading(false);
        return;
      }
      
      const googleResponse = await googleSignInApi(idToken);
      
      if (googleResponse.data && googleResponse.data.error) {
        setError(googleResponse.data.message || 'Failed to sign in with Google');
        setLoading(false);
        return;
      }

      if (googleResponse.error) {
        setError(googleResponse.error.message || 'Failed to sign in with Google');
        setLoading(false);
        return;
      }

      console.log('Google sign in successful:', googleResponse);
      navigate("/");
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('An error occurred during Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center w-[50vw] m-auto mt-[20vh]'>
      <p className='text-center text-2xl font-bold'>Sign In</p>
      
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4'>
          {error}
        </div>
      )}
      
      <div className='flex justify-between mt-5'>
        <label className='font-bold'>Email</label>
        <input 
          className='rounded-sm border-[1px] border-black p-1' 
          type='text' 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className='flex justify-between mt-5'>
        <label className='font-bold'>Password</label>
        <input 
          className='rounded-sm border-[1px] border-black p-1' 
          type='password' 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              SignInFunction();
            }
          }}
        />
      </div>
      <button 
        className={`mt-5 ${loading ? 'bg-gray-400' : 'bg-blue-600'} w-[120px] text-white p-1 rounded-md text-center`} 
        onClick={SignInFunction}
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      
      <div className='mt-4 flex justify-center'>
        <div className='border-t border-gray-300 w-full mt-3'></div>
        <div className='mx-4 text-gray-500'>OR</div>
        <div className='border-t border-gray-300 w-full mt-3'></div>
      </div>
      
      <div className='mt-4 flex justify-center'>
        <div id="google-signin-button"></div>
      </div>
      
      <div className='mt-4 text-center'>
        Don't have an account? <a href="/signup" className='text-blue-600'>Sign Up</a>
      </div>
    </div>
  )
}

export default SignIn