import { Link, useNavigate } from 'react-router-dom'
import '../style/navbar.css'
import { useEffect, useState } from 'react';
function Navbar(){
    const [login,setLogin]=useState(localStorage.getItem('login'))
    const navigate=useNavigate();
    const logout=()=>{
        localStorage.removeItem('login')
       setLogin(null)
      setTimeout(()=>{
         navigate('/login')

      },0)
    }

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(()=>{
        const handlestorage=()=>{
            setLogin(localStorage.getItem('login'))

        }
        window.addEventListener("LocalStorage-change",handlestorage)

        return()=>{
            window.removeEventListener("LocalStorage-change",handlestorage)
        }
    },[])

    return(
        <nav className="navbar">
            <div className='Logo'>To Do App</div>
                <ul className='nav-Links'>
                    <li onClick={toggleTheme} style={{cursor: 'pointer', fontSize: '20px'}}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </li>
                    {
                       login?
                       <>
                       <li><Link to="/">List</Link></li>
                    <li><Link to="/add">Add Task</Link></li>
                    <li><Link onClick={logout} >LogOut</Link></li>
                       </> :null
                    }
                    
                </ul>
           
        </nav>
        )
}
export default Navbar;