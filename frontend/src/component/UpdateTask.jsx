import '../style/addtask.css'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function UpdateTask(){
    const [taskData, setTaskData] = useState({ title: '', description: '' });
    const navigate = useNavigate();
    const { id } = useParams();

    const getTask = async (id) => {
        let task = await fetch(`https://mern-backend-qgfh.onrender.com/task/${id}`, {
            credentials: 'include'   // 👈 IMPORTANT
        });

        task = await task.json();

        if (task.result) {
            setTaskData(task.result);
        }
    };

    useEffect(() => {
        getTask(id);
    }, [id]);   // 👈 dependency fix

    const updateTask = async (e) => {
        e.preventDefault();

        try {
            let response = await fetch(`https://mern-backend-qgfh.onrender.com/update-task`, {
                method: 'PUT',
                credentials: 'include',   // 👈 IMPORTANT
                body: JSON.stringify(taskData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let result = await response.json();

            if (response.ok && result.success) {
                navigate('/');
            } else {
                console.error("Failed to update task", result);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    return(
        <div className="container">
            <h1>Update Task</h1>

            <form>
                <label>Title</label>
                <input
                    value={taskData?.title || ''}
                    onChange={(e)=>setTaskData({...taskData, title:e.target.value})}
                    type="text"
                    placeholder="enter task title"
                />

                <label>Description</label>
                <textarea
                    value={taskData?.description || ''}
                    onChange={(e)=>setTaskData({...taskData, description:e.target.value})}
                    rows={4}
                    placeholder="Enter task description"
                />

                <button onClick={updateTask} className="btn">
                    Update Task
                </button>
            </form>
        </div>
    )
}

export default UpdateTask;