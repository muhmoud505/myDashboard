'use client'; // Mark this as a Client Component

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/context';
import { loginFormControls } from '@/utils';
import Input from '@/components/formElements/Input';

// Initial form data
const initialFormData = {
  email: '',
  password: '',
};

export default function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const { state, dispatch } = useContext(Store); // Use Store context
  const [isLoading,setIsLoading]=useState(false)
  const router = useRouter();
  const[error,setError]=useState('')

  // Destructure state for easier access
  const { pageLevelLoader, isAuthUser } = state;

 const [fieldErrors,setFieldErrors]=useState({});

 const validateForm=()=>{
  const errors={};
  if(!formData.email){
    errors.email='Email is Required';
  }else if(!/\S+@\S+\.\S+/.test(formData.email)){
    errors.email='Email is invalid';
  }
  if(!formData.password){
    errors.password='Password is required';
  }
  setFieldErrors(errors);
  return Object.keys(errors).length===0
 }


  // Handle form submission
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError('');
    if(!validateForm())return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
  
      console.log('API Response:', response);
      const data=await response.json();
  
      if (data.success) {
       dispatch({type:'SET_USER',payload:data.data.user});
       dispatch({type:'IS_AUTH_USER',payload:true});
       router.push('/dashboard');
        
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError(`An error occurred during Loggin in,${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Redirect if the user is already authenticated
  useEffect(() => {
  
     if (isAuthUser) router.push('/dashboard');
    console.log(isAuthUser)
  }, [state.isAuthUser,router]);

  return (
    <div className="bg-white dark:bg-gray-900 relative">
    <div className="flex flex-col items-center justify-between pt-0 pr-10 pb-0 pl-10 mt-8 mr-auto xl:px-5 lg:flex-row">
      <div className="flex flex-col justify-center items-center w-full pr-10 pl-10 lg:flex-row">
        <div className="w-full mt-10 mr-0 mb-0 ml-0 relative max-w-2xl lg:mt-0 lg:w-5/12">
          <div className="flex flex-col items-center justify-start pt-10 pr-10 pb-10 pl-10 bg-white dark:bg-gray-800 shadow-2xl rounded-xl relative z-10">
            <p className="w-full text-4xl font-medium text-center font-serif dark:text-white">
              Sign in to your account
            </p>
            <form onSubmit={handleLoginSubmit} className="w-full mt-6 mr-0 mb-0 ml-0 relative space-y-8">
              {loginFormControls.map((controlItem) => (
                <div key={controlItem.id}>
                  <Input
                    type={controlItem.type}
                    placeholder={controlItem.placeholder}
                    label={controlItem.label}
                    value={formData[controlItem.id]}
                    onChange={(event) => {
                      setFormData({
                        ...formData,
                        [controlItem.id]: event.target.value,
                      });
                      // Clear error when user types
                      if (fieldErrors[controlItem.id]) {
                        setFieldErrors({
                          ...fieldErrors,
                          [controlItem.id]: '',
                        });
                      }
                    }}
                  />
                  {fieldErrors[controlItem.id] && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors[controlItem.id]}</p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center bg-black px-6 py-4 text-lg 
                text-white transition-all duration-200 ease-in-out focus:shadow font-medium uppercase tracking-wide
                disabled:opacity-50 dark:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Logging In...' : 'Login'}
              </button>
              <div className="flex flex-col gap-2">
                <p className="dark:text-white">New to website?</p>
                <button 
                  type="button"
                  className="inline-flex w-full items-center justify-center bg-gray-200 dark:bg-gray-700 px-6 py-4 text-lg
                  text-gray-900 dark:text-white transition-all duration-200 ease-in-out focus:shadow font-medium uppercase tracking-wide"
                  onClick={() => router.push('/register')}
                >
                  Register
                </button>
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
  
