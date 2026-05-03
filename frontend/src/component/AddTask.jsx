import '../style/addtask.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function AddTask(){
    const [taskData, setTaskData] = useState({ title: '', description: '' }); // ✅ FIX

    const navigate = useNavigate();

    const handleAddTask = async () => {
        console.log(taskData);

        let result = await fetch('https://mern-backend-qgfh.onrender.com/add-task', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        result = await result.json();

        if(result.success){
            navigate("/");
            console.log("new task added successfully");
        } else {
            alert("try after some time");
        }
    }

    return(
        <div className="container">
            <h1>Add New Task</h1>

            <form>
                <label>Title</label>
                <input
                    value={taskData.title}
                    onChange={(e)=>setTaskData({...taskData, title:e.target.value})}
                    type="text"
                    placeholder="enter task title"
                />

                <label>Description</label>
                <textarea
                    value={taskData.description}
                    onChange={(e)=>setTaskData({...taskData, description:e.target.value})}
                    rows={4}
                    placeholder="Enter task description"
                />

                <button type='button' onClick={handleAddTask} className="btn">
                    Add New Task
                </button>
            </form>
        </div>
    )
}

export default AddTask;