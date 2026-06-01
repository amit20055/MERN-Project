import '../style/addtask.css'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function UpdateTask(){
    const [taskData, setTaskData] = useState({ title: '', description: '' });
    const navigate = useNavigate();
    const { id } = useParams();

    const getTask = async (id) => {
        let task = await fetch(`/api/task/${id}`, {
            credentials: 'include'   
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
            let response = await fetch(`/api/update-task`, {
                method: 'PUT',
                credentials: 'include',  
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

                <label>Priority</label>
                <select 
                    value={taskData?.priority || 'Low'} 
                    onChange={(e)=>setTaskData({...taskData, priority:e.target.value})}
                    style={{width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc'}}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                <label>Due Date & Time</label>
                <input
                    value={taskData?.dueDate || ''}
                    onChange={(e)=>setTaskData({...taskData, dueDate:e.target.value})}
                    type="datetime-local"
                />

                <button onClick={updateTask} className="btn">
                    Update Task
                </button>
            </form>
        </div>
    )
}

export default UpdateTask;