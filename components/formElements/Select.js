import React from 'react'

export default function Select({label}) {
  return (
    <div className='relative'>
        <p className='pt-0  pr-2 pb-0 pl-2 -mt-3 mr-0 mb-0 ml-2 font-medium text-gray-600 bg-white  '>
            {label}
        </p>
        <select 
          
          className='border placeholder-gray-400 focus-outline-none focus:border-black w-full pt-4 pr-4 pb-4 pl-4 mr-0 mt-0 ml-0 text-base block bg-white border-gray-300 rounder-md '
        >
           <option >
            optionLabel
           </option>
        </select>
    </div>
  )
}

