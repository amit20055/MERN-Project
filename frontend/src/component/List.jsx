import { Fragment, useEffect } from "react";
import { useState } from "react";
import'../style/list.css';
import { Link } from "react-router-dom";


function List() {
    const [taskData, setTaskData] = useState();
    const[selectedTask,setSelectedTask]=useState([]);

    const [searchTerm, setSearchTerm] = useState(''); // 👈 Search term state

    // Filter tasks based on search term
    const filteredTasks = taskData?.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        // 1. Frontend se turant hata do (Instant feedback)
        const updatedTasks = taskData.filter(task => !selectedTask.includes(task._id));
        setTaskData(updatedTasks);

        // 2. Backend ko delete request bhejo
        let item = await fetch('/api/delete-multiple', { // removed trailing slash
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
            getListData(); // Refresh if failed
        }

    }
    
    // Priority color helper
    const getPriorityStyle = (priority) => {
        if(priority === 'High') return { borderLeft: '8px solid #ff4d4d' };
        if(priority === 'Medium') return { borderLeft: '8px solid #ffd700' };
        return { borderLeft: '8px solid #2ed573' };
    }

    // Overdue deadline check helper
    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        const now = new Date();
        const taskDate = new Date(dueDate);
        return taskDate.getTime() < now.getTime();
    }

    // Calculate stats for Dashboard
    const total = taskData ? taskData.length : 0;
    const high = taskData ? taskData.filter(t => t.priority === 'High').length : 0;
    const med = taskData ? taskData.filter(t => t.priority === 'Medium').length : 0;
    const low = total - high - med;

    return (
        <div className="List-container">
            <h1>Task Dashboard</h1>

            {/* 👈 Progress Dashboard Section */}
            <div style={{
                display: 'flex', 
                gap: '20px', 
                marginBottom: '30px', 
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: '#8991e9', 
                    color: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    minWidth: '150px',
                    textAlign: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{margin: '0', fontSize: '14px'}}>Total Tasks</h3>
                    <p style={{margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold'}}>{total}</p>
                </div>

                <div style={{
                    background: '#ff4d4d', 
                    color: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    minWidth: '150px',
                    textAlign: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{margin: '0', fontSize: '14px'}}>High Priority</h3>
                    <p style={{margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold'}}>{high}</p>
                </div>

                <div style={{
                    background: '#8791b0', 
                    color: 'white', 
                    padding: '20px', 
                    borderRadius: '10px', 
                    minWidth: '150px',
                    textAlign: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{margin: '0', fontSize: '14px'}}>Others</h3>
                    <p style={{margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold'}}>{med + low}</p>
                </div>
            </div>
            
            {/* Search Bar */}
            <div style={{marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                <input 
                    type="text" 
                    placeholder="Search tasks by title or description..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}
                />
            </div>

            <button onClick={deleteMultiple} className="delete-btn delete-multiple">Delete</button>
            <div className="task-list">
                <div className="task-header-row">
                    <div className="list-header"> <input onChange={selectAll} type="Checkbox" checked={selectedTask.length === (taskData ? taskData.length : 0) && (taskData ? taskData.length : 0) > 0}/> </div>
                    <div className="list-header">S.No</div>
                    <div className="list-header">Title</div>
                    <div className="list-header">Description</div>
                    <div className="list-header">Due Date</div>
                    <div className="list-header">Priority</div>
                    <div className="list-header">Actions</div>
                </div>

                <div className="task-items-container">
                    {
                        filteredTasks && filteredTasks.map((item, index) => {
                            const overdue = isOverdue(item.dueDate);
                            return (
                                <div className="task-row" key={item._id} style={getPriorityStyle(item.priority)}>
                                    <div className="list-item select-cell">
                                        <input onChange={()=>selectSingleItem(item._id)} checked={selectedTask.includes(item._id)}  type="checkbox"/>
                                    </div>
                                    <div className="list-item sn-cell">
                                        <span className="mobile-label">S.No:</span>
                                        <span className="cell-value">{index + 1}</span>
                                    </div>
                                    <div className="list-item title-cell">
                                        <span className="mobile-label">Title:</span>
                                        <span className="cell-value">{item.title}</span>
                                    </div>
                                    <div className="list-item desc-cell">
                                        <span className="mobile-label">Description:</span>
                                        <span className="cell-value">{item.description}</span>
                                    </div>
                                    <div className="list-item date-cell" style={overdue ? { color: '#ff4d4d', fontWeight: 'bold' } : {}}>
                                        <span className="mobile-label">Due Date:</span>
                                        <span className="cell-value" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                                            {item.dueDate ? new Date(item.dueDate).toLocaleString() : 'No Deadline'}
                                            {overdue && (
                                                <span style={{ 
                                                    fontSize: '11px', 
                                                    background: '#ff4d4d', 
                                                    color: 'white', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Overdue
                                                </span>
                                            )}
                                         </span>
                                    </div>
                                    <div className="list-item priority-cell" style={{
                                        fontWeight: '900', 
                                        color: item.priority === 'High' ? '#ff3333' : item.priority === 'Medium' ? '#ffd700' : '#00ff7f',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)' // 👈 Shadow for better contrast
                                    }}>
                                        <span className="mobile-label">Priority:</span>
                                        <span className="cell-value">{item.priority || 'Low'}</span>
                                    </div>
                                    <div className="list-item actions-cell">
                                        <span className="mobile-label">Actions:</span>
                                        <div className="action-buttons">
                                            <button className="delete-btn" onClick={()=>deleteTask(item._id)}>Delete</button>
                                            <Link className="update-btn" to={"update/"+item._id}>Update</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}
export default List;
