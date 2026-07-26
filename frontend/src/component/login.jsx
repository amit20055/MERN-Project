import { Link, useNavigate } from 'react-router-dom';
import '../style/addtask.css'
import { useEffect, useState } from 'react'


function Login(){
    const[userData,setUserData]=useState();
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('login')){
             navigate('/')

        }
    }, [navigate])

     const handlelogin=async()=>{
    console.log(userData);
    let result=await fetch('/api/login',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        result =await result.json()
        if(result.success){
            
            // SameSite=None; Secure is required for cross-origin cookies (Render + Vercel)
            document.cookie = "token=" + result.token + "; path=/; SameSite=None; Secure";
            localStorage.setItem('login', userData.email);
            localStorage.setItem('token', result.token); // Store token for Authorization header fallback
            window.dispatchEvent(new Event('LocalStorage-change'));
            window.location.href = '/';
        }else{
            alert("Wrong User Credentials")
        }
    
   }
   
    return(
        <div className="container">
            <h1>Login</h1>
        <form>
            
            <label htmlFor="">Email</label>
            <input 
            onChange={(event)=>setUserData({...userData,email:event.target.value})}
             type="text" name="email" placeholder="Enter User Email" />

            <label htmlFor="">Password</label>
            <input
            onChange={(event)=>setUserData({...userData,password:event.target.value})}
              type="password" name="password" placeholder="Enter User password" /> 
            
            <button onClick={handlelogin} type='button' className="btn">Login</button>
            <Link className='link' to="/signup" >SignUp</Link>

        </form>
        </div>

    )
}
export default Login;