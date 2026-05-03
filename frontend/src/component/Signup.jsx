import '../style/addtask.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

function SignUp(){
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    useEffect(()=>{
        if(localStorage.getItem('login')){
            navigate('/')
        }
    }, [navigate])

    const handleSignUp = async () => {
        console.log(userData);

        let result = await fetch('/api/signup', {
            method: 'POST',
            credentials: 'include',   
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        result = await result.json();

        if(result.success){
            console.log("Signup successful, redirecting to login...");
            alert("Signup successful! Please login.");
            navigate('/login');
        } else {
            alert("Try after sometime");
        }
    }

    return(
        <div className="container">
            <h1>Sign Up</h1>
            <form>
                <label>Name</label>
                <input
                    onChange={(e)=>setUserData({...userData, name:e.target.value})}
                    type="text"
                    placeholder="Enter User Name"
                />

                <label>Email</label>
                <input 
                    onChange={(e)=>setUserData({...userData, email:e.target.value})}
                    type="text"
                    placeholder="Enter User Email"
                />

                <label>Password</label>
                <input
                    onChange={(e)=>setUserData({...userData, password:e.target.value})}
                    type="text"
                    placeholder="Enter User password"
                /> 
                
                <button onClick={handleSignUp} type='button' className="btn">
                    SignUp
                </button>

                <Link className='link' to="/login">Login</Link>
            </form>
        </div>
    )
}

export default SignUp;