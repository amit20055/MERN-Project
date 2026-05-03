import '../style/addtask.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';


function SignUp(){
    const[userData,setUserData]=useState();
    const navigate=useNavigate()
    useEffect(()=>{
            if(localStorage.getItem('login')){
                 navigate('/')
    
            }
        })

   const handleSignUp=async()=>{
    console.log(userData);
    let result=await fetch('http://localhost:7700/signup',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        result =await result.json()
        if(result.success){
            // navigate("/")
            console.log(result);
            document.cookie="token="+result.token
             localStorage.setItem('login', userData.email)
            navigate('/')
        }else{
            alert("Try after sometime")
        }
    
   }

   
   
    return(
        <div className="container">
            <h1>Sign Up</h1>
        <form>
            <label htmlFor="">Name</label>
            <input
             onChange={(event)=>setUserData({...userData,name:event.target.value})}
              type="text" name="title" placeholder="Enter User Name" />

            <label htmlFor="">Email</label>
            <input 
            onChange={(event)=>setUserData({...userData,email:event.target.value})}
             type="text" name="email" placeholder="Enter User Email" />

            <label htmlFor="">Password</label>
            <input
            onChange={(event)=>setUserData({...userData,password:event.target.value})}
              type="text" name="password" placeholder="Enter User password" /> 
            
            <button onClick={handleSignUp} type='button' className="btn">SignUp</button>
             <Link className='link' to="/login" >Login</Link>

        </form>
        </div>

    )
}
export default SignUp;