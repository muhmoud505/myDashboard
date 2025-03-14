import StoreProvider from "@/context";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import Navbar from "../navbar/navbar";
import { ThemeProvider } from "next-themes";

export default async function AppWrapper({children}){
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let user = null;
    let isAuthUser = false;
   
    if(token){
        try {
            const decodedToken = jwtDecode(token);
            user = {
                id: decodedToken.userId,
                email: decodedToken.email,
                isAdmin: decodedToken.isAdmin
                ,image:decodedToken.image
            };
            isAuthUser = true;
        } catch (error) {
            console.log('Error decoding token', error.message);
        }
    }

    return(
        <StoreProvider initialUserState={{user, isAuthUser, token}}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Navbar/>
                {children}
            </ThemeProvider>
        </StoreProvider>
    );
}