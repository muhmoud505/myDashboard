'use client'
import { createContext, useEffect, useReducer } from "react"




export  const Store=createContext();
const initialState={
    showNavModal:false,
    pageLevelLoader:true,
    user:null,
    isAuthUser:null

}
function globalReducer(state,action){

switch(action.type){
    case 'SET_SHOW_NAV_MODAL':
        return {...state,showNavModal:action.payload};
    case 'SET_COMPONENT_LEVEL_LOADER':
        return{
            ...state,pageLevelLoader:action.payload
        };
    case 'SET_USER':
        return{...state,user:action.payload}
    case 'IS_AUTH_USER':
        return {...state,isAuthUser:action.payload}

}}

export default function StoreProvider({children,initialUserState}){
    const [state,dispatch]=useReducer(globalReducer,{
        ...initialState,user:initialUserState?.user||null,
        isAuthUser:initialUserState?.isAuthUser||false,
        token:initialUserState?.token
    });
    console.log(initialUserState)
    useEffect(()=>{
   console.log('state.user:',state.user)
        if(typeof window!=='undefined' &&window.localStorage){

            if(state.user){
             localStorage.setItem('user',JSON.stringify(state.user))
            }else{
             localStorage.removeItem('user')
            }
        }
       
    },[state.user])
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userData = JSON.parse(localStorage.getItem('user'));
          console.log('userData from localStorage:', userData); // Debugging
          if (userData) {
            dispatch({ type: 'SET_USER', payload: userData });
            dispatch({ type: 'IS_AUTH_USER', payload: true });
          }
        }
      }, []);
return(
    <Store.Provider value={{state,dispatch}}>
        {children}
    </Store.Provider>
)
}




