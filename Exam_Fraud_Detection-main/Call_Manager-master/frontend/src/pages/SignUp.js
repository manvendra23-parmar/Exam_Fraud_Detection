import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { signUpApi, googleSignInApi } from '../api/api'

function SignUp() {
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
        window.google.accounts.id.initialize({
          client_id: '1018610670162-8rv5bar6jo564jrf7lqqina0tbkvbt7p.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
          // This is important for development environments
          itp_support: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signup-button'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'signup_with',
            width: 250,
            logo_alignment: 'center'
          }
        );
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setError("Failed to initialize Google Sign-In. Please try again later.");
      }
    }
  };

  async function SignUpFunction() {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = {
        email: email,
        password: password
      }
      const response = await signUpApi(user);
      
      if (response.data && response.data.error) {
        setError(response.data.message || 'Failed to sign up');
        setLoading(false);
        return;
      }

      if (response.error) {
        setError(response.error.message || 'Failed to sign up');
        setLoading(false);
        return;
      }

      console.log('Sign up successful:', response);
      navigate("/");
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An error occurred during sign up');
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
      <p className='text-center text-2xl font-bold'>Sign Up</p>
      
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
        />
      </div>
      <button 
        className={`mt-5 ${loading ? 'bg-gray-400' : 'bg-blue-600'} w-[120px] text-white p-1 rounded-md text-center`} 
        onClick={SignUpFunction}
        disabled={loading}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
      
      <div className='mt-4 flex justify-center'>
        <div className='border-t border-gray-300 w-full mt-3'></div>
        <div className='mx-4 text-gray-500'>OR</div>
        <div className='border-t border-gray-300 w-full mt-3'></div>
      </div>
      
      <div className='mt-4 flex justify-center'>
        <div id="google-signup-button"></div>
      </div>
      
      <div className='mt-4 text-center'>
        Already have an account? <a href="/signin" className='text-blue-600'>Sign In</a>
      </div>
    </div>
  )
}

export default SignUp