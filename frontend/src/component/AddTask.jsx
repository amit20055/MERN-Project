import '../style/addtask.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function AddTask(){
    const [taskData, setTaskData] = useState();

    const navigate = useNavigate();

    const handleAddTask=async()=>{
      
        console.log(taskData);
        let result=await fetch('http://localhost:7700/add-task',{
            method: 'POST',
            credentials:'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        result =await result.json()
        if(result.success){
            navigate("/")
            console.log("new task added successfully");
        }else{
            alert("try after some time")
        }
    }

    return(
        <div  className="container">
            <h1>Add New Task</h1>
        <form>
            <label htmlFor="">Title</label>
            <input onChange={(event)=>setTaskData({...taskData, title:event.target.value})} type="text" name="title" placeholder="enter task title" />
            <label htmlFor="">Description</label>
            <textarea onChange={(event)=>setTaskData({...taskData, description:event.target.value})} rows={4} name="description" placeholder="Enter task description" id=""></textarea>

            <button type='button' onClick={handleAddTask} className="btn">Add New Task</button>
        </form>
        </div>

    )
}
export default AddTask;