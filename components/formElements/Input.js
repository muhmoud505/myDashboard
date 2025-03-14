import React from 'react'

 export default function Input({type,value, placeholder,onChange,label}){
  return (
    <div className='relative' >
        <p className='pt-0 pr-2 pb-0 pl-2 mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600 bg-white    '>
            {label}
        </p>
        <input
            placeholder={placeholder}
            type={type||'text'}
            value={value}
            onChange={onChange}
            className='border placeholder-gray-400 focus:outline-none focus:border-none w-full pt-4  pr-4 pb-4 pl-4 mr-0 ml-0 text-black block bg-white border-gray-300 rounded-md   '
        />

    </div>
  )
}

