import { Fragment, useEffect } from "react";
import { useState } from "react";
import'../style/list.css';
import { Link } from "react-router-dom";


function List() {
    const [taskData, setTaskData] = useState();
    const[selectedTask,setSelectedTask]=useState([]);

    const getListData = async () => {
        let list = await fetch(`/api/tasks?t=${new Date().getTime()}`,{
            credentials:'include'
        });
        list = await list.json()
        if (list.success) {
            setTaskData(list.result)
        }else{
            alert("try after sometime")
        }

    }

    useEffect(() => {
        getListData();
    }, []);
    const deleteTask = async (id) => {
        let item = await fetch('/api/delete/'+id, {
            method: 'delete',
             credentials:'include',
        });
        item = await item.json();
        if (item.success) {
            getListData(); 
        }else{
            alert("try after sometime")
        }

    };

    const selectAll=(event)=>{
        if(event.target.checked){
            let items=taskData.map((item)=>item._id)
           setSelectedTask(items)
        }else{
            setSelectedTask([])
        } 
        

    }

    const selectSingleItem=(id)=>{
        console.log(id)
        if(selectedTask.includes(id)){
            let items = selectedTask.filter((item)=>item!=id);
            setSelectedTask(items)
        }else{
            setSelectedTask([id,...selectedTask])
        }

    }
    const deleteMultiple=async()=>{
        let item = await fetch('/api/delete-multiple/', {
            method: 'delete',
             credentials:'include',
            body:JSON.stringify(selectedTask),
            headers:{
                'Content-Type':'application/json'
            }
        });
        item = await item.json();
        if (item.success) {
            getListData(); 
            setSelectedTask([]);
        }else{
            alert("try after sometime")
        }

    }
    

    return (
        <div className="List-container">
            <h1>Task List</h1>
            <button onClick={deleteMultiple} className="delete-btn delete-multiple">Delete</button>
            <ul className="task-list">
                <li className="list-header"> <input onChange={selectAll} type="Checkbox"/> </li>
                <li className="list-header">S.No</li>
                <li className="list-header">Title</li>
                <li className="list-header">Description</li>
                <li className="list-header">Actions</li>

                {
                    taskData && taskData.map((item, index) => (
                        <Fragment key={item._id}>
                            <li className="list-item"><input onChange={()=>selectSingleItem(item._id)} checked={selectedTask.includes(item._id)}  type="checkbox"/></li>
                            <li className="list-item">{index + 1}</li>
                            <li className="list-item">{item.title}</li>
                            <li className="list-item">{item.description}</li>
                            <li className="list-item">
                                <button className="delete-btn" onClick={()=>deleteTask(item._id)}>Delete</button>
                                <Link className="update-btn" to={"update/"+item._id}>Update</Link>
                            </li>
                        </Fragment>
                    ))
      }
            </ul>
        </div>
    );
}
export default List;
