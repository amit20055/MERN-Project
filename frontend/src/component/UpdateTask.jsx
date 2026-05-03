import '../style/addtask.css'
import {useEffect  , useState, } from 'react'
import { useNavigate, useParams,} from 'react-router-dom';

function UpdateTask(){
    const [taskData, setTaskData] = useState({ title: '', description: '' });
    const navigate = useNavigate()

  
    const {id} = useParams();

   useEffect(()=>{
    getTask(id);
   },[])

    const getTask= async (id) => {
        let task = await fetch(`http://localhost:7700/task/`+id, {
            credentials: 'include'
        });
        task = await task.json();
        if(task.result){
            setTaskData(task.result);

        }
        
    };

    const updateTask = async (e) => {
        e.preventDefault();
        console.log("function called", taskData);
        
        try {
            let response = await fetch(`http://localhost:7700/update-task`, {
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
        <div  className="container">
            <h1>Update Task</h1>
        <form>
            <label htmlFor="">Title</label>
            <input value={taskData?.title || ''}  onChange={(event)=>setTaskData({...taskData, title:event.target.value})} type="text" name="title" placeholder="enter task title" />
            <label htmlFor="">Description</label>
            <textarea value={taskData?.description || ''} onChange={(event)=>setTaskData({...taskData, description:event.target.value})} rows={4} name="description" placeholder="Enter task description" id=""></textarea>

            <button onClick={updateTask} className="btn">Update Task</button>
        </form>
        </div>

    )
}
export default UpdateTask;