import './style/App.css'
import Navbar from './component/NavBar.jsx'
import { Route, Routes } from 'react-router-dom'
import AddTask from './component/AddTask.jsx'
import List from './component/List.jsx'
import UpdateTask from './component/UpdateTask.jsx'
import SignUp from './component/Signup.jsx'
import Login from './component/login.jsx'
import Protected from './component/Protected.jsx'

function App() {

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path='/' element={<Protected><List/></Protected>}/>
      <Route path='/add' element={<Protected><AddTask/></Protected>}/>
      <Route path='/update/:id' element={<UpdateTask/>}/>
      <Route path='/signup' element={<SignUp/>}/>
       <Route path='/login' element={<Login/> }/>
       

    </Routes>
      
      
    </>
  )
}

export default App
